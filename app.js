const express = require("express");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { pid } = require("process");

const app = express();
const port = 3000;
const processes = {};  // Store running processes
const uploadedFiles = {}; // Store uploaded file paths

const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => res.render("index"));

app.get("/token-check", (req, res) => res.render("tokenCheck"));

app.post("/token-check", async (req, res) => {
    const token = req.body.accessToken;

    try {
        const response = await axios.get(`https://graph.facebook.com/me?access_token=${token}`);
        res.render("tokenResult", { data: response.data, valid: true });
    } catch (error) {
        res.render("tokenResult", { error: error.response.data.error.message, valid: false });
    }
});

app.get("/manage-server", (req, res) => {
    res.render("manageServer", {
        pid: req.query.pid || null,
        fileUploadError: req.query.fileUploadError || null,
        formError: req.query.formError === "true",
        processNotFound: req.query.processNotFound === "true",
        processStopped: req.query.processStopped === "true",
        processStarted: req.query.processStarted === "true"
    });
});

app.post("/start-server", (req, res) => {
    upload.single("messageFile")(req, res, (err) => {
        if (err) {
            return res.redirect(`/manage-server?fileUploadError=${encodeURIComponent(err.message)}`);
        }

        const { token, convoId, hattersName, speed } = req.body;
        const messageFilePath = req.file.path; // Store uploaded file path

        if (!token || !convoId || !hattersName || !speed) {
            return res.redirect(`/manage-server?formError=true`);
        }

        // Start the server process
        const serverProcess = spawn("node", ["server.js", token, convoId, hattersName, speed, messageFilePath], {
            stdio: "inherit",
            detached: false
        });

        processes[serverProcess.pid] = serverProcess; // Store process
        uploadedFiles[serverProcess.pid] = messageFilePath; // Store file path for this process
        serverProcess.unref(); // Let it run independently

        console.log(`🚀 Server started with PID: ${serverProcess.pid}`);
        return res.redirect(`/manage-server?processStarted=true&pid=${serverProcess.pid}`);
    });
});

// Stop server & delete file
app.post("/stop-server", (req, res) => {
    const { pid } = req.body;
    const processToKill = processes[pid];

    if (!processToKill) {
        return res.redirect(`/manage-server?processNotFound=true`);
    }

    process.kill(pid, "SIGTERM"); // Send terminate signal
    console.log(`🚨 Server stopped of PID: ${pid} by user!`);
    delete processes[pid]; // Remove from object

    // Delete the uploaded file when the server stops
    const filePath = uploadedFiles[pid];
    if (filePath) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("❌ Error deleting file:", err);
            } else {
                console.log(`✅ File deleted: ${filePath}`);
            }
        });
        delete uploadedFiles[pid]; // Remove file reference
    }

    return res.redirect(`/manage-server?processStopped=true`);
});

app.listen(port, () => console.log(`Server started on port ${port}`));