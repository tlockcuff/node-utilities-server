import Mocha from "mocha"
import { join } from "path"
import * as glob from 'glob';

const test_folder_path = process.argv[2]

// todo: Can I require ts-node somehow for typescript evaluation?
const m = new Mocha({
    reporter: 'json-stream'
})

glob.sync(`${test_folder_path}/**/*.spec.(t|j)s`).forEach(file => {
    m.addFile(file)
})

m.run((fails) => {
    console.log(fails)
})