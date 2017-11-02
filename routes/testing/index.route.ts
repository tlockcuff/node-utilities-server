import { Request, Response } from "express"
import Socket from "./IO"
import { resolve } from "path"
import * as multer from "multer"
import * as v4 from "uuid/v4"
import * as AdmZip from "adm-zip"
import { spawn } from "child_process"
import * as tmp from "tmp"

let TEMP_DIR: string;

const testUploader = multer({
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            cb(null, v4() + ".zip")
        },
        destination: (req, file, cb) => {
            cb(null, './temp/tests')
        }
    }),
    fileFilter: (req, file, cb) => {
        let file_go_through = true
        if (!/(zip)|(octect-stream)/.test(file.mimetype)) { file_go_through = false }
        if (!/.zip$/.test(file.originalname)) { file_go_through = false }

        cb((file_go_through) ? null : new Error("File must be a zip archive"), file_go_through)
    }
}).single("tests")

export function post(req: Request, res: Response) {
    testUploader(req, res, function (error) {
        if (error) { res.json(error) }
        res.json({ uuid: req.file.filename.replace(/\.zip$/, '') })
    })
}

export async function init() {
    // make temporary tests folder
    const tmpObj = tmp.dirSync({
        dir: resolve('./temp')
    })
    TEMP_DIR = tmpObj.name
    tmpObj.removeCallback()
    console.log(`making test folder in ${TEMP_DIR}`)
}

Socket.rooms.TestingSuite.on('connection', (socket) => {
    socket.on('test', async function ({ uuid }) {
        this.emit('status', 'extracting')
        const path = resolve(`./temp/tests/${uuid}`)
        const zip = new AdmZip(`${path}.zip`)
        zip.extractAllToAsync(path, true, (err) => {
            this.emit('status', 'extracted')
            console.log(`spawning child process with '${path}'`)
            console.log(`tests are looking for ${path}/**/*.spec.{ts,js}`)
            const mocha_path = resolve('./node_modules/.bin/mocha.cmd')
            const spec_path = resolve(`${path}/**/*.spec.{ts,js}`)
            this.emit('status', 'running tests. . .')
            const proc = spawn(mocha_path, ['--reporter', 'json-stream', '--require', 'ts-node/register', spec_path], { cwd: resolve('.') })
            proc.stderr.pipe(process.stderr)
            proc.stdout.setEncoding("utf-8")
            proc.stdout.on('data', (d) => {
                this.emit('result', d)
            })
            proc.on('close', (code, sig) => {
                // code returns the number of failures instead of an exit code.
                this.emit('done', code)
                console.log(`mocha is finished. code: ${code}, SIG: ${sig}`)
            })
        })
    })
})