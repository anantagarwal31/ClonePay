const express = require("express");
const userRouter = express.Router();
const { z } = require("zod")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config");
const { User } = require("../db");
const { authMiddleware } = require("../middleware");

userRouter.post("/signup",async (req,res)=>{
    const reqBody = z.object({
        firstName: z.string(),
        lastName: z.string(),
        username: z.string(),
        password: z.string().min(6).max(30).refine((value)=>/[A-Z]/.test(value)).refine((value)=>/[a-z]/.test(value)).refine((value) => /[0-9]/.test(value)).refine((value)=>/[\W_]/.test(value))
    })

    const parsedReqBody = reqBody.safeParseAsync(req.body);
    if(!parsedReqBody.success){
        res.json({
            message:"Incorrect format",
            error: parsedReqBody.error
        });
        return
    }

    const {firstName, lastName, username, password} = req.body;
    const user = User.findOne({
        username: username
    })

    if(user){
        res.json({
            message:"User already exists"
        });
        return
    }

    let errorThrown = false;
    try{
        const hashedPass = await bcrypt.hash(password,5);

        const user = await User.create({
            firstName: firstName,
            lastName: lastName,
            username: username,
            password: hashedPass
        });

        const userId = user._id;

        const token = jwt.sign({
            userId
        },JWT_SECRET);
    }
    catch(e){
        res.json({
            error
        });
        errorThrown = true;
    }

    if(!errorThrown){
        res.json({
            message:"You have signed up successfully"
        })
    }
})

userRouter.post('/signin',async (req, res)=>{
    const {username, password} = req.body;

    const user = User.findOne({
        username: username
    });

    if(!user){
        res.status(403).json({
            message:"User not found"
        })
        return
    }

    const matchPass = bcrypt.compare(password, user.password)

    if(matchPass){
        const token = jwt.sign({
            userId: user._id
        },JWT_SECRET);

        res.json({
            token: token
        })
        return
    }

    res.status(411).jsonb({
        message:"Error while signing in"
    })
})

module.exports = userRouter