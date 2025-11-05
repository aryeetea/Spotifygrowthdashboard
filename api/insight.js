import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ reply: "Method Not Allowed" });
  }
  try {
    const { message = "" } = req.body || {};
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const aiResponse = completion?.choices?.[0]?.message?.content ?? null;
    if (!aiResponse) return res.status(502).json({ reply: "Error: Invalid response from AI service." });
    res.status(200).json({ reply: aiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error: Could not generate insight." });
  }
}