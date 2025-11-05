// api/index.js
// Serverless Express app for Vercel — mirrors your server.js routes, no app.listen()

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI client (reads from Vercel env var)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- Routes (same payloads you had) ----

// Data for charts
app.get("/api/data", (req, res) => {
  res.json({
    weeklyListening: [20, 35, 50, 65, 80, 95, 110],
    freeToPremium: [8, 10, 14, 19, 24, 28, 32],
    regions: {
      France: 10,
      Netherlands: 10,
      Germany: 10,
      UK: 31,
      US: 14,
    },
    campaignData: {
      versionA: { conversions: 360, users: 1000 },
      versionB: { conversions: 460, users: 1000 },
      audiobooksPlus: { conversions: 180, users: 800 },
    },
  });
});

// AI insight
app.post("/api/insight", async (req, res) => {
  const { message } = req.body || {};
  try {
    const prompt = `
You are Spotify's Growth Analyst.

Recent milestones:
- Audiobooks catalog: 500,000+ titles (tripled)
- Available in 14 markets
- 52% of listeners aged 18–34
- 10% MoM listening growth in France, Netherlands, and Germany
- 36% YoY increase in audiobook starts
- 37% YoY increase in listening hours
- Audiobooks+ users: +18% consumption in 30 days
- UK audiobook revenue: +31% YoY (£268M)
- US digital audio: +14% adult, +48% kids/teens growth

User question: "${message}"

Write a 2–3 sentence data-driven insight that explains what’s driving growth and how Spotify is reimagining audiobooks for the next generation.
`;

    // Use a small/good model you already used locally
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse = completion?.choices?.[0]?.message?.content ?? null;
    if (!aiResponse) {
      return res.status(502).json({ reply: "Error: Invalid response from AI service." });
    }

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("Error generating insight:", error);
    res.status(500).json({ reply: "Error: Could not generate insight." });
  }
});

// Export the Express app for Vercel
export default app;