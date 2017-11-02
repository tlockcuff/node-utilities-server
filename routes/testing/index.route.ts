import { Request, Response } from "express"
import Socket from "./IO"
import { resolve } from "path"
import * as multer from "multer"
import * as v4 from "uuid/v4"
import * as AdmZip from "adm-zip"
import { spawn } from "child_process"

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

Socket.rooms.TestingSuite.on('connection', (socket) => {
    socket.on('test', async function ({ uuid }) {
        this.emit('status', 'extracting')
        const path = resolve(`./temp/tests/${uuid}`)
        const zip = new AdmZip(`${path}.zip`)
        zip.extractAllToAsync(path, true, (err) => {
            this.emit('status', 'extracted')
            console.log(`spawning child process with '${path}'`)
            // const proc = spawn("node", ["./js/routes/testing/runner.js", path])
            console.log(`tests are looking for ${path}/**/*.spec.{ts,js}`)
            // const proc = spawn("./node_modules/.bin/mocha", ["--reporter json-stream", `./temp/tests/${uuid}/**/*.spec.{ts,js}`, '--require ts-node/register'], { cwd: __dirname })
            const proc = spawn('ls', ['-l']).on('error', (proc_error) => { console.log(proc_error) })
            this.emit('status', 'running tests. . .')
            proc.stdout.setEncoding("utf-8")
            proc.stdout.on('data', (d) => {
                console.log(d)
                this.emit('result', d)
            })
        })
    })
})