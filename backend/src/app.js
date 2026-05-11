import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";


const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(errorMiddleware);

export default app;