const express = require("express");
const accountRouter = express.Router();
const { User, Account } = require("../db");
const { authMiddleware } = require("../middleware");
const { default: mongoose } = require("mongoose");

accountRouter.get("/balance", authMiddleware, async (req,res)=>{
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
})

accountRouter.post("/transfer", authMiddleware, async (req,res)=>{
    const session = await mongoose.startSession();

    session.startTransaction();

    try{
        const {amount, to} = req.body;

        const fromAccount = await Account.findOne({
            userId: req.userId
        }).session(session);

        if(!fromAccount || fromAccount.balance<amount){
            await session.abortTransaction();
            return res.status(400).json({
                messgae: "Insufficient balance"
            });
        }

        const toAccount = await Account.findOne({
            userId: to
        }).session(session);

        if(!toAccount){
            await session.abortTransaction();
            return res.status(400).json({
                messgae: "Invalid Account"
            });
        }
        
        await Account.updateOne({
            userId: req.userId
        },{
            $inc:{
                balance: -amount
            }
        }).session(session);

        await Account.updateOne({
            userId: to
        },{
            $inc:{
                balance: amount
            }
        }).session(session);

        await session.commitTransaction();
        res.json({
            message:"Transaction successfull"
        })
    }
    catch(error){
        await session.abortTransaction();
        res.status(500).json({
            error: error.message
        })
    }
    finally{
        session.endSession();
    }
    
})

module.exports = accountRouter