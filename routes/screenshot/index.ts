import { Router, Request, Response } from 'express';
import * as puppeteer from 'puppeteer';
import {resolve, join} from 'path';
import * as fs from 'fs';
import { parse } from "url"

const screenshotPath = resolve('./temp/screenshots/');

function screenshot(req: Request, res: Response){
    var url = req.query.url;
    var height = (req.query.h) ? parseInt(req.query.w) : 1200;
    var width = (req.query.w) ? parseInt(req.query.w) : 1920;

    let opts = {
        headers: {
            "Content-Disposition": "inline; "
        }
    }

    const parsedUrl = parse(url)

    puppeteer.launch().then(function(browser){
        browser.newPage().then(function(page){
            page.goto(url).then(function(loadedPage){
                page.setViewport({ height: height, width: width });
                const fname = `${parsedUrl ? `${parsedUrl.hostname}_` : ''}${width}x${height}_screenshot_${Date.now()}.jpg`
                opts.headers["Content-Disposition"] += `filename=${fname};`
                var filePath = join(screenshotPath, `screenshot_${Date.now()}.jpg`);
                page.screenshot({ fullPage: true, path : filePath, quality:50 }).then(function(file){
                    res.sendFile(filePath, opts);
                    browser.close();
                });
            });
        });
    });
}

module.exports = Router().get('/screenshot', screenshot);

