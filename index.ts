import * as express from 'express';
import { resolve } from "path";
import * as glob from 'glob';

// Initialize the app
var app = express();

// assign all of the routes to express
glob.sync('./js/routes/*/index.js').forEach(function(file){
    app.use(require(resolve(file)));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
});