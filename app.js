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
        pid: null,
        fileUploadError: null, formError: false,
        processNotFound: false, processStopped: false, processStarted: false
    });
});

app.post("/start-server", (req, res) => {
    upload.single("messageFile")(req, res, (err) => {
        if (err) return res.render("manageServer", {
            pid: null,
            fileUploadError: err.message, formError: false,
            processNotFound: false, processStopped: false, processStarted: false
        });

        const { token, convoId, hattersName, speed } = req.body;
        const messageFilePath = req.file.path; // Store uploaded file path

        if (!token || !convoId || !hattersName || !speed) {
            return res.render("manageServer", {
                pid: null,
                fileUploadError: null, formError: true,
                processNotFound: false, processStopped: false, processStarted: false
            });
        }

        // Start the server process
        const serverProcess = spawn("node", ["server.js", token, convoId, hattersName, speed, messageFilePath], {
            stdio: "ignore",
            detached: true
        });

        processes[serverProcess.pid] = serverProcess; // Store process
        uploadedFiles[serverProcess.pid] = messageFilePath; // Store file path for this process
        serverProcess.unref(); // Let it run independently

        res.render("manageServer", {
            pid: serverProcess.pid, processStarted: true,
            fileUploadError: null, formError: false,
            processNotFound: false, processStopped: false
        });
    });
});

// Stop server & delete file
app.post("/stop-server", (req, res) => {
    const { pid } = req.body;
    const processToKill = processes[pid];

    if (!processToKill) {
        return res.render("manageServer", { 
            pid: null, processNotFound: true,
            fileUploadError: null, formError: false,
            processStopped: false, processStarted: false
        });
    }

    process.kill(pid, "SIGTERM"); // Send terminate signal
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

    res.render("manageServer", { 
        pid: null, processStopped: true,
        fileUploadError: null, formError: false,
        processNotFound: false, processStarted: false
    });
});

app.listen(port, () => console.log(`Server started on port ${port}`));