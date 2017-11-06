import { Request, Response } from "express"
import Socket from "./IO"
import { resolve, join, basename } from "path"
import { existsSync, writeFile, readFile } from "fs"
import * as multer from "multer"
import * as v4 from "uuid/v4"
import * as AdmZip from "adm-zip"
import { spawn } from "child_process"
import TempDir from "./TempDir"
import { cleanDirectory } from "./util"
import Statuses from "./statuses"

interface Result { passed: number, failed: number }

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
            if(err) { res.status(400).end() }
            res.json(Statuses.READY)
        })
    })
}

export function get(req: Request, res: Response) {
    const { id, download } = req.query
    if(id && download) {
        const filepath = join(TESTS.path, id)
        // const filepath = resolve(join(TEMP_DIR.tmpPath, `${id}.zip`))
        if(existsSync(filepath)) {
            res.download(filepath)
        } else {
            res.status(400).json({error: `Test archive ${id} does not exist.`})
        }
    } else if(id) {

        const read_path = join(TESTS.path, id, 'meta.json')
        console.log(read_path)
        console.log(`file path is here ${read_path}`)
        readFile(read_path, { encoding: 'utf-8' }, (err, meta) => {
            if(err) { res.status(400).end() }
            res.json(JSON.parse(meta))
        })
        // check if file exists
            // if it does, return the json data from the meta.json in the test folder
    }
}

Socket.rooms.TestingSuite.on('connection', (socket) => {
    socket.on('test', async function (id: string) {
        let results = []    // JSON array storing results to write to a file.
        console.log(`testing ${id}`)
        const path = join(TESTS.path, id)
        this.emit('status', Statuses.TESTING)
        console.log(`spawning child process with ${path}`)
        const runner_path = resolve('./node_modules/.bin/mocha.cmd')
        const spec = `${path}/**/*.spec.{ts,js}`
        console.log(`with spec ${spec}`)
        const proc = spawn(runner_path, ['--reporter', 'json-stream', '--require', 'ts-node/register', spec], { cwd: resolve('.') })
        
        proc.stderr.pipe(process.stderr)
        proc.stdout.setEncoding("utf-8")
        proc.stdout.on('data', (d) => {
            console.log(d)
            d = JSON.parse(d as string)
            results.push(d)
            this.emit('result', d)
        })
        proc.on('close', (failures, sig) => {
            console.log('done')
            let result = { passed: results.length - failures, failed: failures } as Result
            // this.emit('done', result)
            let last = { ran: new Date(), updated: null }
            let meta = { result, results, last }
            const write_path = join(TESTS.path, id, 'meta.json')
            writeFile(write_path, JSON.stringify(meta), { encoding: 'utf-8' }, (err) => {
                this.emit('done', result)
            })
            // write meta to meta.json
        })
        // this.emit('status', 'Extracting.')
        // const zipPath = join(TEMP_DIR.tmpPath, id)
        // if( !existsSync(zipPath) ) { this.emit('status', `Test ${id} does not exist.`) }
        // const path = join(TEMP_DIR.path, id)
        // console.log(`extracting to ${path}`)
        // const zip = new AdmZip(`${zipPath}.zip`)
        // // todo: ADMZip can extract to memory instead of to the file directory
        // // todo: multer can also save posted files into memory. Look into a way to streamline this without reading from the file system.
        // zip.extractAllToAsync(path, true, (err) => {
        //     this.emit('status', 'extracted')
        //     console.log(`spawning child process with '${path}'`)
        //     console.log(`tests are looking for ${path}/**/*.spec.{ts,js}`)
        //     const mocha_path = resolve('./node_modules/.bin/mocha.cmd')
        //     const spec_path = resolve(`${path}/**/*.spec.{ts,js}`)
        //     this.emit('status', 'Running tests. . .')
        //     const proc = spawn(mocha_path, ['--reporter', 'json-stream', '--require', 'ts-node/register', spec_path], { cwd: resolve('.') })
        //     proc.stderr.pipe(process.stderr)
        //     proc.stdout.setEncoding("utf-8")
        //     proc.stdout.on('data', (d) => {
        //         d = JSON.stringify(d)
        //         results.push(d)
        //         this.emit('result', d)
        //     })
        //     proc.on('close', (code, sig) => {
        //         // code returns the number of failures instead of an exit code.
        //         this.emit('done', code)
        //         let test = {
        //             status: { passed: 0, failed: 0 },
        //             results: results
        //         }
        //         // calculate number of passes and fails.
        //         // write the test object to a meta.json file in the test/{id} folder.
        //         console.log(`writing the meta.json file to the test ${id}`)
        //         console.log(`mocha is finished. code: ${code}, SIG: ${sig}`)
        //     })
        // })
    })
})

function ReadTestData(id: string): any {

}