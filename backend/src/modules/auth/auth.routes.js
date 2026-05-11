import { Router } from "express";

const router = Router();

router.post("/register", (req, res) => {
    res.send("register");
});

router.post("/login", (req, res) => {
    res.send("login");
});

router.get("/logout", (req, res) => {
    res.send("logout");
});

router.get("/refresh", (req, res) => {
    res.send("refresh");
});

router.get("/me", (req, res) => {
    res.send("me");
});

router.get("/change-password", (req, res) => {
    res.send("change password");
});

router.get("/forgot-password", (req, res) => {
    res.send("forgot password");
});

router.get("/reset-password", (req, res) => {
    res.send("reset password");
});

export default router;
