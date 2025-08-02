import { Request } from "express";

export interface myRequest extends Request {
    _id? : string,
}

export interface JwtPayload {
    _id : string,
}

