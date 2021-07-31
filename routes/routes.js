const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt")
const {auth} =require('../middleware/auth.js');
const User = require("../models/user.js");

router.post("/signup", async (request, response) => {
    const { firstName, lastName, email, password } = request.body;

    let signupUser = await signupSchema.findOne({email});

    if (signupUser) {
        return response.redirect("/signup")
    }

    const  hashPassword = await bcrypt.hash(password, 12);

    signupUser = new signupSchema({ firstName, lastName, email, password: hashPassword });

    await signupUser.save()
    .then(data => {
        response.json(data)
    })
    .catch(error => {
        response.json(error)
    })

    response.redirect("/signin");
});


router.post("/signin", async (request, response) => {
    const { email, password } = request.body;

    const user = await signupSchema.findOne({email});

    if (!user) {
        return response.redirect("/signin")
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return response.redirect("/signin")
    }

    response.redirect("/dashboard");
})

router.post('/register', (req,res) => {
    // taking a user
    const newuser=new User(req.body);
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
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
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

router.get('/profile',auth,function(req,res){
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstname + req.user.lastname
    })
});


module.exports = router;