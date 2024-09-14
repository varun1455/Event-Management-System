const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email : {type : String, required: true, unique:true},
    password : { type: Buffer, required: true},
    name:{type : String},
    role:{type:String, required:true , default:'user'},
  notifications: [{ message: String, read: Boolean }],
  activity: [{ type: Date, event: String }],
  salt: Buffer

});

module.exports = mongoose.model('User', userSchema);