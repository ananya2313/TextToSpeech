require("dotenv").config();

const express = require("express");
const cors = require("cors");
const googleTTS = require("google-tts-api");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

app.post("/api/text-to-speech", async (req, res) => {
    const { text, lang } = req.body;

    if (!text || text.length > 500) {
        return res.status(400).json({ error: "Text must be provided and under 500 characters." });
    }

    try {
        const url = googleTTS.getAudioUrl(text, {
            lang: lang || "en",
            slow: false,
        });

        const outputPath = path.join(outputDir, "speech.mp3");
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));

        res.download(outputPath, "speech.mp3", (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to send the file." });
            }
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error("TTS conversion failed:", error);
        res.status(500).json({ error: "Text-to-speech conversion failed." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
