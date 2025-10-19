const mongoose = require("mongoose");
const mongoUri = "mongodb://localhost:27017/blogging";

let db = mongoose.connect(mongoUri)
.then((data) => console.log("db connected"))
.catch(err => console.log(err));

module.exports = db;