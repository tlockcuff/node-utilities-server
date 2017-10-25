var puppeteer = require('puppeteer');
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

// Image Diff: https://www.npmjs.com/package/blink-diff

app.use(express.static('static'));
app.use('screenshots', express.static(path.join(__dirname, 'screenshots')));

app.get('/screenshot', function(req, res){
    var url = req.query.url;
    puppeteer.launch().then(function(browser){
        browser.newPage().then(function(page){
            page.goto(url).then(function(loadedPage){
                page.setViewport({ height: 1500, width:1920 });
                var filename = 'screenshots/' + 'screenshot_' + Date.now()  + '.jpg';
                var filepath = path.join(__dirname, filename);
                page.screenshot({ fullPage: true, path : filepath, quality:100 }).then(function(file){
                    res.sendFile(filepath);
                    browser.close();
                });
            });
        });
    });
});

app.listen(3000 || process.env.PORT);
console.log('Running at localhost:' + 3000);