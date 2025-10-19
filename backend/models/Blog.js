var mongoose = require('mongoose');
var User = require('./User');

var blogSchema = mongoose.Schema({
    title : {type: String, required: true, unique: true},
    body : {type: String, required: true, unique: true},
    imageUrl : {type: String, required: false},
    category: {type: String, required: false},
    createAt : {type: Date, required: true, default: Date.now()},
    author : { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

let Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;