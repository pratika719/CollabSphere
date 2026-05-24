import express from "express";

const app = express();

const accessTokenOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
};

app.get("/test-clear", (req, res) => {
    res.clearCookie("accessToken", accessTokenOptions);
    res.send("Cookie cleared");
});

const server = app.listen(3001, () => {
    fetch("http://localhost:3001/test-clear")
        .then(res => {
            console.log("Headers:");
            console.log(res.headers.getSetCookie());
            server.close();
        })
        .catch(err => {
            console.error(err);
            server.close();
        });
});
