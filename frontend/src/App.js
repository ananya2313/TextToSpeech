import React, { useState } from "react";
import axios from "axios";
import "./App.css";  // Link the CSS file

const App = () => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text) {
      setError("Please enter some text.");
      return;
    }
    if (text.length > 500) {
      setError("Text cannot exceed 500 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/text-to-speech", // Backend URL
        { text, lang },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "audio/mp3" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "speech.mp3");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      setError("Failed to generate speech. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tts-container">
      <h1 className="title">Text-to-Speech Converter</h1>
      <form className="tts-form" onSubmit={handleSubmit}>
        <textarea
          className="form-control"
          placeholder="Enter your text (max 500 characters)"
          rows="5"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <select
          className="form-select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Speech"}
        </button>
      </form>
    </div>
  );
};

export default App;
