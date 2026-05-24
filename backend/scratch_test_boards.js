import mongoose from "mongoose";
import dotenv from "dotenv";
import Workspace from "./src/models/Workspace.js";
import Board from "./src/models/Board.js";
import User from "./src/models/User.js";
import { findworkspacebyUser } from "./src/modules/workspaces/workspace.repository.js";

dotenv.config();

async function run() {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Find any user first
    const user = await User.findOne({});
    if (!user) {
        console.log("No user found in the DB.");
        await mongoose.disconnect();
        return;
    }
    console.log(`Testing with User: ${user.name} (${user._id}), email: ${user.email}`);

    // Let's run findworkspacebyUser
    const workspaces = await findworkspacebyUser(user._id);
    console.log("Workspaces retrieved:", JSON.stringify(workspaces, null, 2));

    // Also check total boards in the DB for reference
    const totalBoards = await Board.find({});
    console.log(`Total boards in DB: ${totalBoards.length}`);
    for (const b of totalBoards) {
        console.log(`  Board: ${b.title}, Workspace: ${b.workspace}, isArchived: ${b.isArchived}`);
    }

    await mongoose.disconnect();
}

run().catch(err => console.error(err));
