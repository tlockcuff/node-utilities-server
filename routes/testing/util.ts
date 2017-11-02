import { exec } from "child_process"
import { platform } from "os"
import { resolve } from "path"

export function rmrf(path: string) {
        return new Promise((res, rej) => {
            exec(`rm -rf ${resolve(path)}`, (error) => {
                if(error) { rej(error) }
                res()
            })
        })
}

export function mkdir(path: string) {
    return new Promise((res, rej) => {
        exec(`mkdir ${resolve(path)}`, (error) => {
            if(error) { rej(error) }
            res()
        })
    })
}

export function cleanDirectory(path: string) {
    return new Promise(async (done, err) => {
        path = resolve(path)
        try {
            await rmrf(path)
            await mkdir(path)
        } catch(e) { err(e) }
        done()
    })
}

export function isWindows() {
    return /win/.test(platform())
}