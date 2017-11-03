import * as tmp from "tmp"
import { resolve } from "path"

export default class {

    private directory: tmp.SynchrounousResult

    /**
     * Returns the path to the temporary directory.
     */
    public get path(): string { return this.directory.name }

    /**
     * @param path The path to create temporary folder directories in. Defaults to './tmp/'
     */
    constructor(public tmpPath: string = "./temp") {
        this.directory = tmp.dirSync({
            dir: resolve(tmpPath),
            unsafeCleanup: true
        })
    }

    /**
     * Destroys the folder.
     */
    public Destroy() {
        if(this.directory) {
            this.directory.removeCallback()
            this.directory = null
        }
    }

}