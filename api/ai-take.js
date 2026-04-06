// Vercel serverless function — AI Take for Compare panel
// Uses Gemini 2.5 Flash Lite: ~$0.00008/call, free tier: 1,000 req/day
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { games } = req.body || {};
  if (!Array.isArray(games) || games.length < 2 || games.length > 3) {
    return res.status(400).json({ error: "Provide 2–3 games" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ takes: null, error: "AI not configured" });
  }

  // Serialize games as readable text — more token-efficient than raw JSON
  const gameLines = games.map((g, i) => {
    const genres = (g.genre || []).slice(0, 3).join(", ");
    const multi = [g.pk && "parent+kid", g.sib && "siblings", g.coop && "co-op"]
      .filter(Boolean).join(", ") || "solo only";
    const score = [g.mc && `Metacritic ${g.mc}`, g.ign && `IGN ${g.ign}`]
      .filter(Boolean).join(", ") || "no score";
    const price = g.price === 0 ? "Free" : `$${g.price}`;
    return `Game ${i + 1}: ${g.title} — ${genres}, ESRB ${g.rating}, ${price}, ${score}, ${multi}, playtime: ${g.time}`;
  }).join("\n");

  const prompt = `You are a concise family game advisor helping parents choose the right game for their kids.

Here are the games being compared:
${gameLines}

For each game write exactly ONE sentence (max 20 words) starting with the game number like "Game 1:" that explains who it best suits and whether it's the top pick among these options. Mention ideal age range. Be direct and specific.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini error:", err);
      return res.status(200).json({ takes: null, error: "AI request failed" });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse "Game N: <sentence>" lines into a per-game array
    const takes = games.map((_, i) => {
      const pattern = new RegExp(`Game\\s*${i + 1}\\s*:?\\s*(.+?)(?=Game\\s*${i + 2}|$)`, "is");
      const match = text.match(pattern);
      return match ? match[1].trim() : null;
    });

    return res.status(200).json({ takes });
  } catch (err) {
    console.error("AI Take error:", err);
    return res.status(200).json({ takes: null, error: "AI unavailable" });
  }
}
