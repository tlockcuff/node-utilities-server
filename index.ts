import * as express from 'express';
import { resolve } from "path";
import * as glob from 'glob';
import {Server, createServer} from "http"
import * as expressValidator from 'express-validator';
import * as bodyParser from "body-parser"
import * as multer from "multer"
import IO from "./routes/testing/IO";

// Initialize the app
var app = express()
const server = createServer(app)
IO.Setup(server)
app.use(express.static('public'))
app.use(expressValidator());
app.use(bodyParser.json())

let paths = []

// assign all of the routes to express
glob.sync('./js/routes/**/index.route.js').forEach(function(file){
    // extract the get, put, post, del and all functions exported from the module
    const { get=null, put=null, post=null, del=null, all=null, init=null } = require(resolve(file))
    // create the URL for the route based on the file + folder structure
    const route_path = file.replace("./js/routes", '').replace("index.route.js", '')
    // create the express route for the given URL
    const route = app.route(route_path)
    // if the module exported any specific functions, add them to the route.
    const path_obj = { route: route_path, methods: [] }
    if(init) { init.call() }
    if(get) { route.get(get); path_obj.methods.push("get") } 
    if(put) { route.put(put); path_obj.methods.push("put") } 
    if(post) { route.post(post); path_obj.methods.push("post") } 
    if(del) { route.delete(del); path_obj.methods.push("del") } 
    if(all) { route.all(all); path_obj.methods.push("all") } 
    paths.push(path_obj)
});

// helper route to display a JSON list of the paths and http methods
app.use('/help', (req, res, next) => {
    res.json(paths)
})

const port = process.env.PORT || 3000;
server.listen(port);
console.log(`Running at localhost:${port}`);