"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
// Image Diff: https://www.npmjs.com/package/blink-diff
function imageDiff(req, res) {
    res.send('YAY');
}
;
module.exports = express_1.Router().get('/image-diff', imageDiff);
