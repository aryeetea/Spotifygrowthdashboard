// 🌿 Spotify Growth Dashboard Backend (AI Integrated)
 import express from "express";
 import cors from "cors";
 import dotenv from "dotenv";
 import OpenAI from "openai";
 
 // ✅ Load environment variables before using them
 dotenv.config();
 
 // ✅ Initialize OpenAI client (only once)
 const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
 });
 
 const app = express();
 const PORT = process.env.PORT || 3000;
 
 // ✅ Middleware
 app.use(cors());
 app.use(express.json());
 app.use(express.static("public"));
 
 // ✅ Warn if API key missing (helps during setup)
 if (!process.env.OPENAI_API_KEY) {
 console.warn("⚠️ Warning: OPENAI_API_KEY is not set. AI routes will fail without it.");
 }
 
 // 📊 Route: Simulated analytics data for the charts
 app.get("/api/data", (req, res) => {
 res.json({
 // weekly listening growth trend (fictional but data-driven)
 weeklyListening: [20, 35, 50, 65, 80, 95, 110],
 
 // free to premium conversion rates (fictional but realistic)
 freeToPremium: [8, 10, 14, 19, 24, 28, 32],
 
 // actual growth patterns from the Spotify report
 regions: {
 France: 10, // 10% MoM growth
 Netherlands: 10, // 10% MoM growth
 Germany: 10, // 10% MoM growth after 6 months
 UK: 31, // 31% YoY revenue growth
 US: 14, // 14% growth in adults
 },
 
 campaignData: {
 versionA: { conversions: 360, users: 1000 }, // baseline campaign
 versionB: { conversions: 460, users: 1000 }, // improved campaign
 audiobooksPlus: { conversions: 180, users: 800 }, // +18% usage after 30 days
 },
 });
 });
 
 
 // 🧠 Route: AI Insight Generator
 app.post("/api/insight", async (req, res) => {
 const { message } = req.body;
 
 try {
 const prompt = `You are Spotify's Growth Analyst.
 
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
 
 const completion = await openai.chat.completions.create({
 model: "gpt-4o-mini",
 messages: [{ role: "user", content: prompt }],
 });
 
 // Be defensive when reading the SDK response
 const aiResponse = completion?.choices?.[0]?.message?.content ?? null;
 if (!aiResponse) {
 console.error("OpenAI returned an unexpected response:", completion);
 return res.status(502).json({ reply: "Error: Invalid response from AI service." });
 }
 
 res.json({ reply: aiResponse });
 } catch (error) {
 console.error("Error generating insight:", error);
 res.status(500).json({ reply: "Error: Could not generate insight." });
 }
 });
 
 // 🎧 Start Server
// 🎧 Start Server
 app.listen(PORT, () => {
 console.log(`🎧 Spotify Growth Dashboard running at http://localhost:${PORT}`);
 });
 // 🌿 Spotify Growth Dashboard Backend (AI Integrated)