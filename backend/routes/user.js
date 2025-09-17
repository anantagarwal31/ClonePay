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
        return res.json({
            message:"Incorrect format"
        });
    }

    const {firstName, lastName, username, password} = req.body;
    const alreadyExists = await User.findOne({
        username: username
    })

    if(alreadyExists){
        return res.json({
            message:"User already exists"
        });
    }

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

        res.json({
            message:"You have signed up successfully",
            token: token
        })
    }
    catch(error){
        res.json({
            error
        });
    }
})

userRouter.post('/signin',async (req, res)=>{
    const {username, password} = req.body;

    const user = User.findOne({
        username: username
    });

    if(!user){
        return res.status(403).json({
            message:"User not found"
        })
    }

    try{
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
    }
    catch(error){
        res.status(411).jsonb({
            error
        })
    }
})

userRouter.put('/update', authMiddleware, async (req,res)=>{
    const updateBody = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        username: z.string().optional(),
        password: z.string().min(6).max(30).refine((value)=>/[A-Z]/.test(value)).refine((value)=>/[a-z]/.test(value)).refine((value) => /[0-9]/.test(value)).refine((value)=>/[\W_]/.test(value)).optional(),
    })

    const updateSuccess = await updateBody.safeParseAsync(req.body)
    if(!updateSuccess.success){
        return res.status(411).json({
            message: "Incorrect format"
        })
    }

    const updates = updateSuccess.data;

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 5);
    }

    try {
        await User.updateOne({ _id: req.userId }, updates);
        res.json({ message: "Updated successfully" });
    } catch (error) {
        res.status(500).json({error});
    }
})

userRouter.get('/bulk', async (req,res)=>{
    const filter = req.query.filter || "";

    const users = await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }
        },{
            lastName:{
                "$regex":filter
            }
        }]
    })

    res.json({
        user:users.map(user=>({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = userRouter