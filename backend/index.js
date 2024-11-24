// Load environment variables from .env file
require("dotenv").config();

// Import required modules
const express = require("express");
const cors = require("cors"); // CORS for handling cross-origin requests
const googleTTS = require("google-tts-api");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const app = express(); // Initialize the app instance first
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (You can configure it to be more restrictive)
app.use(cors());

// Middleware for parsing JSON
app.use(express.json());

// Ensure the output directory exists
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Endpoint for text-to-speech
app.post("/api/text-to-speech", async (req, res) => {
    const { text, lang } = req.body;

    // Validate input
    if (!text || text.length > 500) {
        return res.status(400).json({ error: "Text must be provided and under 500 characters." });
    }

    try {
        // Generate the TTS audio URL using google-tts-api
        const url = googleTTS.getAudioUrl(text, {
            lang: lang || "en", // Default to English
            slow: false,
        });

        // Download the audio file to the output folder
        const outputPath = path.join(outputDir, "speech.mp3");
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));

        // Send the file back to the user
        res.download(outputPath, "speech.mp3", (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to send the file." });
            }
            fs.unlinkSync(outputPath); // Clean up after sending
        });
    } catch (error) {
        console.error("TTS conversion failed:", error);
        res.status(500).json({ error: "Text-to-speech conversion failed." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
