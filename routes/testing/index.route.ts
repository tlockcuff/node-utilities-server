import { Request, Response } from "express"
import IO from "./IO"


// Read the post data and accept a zip of test files to run.
export function post(req: Request, res: Response)
{

}

export function get(req: Request, res: Response)
{
    res.json({ message: "soon." })
}

export const custom = {
    
}