"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticate = (req, res, next) => {
    let token = req.headers['jsontoken'];
    // let token = authObj.get("jsontoken");
    let decodedObject = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (decodedObject) {
        req._id = decodedObject._id;
        next();
    }
    else {
        res.status(401).json({ "message": "Not Signed In" });
    }
};
exports.authenticate = authenticate;
