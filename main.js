import mongoose from "mongoose";
import { sendEmails } from './email.js';
import dotenv from 'dotenv';
import MongooseModel from './models/User.js';

dotenv.config();

function checkEnvVars() {
    var dbURI = false;
    var emailKey = false;

    if (!process.env.DATABASE_URI) {
        dbURI = true;
        console.error("Missing DATABASE_URI environment variable");
    }

    if (!process.env.EMAIL_APP_PASSWORD) {
        emailKey = true;
        console.error("Missing EMAIL_APP_PASSWORD environment variable");
    }

    if (emailKey || dbURI) {
        throw new Error("Missing environment variables");
    }
}

async function sendEmailsToUsers() {
    try {
        const allUsers = await MongooseModel.find({}).lean();
        console.log("Found users in the database")
        await sendEmails(allUsers);
        console.log("Sent emails to all users")
    } catch (error) {
        console.error("Failed to send emails:", error.message);
        throw error;
    }
}

async function connectDb() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Connected to MongoDB")
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

async function main() {
    console.log("Running WeeklyTree cron job")
    try {
        checkEnvVars();
        await connectDb();
        await sendEmailsToUsers();
    } catch (error) {
        console.error("Application error:", error.message);
    } finally {
        mongoose.connection.close();
    }
}

// Set up error handler first
mongoose.connection.on('error', err => {
    console.log("Mongo Error: ", err)
})

main();
