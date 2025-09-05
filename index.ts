import express, { Request, Response, Errback } from 'express';
import { Content, Link, Tag, User } from './schema';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { LinkSchemaType, myRequest } from './interfaces';
import { authenticate } from './middlewares';
import cors from 'cors';
import mongoose, { ObjectId } from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());


app.post('/signup', async (req: Request, res: Response) => {
    let { username, password } = req.body;
    if(username && password){
        let user = await User.create({ username, password });
        // console.log(user);
        res.json({ 'message': 'user registered' });
    }
    else{
        res.status(400).json({ 'message': 'Username and password are required' });
    }
});

app.post('/signin', async (req: Request, res: Response) => {
    let { username, password } = req.body;
    let user = await User.findOne({ username, password });
    if (user) {
        let token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string);
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
        content.date = new Date();
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

app.delete('/content/:id', authenticate, async (req: myRequest, res: Response) => {
    let id = req.params.id;
    let userId = req._id;
    // try{
    //     let content = await Content.findOne({ _id: id, userId: userId });
    //     if (!content) {
    //         return res.status(404).json({ "message": "Content not found or you do not have permission to delete it." });
    //     }
    // }
    // catch (e: any) {
    //     return res.status(500).json({ "message": "Internal Server Error" });
    // }

    try {
        let content = await Content.findOne({ _id: id, userId: userId });
        console.log({ _id: id, userId: userId });
        if (!content) {
            res.status(404).json({ "message": "Content not found or you do not have permission to delete it." });
            return;
            // return res.status(404).json({ "message": "Content not found or you do not have permission to delete it." });
        }
        await Content.deleteOne({ _id : id });
        res.json({ "message": "content deleted!" });
    }
    catch (e: any) {
        res.status(401).send(e.message);
        console.log(e.message);
    }
})


app.post('/share', authenticate, async (req: myRequest, res: Response) => {
    let id = req._id;
    if (!id) {
        res.status(401).json({ "message": "Unauthorized" });
        return;
    }
    let link = await Link.findOne({ userId: id }) as LinkSchemaType | null;
    let shareHash : string = "";
    if(!link){
        console.log("Creating new link for user:", id);
        shareHash = jwt.sign({ _id: id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        Link.create({ userId: id, hash: shareHash }).then(() => {
            console.log("Link created successfully")
        }).catch((err: Errback) => {
            console.error("Error creating link:", err);
        });
    }
    else{
        console.log("Updating existing link for user:", id);
        shareHash = jwt.sign({ _id: id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        Link.updateOne({ userId: id }, { hash: shareHash }).then(() => {
            console.log("Link updated successfully")
        }).catch((err: Errback) => {
            console.error("Error updating link:", err);
        });
    }
    res.json({ "shareHash": shareHash });
});

app.get('/share/:hash', async (req: Request, res: Response) => {
    let hash = req.params.hash;
    let decodedObject;
    try {
        decodedObject = jwt.verify(hash, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (e) {
        res.status(401).json({ "message": "Invalid or expired share link" });
        return;
    }
    // console.log(decodedObject);
    
    let userId = decodedObject._id;
    let content = await Content.find({ userId }).populate('tag');
    if (!content || content.length === 0) {
        res.status(404).json({ "message": "No content found for this user" });
        return;
    }
    
    res.json(content);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});