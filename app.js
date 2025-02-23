const express = require("express");
const app = express();
const axios = require("axios");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("index");
});

app.post("/check-token", async (req, res) => {
    const token = req.body.accessToken;

    try {
        const response = await axios.get(`https://graph.facebook.com/me?access_token=${token}`);
        res.render("result", { data: response.data, valid: true });
    } catch (error) {
        res.render("result", { error: error.response.data.error.message, valid: false });
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});