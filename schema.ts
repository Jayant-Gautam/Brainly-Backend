import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const model = mongoose.model;
import constants from './config' 

mongoose.connect(constants.mongoURL)
  .then(() => console.log('Connected!'));

const userSchema = new Schema({
    username: {
        type : String,
        required : true,
    },
    password: {
        type : String,
        required : true,
        minLen : [6, "Password must have more than 8 characters"],
    },
});

const tagSchema = new Schema({
    title: {
        type : String,
        required : true,
        unique : true,
    },
});


const contentSchema = new Schema({
    title: {
        type : String,
        required : true,
    },
    data: {
        type : String,
        required : true,
    },
    type: {
        type : String,
        enum : {
            values : ["doc", "video", "Audio", "Picture", "tweet"],
            message : "{value} is not supported",
        },
        required : true,
    },
    tag: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    date: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const linkSchema = new Schema({
    hash: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

export const User = model('User', userSchema);
export const Tag = model('Tag', tagSchema);
export const Content = model('Content', contentSchema);
export const Link = model('Link', linkSchema);