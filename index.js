"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var glob = require("glob");
// Initialize the app
var app = express();
// assign all of the routes to express
glob.sync('./routes/*/index.js').forEach(function (file) {
    app.use(require(file));
});
app.listen(3000 || process.env.PORT);
console.log('Running at localhost:' + 3000);
