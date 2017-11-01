import { Request, Response } from "express"
import Socket from "./IO"
import * as multer from "multer"
import * as v4 from "uuid/v4"

const testUploader = multer({
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            console.log(req.file)
            cb(null, v4()+".zip")
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

// Socket.rooms.TestingSuite.on('connection', (socket) => {
//     socket.on('test', function(data) {
//         console.log(data)
//         this.emit('ready')
//     })
//     socket.on('file_send', (data) => {
//         console.log(`got a request for file-sending ${data}`)
//     })
// })

export function post(req: Request, res: Response) {
    console.log("uploading.")
    testUploader(req, res, function(err) {
        if(err) { throw err }
        res.json({ uuid: req.file.filename.replace(/\.zip$/, '') })
    })
}