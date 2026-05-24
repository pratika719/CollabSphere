import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function checkDB() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Find the test user
    const users = await User.find({ email: /test_lifecycle_/ }).select("+refreshToken");
    console.log(`Found ${users.length} lifecycle test users:`);
    
    for (const u of users) {
        console.log(`User: ${u.email}, ID: ${u._id}`);
        console.log(`  refreshToken in DB: ${u.refreshToken}`);
    }

    await mongoose.disconnect();
}

checkDB().catch(err => console.error(err));
