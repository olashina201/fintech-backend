const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/user.js");
const SignUp = require("../models/SignUp.js");

router.post("/signup", async (request, response) => {
    const schema = Joi.object({
        firstname: Joi.string().min(3).max(30).required(),
        lastname: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(3).max(200).email().required(),
        password: Joi.string().min(6).max(30).required()
    })
    const { error } = schema.validate(request.body);

    if (error) return response.status(400).send(error.details[0].message);

    try {
        let user = await SignUp.findOne({ email: request.body.email });
        if (user) return response.status(400).send("user with that email already exist..");

        const { firstname, lastname, email, password } = request.body;
        user = new SignUp({ firstname, lastname, email, password })

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();
        response.send("user created successfully")
    } catch (error) {
        response.status(500).send(error.message);
        console.log(error.message);
    }
});

router.post("/signin", async (request, response) => {
    const schema = Joi.object({
        email: Joi.string().min(3).max(200).email().required(),
        password: Joi.string().min(6).max(30).required()
    })
    const { error } = schema.validate(request.body);

    if (error) return response.status(400).send(error.details[0].message);

    try {
        let user = await SignUp.findOne({ email: request.body.email });
        if (!user) return res.status(400).send("invalid email or password...");

        const validPassword = await bcrypt.compare(request.body.password, user.password);

        if (!validPassword) return response.status(400).send("invalid email or password...");

        const secretKey = process.env.JWT_KEY;
        const token = jwt.sign({ firstname: user.firstname, lastname: user.lastname, email: user.email }, secretKey);

        response.send(token)
    } catch (error) {
        response.status(500).send(error.message);
        console.log(error.message);
    }
})

router.post('/register', (req, res) => {
    // taking a user
    const newuser = new User(req.body);
    console.log(newuser);

    if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});

    User.findOne({email:newuser.email},function(err,user){
        if(user) return res.status(400).json({ auth : false, message :"email exits"});

        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            res.status(200).json({
                succes:true,
                user : doc
            });
        });
    });
});

router.post('/login', function(req,res){
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });

        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});

                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});

                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });
            });
          });
        }
    });
});


module.exports = router;