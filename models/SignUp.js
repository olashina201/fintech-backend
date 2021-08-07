const mongoose = require("mongoose");

const signupModel = new mongoose.Schema({
    firstname:{
        type: String,
        required: true,
        maxlength: 100
    },
    lastname:{
        type: String,
        required: true,
        maxlength: 100
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password:{
        type:String,
        required: true,
        minlength:8
    },
    emailToken: String,
    isVerified: Boolean,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Medicxz", signupModel);