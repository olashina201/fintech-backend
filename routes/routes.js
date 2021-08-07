const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const SignUp = require("../models/SignUp.js");
const crypto = require("crypto");
const mail = require("@sendgrid/mail");
mail.setApiKey(process.env.SENDGRID_API_KEY);


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
        user = new SignUp({ firstname, lastname, email, password, isVerified: false, emailToken: crypto.randomBytes(64).toString("hex") })

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
        const token = jwt.sign({ firstname: user.firstname, lastname: user.lastname, email: user.email }, secretKey, {expiresIn: "20m"});

        response.send(token)
    } catch (error) {
        response.status(500).send(error.message);
        console.log(error.message);
    }
})

router.post("forgotPassword", async (request, response) => {
    const { email } = request.body;
    SignUp.findOne({ email }, (error, user) => {
        if(error || !user) {
            return response.status(400).json({ error: "email does not exist.." })
        }
    })
    const token = jwt.sign({_id: user._id}, secretKey, { expiresIn: "5m" });

    // mail configuration here

    return user.updateOne({ resetLink})

})


module.exports = router; 