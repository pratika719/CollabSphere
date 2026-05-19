import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import workspaceRoutes from "./modules/workspaces/workspace.routes.js";
import boardRoutes from "./modules/boards/board.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";



const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1/tasks", taskRoutes);











app.use(errorMiddleware);

export default app;
