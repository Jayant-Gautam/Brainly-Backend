"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schema_1 = require("./schema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./config"));
const middlewares_1 = require("./middlewares");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, password } = req.body;
    yield schema_1.User.create({ username, password });
    console.log(username, password);
    res.json({ 'message': 'user registered' });
}));
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, password } = req.body;
    let user = yield schema_1.User.findOne({ username, password });
    if (user) {
        let token = jsonwebtoken_1.default.sign({ _id: user._id }, config_1.default.JWT_SECRET);
        res.json({ "jsontoken": `${token}` });
    }
    else {
        res.status(401).send("Invalid Credentials");
    }
}));
app.post("/content", middlewares_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req._id;
    let content = req.body;
    content.userId = id;
    // console.log(content);
    let tagArray = [];
    try {
        for (let tags of content.tag) {
            let tag = yield schema_1.Tag.findOne({ title: tags });
            // console.log(tag);
            if (tag) {
                tagArray.push(tag._id);
            }
            else {
                // console.log(tags);
                tag = yield schema_1.Tag.create({ title: tags });
                tagArray.push(tag._id);
            }
        }
        content.tag = tagArray;
        // console.log(content);
        yield schema_1.Content.create(content);
        res.json({ "message": "Content Stored!" });
    }
    catch (e) {
        res.status(401).send(e.message);
        console.log(e.message);
    }
}));
app.get('/content', middlewares_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req._id;
    let content = yield schema_1.Content.find({ userId: id }).populate('tag');
    // console.log(content);
    res.send(content);
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
