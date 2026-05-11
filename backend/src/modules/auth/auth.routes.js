import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changePassword } from "./auth.controller.js";
import { verifyJWT } from "./auth.middleware.js";
const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);

router.post("/refresh", refreshAccessToken);

router.get("/me", verifyJWT, getCurrentUser);

router.put("/change-password", verifyJWT, changePassword);



export default router;
