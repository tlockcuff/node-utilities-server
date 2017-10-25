import * as express from 'express';
import * as path from 'path';
import * as glob from 'glob';

// Initialize the app
var app = express();

// assign all of the routes to express
glob.sync('./routes/*/index.js').forEach(function(file){
    app.use(require(file));
});

app.listen(3000 || process.env.PORT);
console.log('Running at localhost:' + 3000);