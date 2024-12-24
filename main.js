import mongoose from "mongoose";
import { sendEmails } from './email.js';
import dotenv from 'dotenv';
dotenv.config();

// Mongo DB Atlas
import MongooseModel from './models/User.js';

const start = async () => {
    try {
        console.log("Trying to send all emails:")
        const allUsers = await MongooseModel.find({}).lean();
        await sendEmails(allUsers)
    } catch(e){
        console.log('Sending emails failed:', e);
    }
}

console.log("hi")

// Set up error handler first
mongoose.connection.on('error', err => {
  console.log("Mongo Error: ", err)
})

try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("connected to MongoDB");
    await start();
} catch (error) {
    console.log("Connection error:", error);
}