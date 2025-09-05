import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import {myRequest, JwtPayload} from "./interfaces";
import dotenv from "dotenv"
dotenv.config();


export const authenticate = (req: myRequest, res: Response, next: NextFunction) => {
    let token = req.headers['jsontoken'] as string;
    // let token = authObj.get("jsontoken");
    let decodedObject = jwt.verify(token as string, process.env.JWT_SECRET as string) as JwtPayload;
    if(decodedObject){
        req._id = decodedObject._id;
        next();
    }
    else {
        res.status(401).json({"message": "Not Signed In"});
    }
}
