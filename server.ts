import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Initialize Gemini client safely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI Security Advisor API endpoint
app.post("/api/security-advisor", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemInstruction = `You are QuantumShield AI, an elite cybersecurity and VPN network privacy assistant. 
User's current connection context: 
- Status: ${context?.isConnected ? 'Connected to ' + context?.serverName + ' (' + context?.country + ')' : 'Disconnected / Unprotected'}
- Protocol: ${context?.protocol || 'WireGuard'}
- IP: ${context?.ip || '192.168.1.1 (Local)'}
- Kill Switch: ${context?.killSwitch ? 'Active' : 'Inactive'}

Provide expert, precise, reassuring security guidance, privacy tips, and protocol recommendations. Keep responses clear, actionable, and formatted with clean markdown if necessary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "I recommend keeping your VPN connected with WireGuard protocol enabled on public networks." });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Failed to consult AI Security Advisor.",
      details: error.message || "Unknown error" 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QuantumShield VPN server running on port ${PORT}`);
  });
}

startServer();
