require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors")
const app = express();
app.use(cors());
app.use(express.json());
const router = require("./routes/index")
app.use("/api/v1", router)

async function main(){
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB successfully");

        app.listen(process.env.PORT,()=>{
            console.log(`Server running on port ${process.env.PORT}`)
        })
    }
    catch(e){
        console.log("Error while connecting to MongoDB", e);
    }
}

main();