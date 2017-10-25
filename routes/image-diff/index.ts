import { Router, Request, Response } from 'express';

// Image Diff: https://www.npmjs.com/package/blink-diff

function imageDiff(req:Request, res: Response) {
    res.send('YAY');
}

module.exports =  Router().get('/image-diff', imageDiff)