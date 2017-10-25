"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var puppeteer = require("puppeteer");
var path = require("path");
var rootPath = __dirname + '/../../';
var screenshotPath = '/screenshots/';
function screenshot(req, res) {
    var url = req.query.url;
    var height = (req.query.h) ? parseInt(req.query.w) : 1200;
    var width = (req.query.w) ? parseInt(req.query.w) : 1920;
    puppeteer.launch().then(function (browser) {
        browser.newPage().then(function (page) {
            page.goto(url).then(function (loadedPage) {
                page.setViewport({ height: height, width: width });
                var filePath = path.join(rootPath + screenshotPath, 'screenshot_' + Date.now() + '.jpg');
                page.screenshot({ fullPage: true, path: filePath, quality: 50 }).then(function (file) {
                    res.sendFile(filePath);
                    browser.close();
                });
            });
        });
    });
}
module.exports = express_1.Router().get('/screenshot', screenshot);
