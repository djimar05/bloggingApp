var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username : {type: String, required: true, unique: true},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    address : {type: String},
    refreshToken: {type: String},
});

let User = mongoose.model('User', userSchema);

module.exports = User;