// Vercel Serverless Function — Presently Daily Alignment API
// Returns: quote + carry (micro-action) + reflection question
// Matched to the user's emotional state

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const { state, usedAuthors, yesterdayReflection } = req.body;

    if (!state) {
      return res.status(400).json({ error: "state is required" });
    }

    const STATE_CONTEXTS = {
      restless: "someone feeling restless, unfocused, or agitated — needing to slow down and find centre",
      heavy: "someone carrying emotional weight, grief, exhaustion, or burden — needing gentleness and perspective",
      searching: "someone in transition, questioning their path, seeking direction or meaning",
      steady: "someone feeling grounded and present — wanting to deepen that calm and build on it",
      open: "someone feeling expansive, grateful, and receptive — ready to grow and give",
    };

    const stateContext = STATE_CONTEXTS[state] || STATE_CONTEXTS.searching;
    const usedList =
      usedAuthors && usedAuthors.length > 0
        ? `\nDo NOT use these authors: ${usedAuthors.slice(-30).join(", ")}.`
        : "";

    const yesterdayContext = yesterdayReflection
      ? `\nYesterday the user reflected: "${yesterdayReflection}". Let this subtly inform your choice — build on their thread without referencing it directly.`
      : "";

    const prompt = `You are the voice of Presently — a daily alignment app. The user has just checked in. They are feeling: ${stateContext}.${yesterdayContext}

Return exactly ONE entry with three parts:

1. "quote" — a real, verifiable quote from a real person that speaks to this emotional state. Draw from: ancient Chinese philosophers (Confucius, Zhuangzi, Mencius, Lao Tzu, Wang Yangming), Japanese wisdom (Matsuo Basho, Miyamoto Musashi, Dogen, Kenko), Indian tradition (Upanishads, Kabir, Tagore, Vivekananda, Thich Nhat Hanh), Persian/Sufi poets (Rumi, Hafiz, Saadi, Kahlil Gibran), African wisdom (Desmond Tutu, Nelson Mandela, Wangari Maathai, Ubuntu philosophy, Yoruba/Zulu/Ashanti proverbs), Indigenous peoples (Lakota, Maori, Aboriginal Australian, Chief Seattle, Oren Lyons), Stoics (Marcus Aurelius, Seneca, Epictetus), modern leaders (Oprah Winfrey, Michelle Obama, Mel Robbins, Brene Brown, Maya Angelou, Wayne Dyer, Deepak Chopra, Tony Robbins, Louise Hay, Robin Sharma, Viktor Frankl, Alan Watts, Ram Dass, Paulo Coelho, Pema Chodron, Joseph Campbell).

2. "carry" — a specific, concrete micro-action they can do TODAY. One sentence. Not advice. Not a tip. A thing to physically do. Examples: "Before your first conversation today, pause for one full breath." or "Send a message to someone you're grateful for. No occasion needed." Make it achievable in under 60 seconds.

3. "reflection" — one question that invites honest self-examination. Not therapeutic. Not corporate. Intelligent and human. Example: "What would shift if you actually believed this?" or "Where in your life are you reacting instead of choosing?"

Also include: author, era (role + dates), tradition (eastern/western/indigenous/modern/african).${usedList}

Respond with ONLY raw JSON. No markdown, no backticks:
{"quote":"...","author":"...","era":"...","tradition":"...","carry":"...","reflection":"..."}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(response.status).json({ error: "Upstream error" });
    }

    const data = await response.json();
    const text = data.content
      ?.map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    if (!text) {
      return res.status(500).json({ error: "Empty response" });
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const entry = JSON.parse(clean);

    return res.status(200).json(entry);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
