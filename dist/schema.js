"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = exports.Content = exports.Tag = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const model = mongoose_1.default.model;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
mongoose_1.default.connect(process.env.mongoURL)
    .then(() => console.log('Connected!'));
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLen: [6, "Password must have more than 8 characters"],
    },
});
const tagSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
});
const contentSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    data: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: {
            values: ["doc", "video", "Audio", "Picture", "tweet"],
            message: "{value} is not supported",
        },
        required: true,
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
exports.User = model('User', userSchema);
exports.Tag = model('Tag', tagSchema);
exports.Content = model('Content', contentSchema);
exports.Link = model('Link', linkSchema);
