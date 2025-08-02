import express, { Request, Response, Errback } from 'express';
import { Content, Tag, User } from './schema';
import jwt from 'jsonwebtoken';
import constants from './config';
import { myRequest } from './interfaces';
import { authenticate } from './middlewares';
import cors from 'cors';
import mongoose, { ObjectId } from 'mongoose';

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());


app.post('/signup', async (req: Request, res: Response) => {
    let { username, password } = req.body;
    await User.create({ username, password });
    console.log(username, password);
    res.json({ 'message': 'user registered' });
});

app.post('/signin', async (req: Request, res: Response) => {
    let { username, password } = req.body;
    let user = await User.findOne({ username, password });
    if (user) {
        let token = jwt.sign({ _id: user._id }, constants.JWT_SECRET);
        res.json({ "jsontoken": `${token}` });
    }
    else {
        res.status(401).send("Invalid Credentials");
    }
});

app.post("/content", authenticate, async (req: myRequest, res: Response) => {
    let id = req._id;
    let content = req.body;
    content.userId = id;
    // console.log(content);
    let tagArray : mongoose.Types.ObjectId[] = [];
    try {
        for (let tags of content.tag) {
            let tag = await Tag.findOne({ title: tags });
            // console.log(tag);
            if (tag) {
                tagArray.push(tag._id);
            }
            else {
                // console.log(tags);
                tag = await Tag.create({ title: tags });
                tagArray.push(tag._id);
            }
        }
        content.tag = tagArray;
        // console.log(content);
        await Content.create(content);
        res.json({ "message": "Content Stored!" })
    }
    catch (e: any) {
        res.status(401).send(e.message);
        console.log(e.message);
    }
})

app.get('/content', authenticate, async (req: myRequest, res: Response) => {
    let id = req._id;
    let content = await Content.find({ userId: id }).populate('tag');
    // console.log(content);
    res.send(content);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});