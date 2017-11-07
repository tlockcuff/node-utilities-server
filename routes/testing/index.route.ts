import { Request, Response } from "express"
import Socket from "./IO"
import { resolve, join, basename } from "path"
import { existsSync, writeFile } from "fs"
import * as multer from "multer"
import * as v4 from "uuid/v4"
import * as AdmZip from "adm-zip"
import { spawn } from "child_process"
import TempDir from "./TempDir"
import { cleanDirectory } from "./util"
import Statuses from "./statuses"
import Meta from "./meta"
import { Result, Module } from "./defs"

const TESTS = {
    path: resolve("./temp/tests"),
    extracts: resolve('./temp/tests/zips')
}

const testUploader = multer({
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            // todo: create a dictionary by filename and pass the TempDir as the value for cleanup.
            cb(null, file.originalname)
        },
        destination: (req, file, cb) => {
            cb(null, new TempDir(TESTS.extracts).path)
        }
    }),
    fileFilter: (req, file, cb) => {
        let file_go_through = true
        if (!/(zip)|(octet-stream)/.test(file.mimetype)) { file_go_through = false }
        cb((file_go_through) ? null : new Error("File must be a zip archive"), file_go_through)
    }
}).single("tests")

export function post(req: Request, res: Response) {
    testUploader(req, res, function (error) {
        if (error) { res.json(error) }
        // extract the zip and then cleanup.
        const zip = new AdmZip(req.file.path)
        const path = resolve(join(TESTS.path, req.file.filename.replace('.zip', '')))
        console.log(`extracting tests to ${path}`)
        zip.extractAllToAsync(path, true, (err) => {
            if (err) { res.status(400).end() }
            let m = new Meta()
            m.last.updated = new Date()
            m.saveToFile(path)
            res.json(Statuses.READY)
        })
    })
}

export function get(req: Request, res: Response) {
    const { id, download } = req.query
    if (id && download) {
        const filepath = join(TESTS.path, id)
        let temp = new TempDir()
        let zip = new AdmZip()
        if (existsSync(filepath)) {
            zip.addLocalFolder(filepath)
            let zip_path = join(temp.path, `${id}.zip`)
            zip.writeZip(zip_path)
            res.download(zip_path)
            res.once('finish', () => {
                temp.Destroy()
            })
        } else {
            res.status(400).json({ error: `Test '${id}' does not exist.` })
        }
    } else if (id) {
        const read_path = join(TESTS.path, id)
        try {
            let m = new Meta().loadFromFile(read_path)
            res.json(m)
        } catch (e) {
            res.status(400).end()
        }
    }
}

Socket.rooms.TestingSuite.on('connection', (socket) => {
    socket.on('test', async function (id: string) {
        let results = []    // JSON array storing results to write to a file.
        const path = join(TESTS.path, id)
        this.emit('status', Statuses.TESTING)
        const runner_path = resolve('./node_modules/.bin/mocha.cmd')
        const spec = `${path}/**/*.spec.{ts,js}`
        const proc = spawn(runner_path, ['--reporter', 'json-stream', '--require', 'ts-node/register', spec], { cwd: resolve('.') })
        proc.stderr.pipe(process.stderr)
        proc.stdout.setEncoding("utf-8")
        proc.stdout.on('data', (d) => {
            let m = FormatTestResult(JSON.parse(d as string))
            if(m) {
                results.push(m)
                this.emit('result', m)
            }
        })
        proc.on('close', (failures, sig) => {
            const write_path = join(TESTS.path, id)
            let m = new Meta().loadOrDefaultFromFile(write_path)
            m.result = { passed: results.length - failures, failed: failures }
            m.last.ran = new Date()
            m.results = results
            m.saveToFile(write_path)
            this.emit('done', m)
        })
    })
})

/**
 * Format the data returned by Mocha's test runner stream as a Module
 * @param data The test runners stream's string response
 */
function FormatTestResult(data): Module {
    let [ st, res ] = data
    if(/(pass)|(fail)/.test(st)) {
        res.status = st
        let mod_name = res.fullTitle
            .replace(res.title, '') // rip out the title's name 'Contact Us {form should be}'
            .replace(/\ *$/, '')    // strip the spaces at the end. 'Contact Us{ }'
        let m = {} as Module
        m.title = mod_name
        res.status = (st === 'pass')
        const { title:name, status, duration, err, stack } = res
        m.tests = [ { name, status, duration, err, stack } ]
        return m
    }
}