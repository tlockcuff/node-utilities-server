import { readFileSync, writeFileSync } from "fs"
import { resolve, join } from "path"
import { Result, Module } from "./defs"

const file_name = "meta.json"

export default class Meta {
    results: Array<Module> = []
    result: Result = null
    last = {
        ran: null,
        updated: null
    }

    /**
     * Load the meta from the folder path.
     * @param path The folder path of the meta file being read from.
     */
    loadFromFile(path: string) {
        try {
            const file = readFileSync( resolve(join(path, file_name)), { encoding: 'utf-8' })
            const { results, result, last } = JSON.parse(file) as Meta
            this.result = result
            this.results = results
            this.last = last
            return this
        } catch(e) {
            throw new Error("Meta file does not exist.")
        }
    }

    loadOrDefaultFromFile(path: string) {
        try {
            this.loadFromFile(path)
            return this
        } catch(e) {

        }
    }

    /**
     * Save the meta to the folder path.
     * @param path The folder path of the meta file being wrote to.
     */
    saveToFile(path: string) {
        const json = JSON.stringify(this)
        writeFileSync( resolve(join(path, file_name)), json, { encoding: 'utf-8' } )
    }
}