import mongoose from "mongoose";
import dotenv from "dotenv";
import { findBoardByworkspace } from "./src/modules/boards/board.repository.js";

dotenv.config();

async function run() {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Using the workspace ID that has boards: 6a0b170475a8f5c137c2915b
    const boards = await findBoardByworkspace("6a0b170475a8f5c137c2915b");
    console.log("Boards under workspace 6a0b170475a8f5c137c2915b:", JSON.stringify(boards, null, 2));

    await mongoose.disconnect();
}

run().catch(err => console.error(err));
