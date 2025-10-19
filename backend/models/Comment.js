var mongoose = require('mongoose');

const User = require('./User');
const Blog = require('./Blog');

var commentSchema = mongoose.Schema({
    body : {type: String, required: true},
    createAt : {type: Date, default: Date.now()},
    blog : { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    author : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;