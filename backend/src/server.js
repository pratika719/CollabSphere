import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocketServer } from "./realtime/socket.server.js";


dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
