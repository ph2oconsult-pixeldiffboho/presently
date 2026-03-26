// Vercel Serverless Function — proxies requests to Anthropic API
// Your ANTHROPIC_API_KEY is set as an environment variable in Vercel dashboard

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const { category, usedAuthors } = req.body;

    if (!category) {
      return res.status(400).json({ error: "category is required" });
    }

    const CATEGORY_LABELS = {
      all: "any theme including gratitude, personal development, mindset, manifestation, purpose, lifelong learning, or spiritual connection",
      gratitude: "gratitude and thankfulness",
      growth: "personal growth and self-improvement",
      mindset: "mindset, mental strength, and resilience",
      manifestation: "manifestation, intention, and creative visualization",
      purpose: "life purpose and meaning",
      learning: "lifelong learning and the pursuit of knowledge",
      spiritual: "spiritual connection, nature, and inner wisdom",
    };

    const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.all;
    const usedList =
      usedAuthors && usedAuthors.length > 0
        ? `\n\nIMPORTANT: Do NOT use any of these authors who have already been shown: ${usedAuthors.slice(-40).join(", ")}.`
        : "";

    const prompt = `You are a curator of wisdom quotes from across all world cultures and eras. Return exactly 5 real, verifiable quotes about ${categoryLabel}.

CRITICAL RULES:
- Only return REAL quotes from REAL historical or contemporary figures
- Draw from diverse traditions: ancient Chinese (Confucius, Zhuangzi, Mencius, Sun Tzu, Wang Yangming, Li Bai), Japanese (Matsuo Basho, Miyamoto Musashi, Dogen, Hakuin, Kenko), Indian (Upanishads, Kabir, Tagore, Vivekananda, Sri Aurobindo), Persian/Sufi (Rumi, Hafiz, Saadi, Omar Khayyam, Kahlil Gibran), African (Ubuntu philosophy, Chinua Achebe, Desmond Tutu, Wangari Maathai, Nelson Mandela, African proverbs from Yoruba, Zulu, Maasai, Ashanti traditions), Indigenous peoples (Lakota, Maori, Aboriginal Australian, First Nations, Navajo, Hopi, Cherokee leaders, Don Miguel Ruiz), ancient Greek/Roman (Stoics, Plato, Heraclitus, Epictetus, Plutarch), modern inspirational leaders (Oprah Winfrey, Michelle Obama, Mel Robbins, Brené Brown, Tony Robbins, Wayne Dyer, Deepak Chopra, Louise Hay, Robin Sharma, Jay Shetty, Simon Sinek, Elizabeth Gilbert, Gabby Bernstein, Marianne Williamson, Iyanla Vanzant, Les Brown), and classic modern thinkers (Alan Watts, Ram Dass, Paulo Coelho, Pema Chodron, bell hooks, Maya Angelou, James Baldwin, Joseph Campbell, Viktor Frankl, Thich Nhat Hanh)
- Each quote must include the real person's name and a brief era description with dates
- Classify tradition as: eastern, western, indigenous, modern, or african
- Classify category as one of: gratitude, growth, mindset, manifestation, purpose, learning, spiritual${usedList}

Respond with ONLY a raw JSON array. No markdown, no backticks, no explanation:
[{"text":"quote text","author":"Full Name","era":"Role/Title, dates","category":"category_id","tradition":"tradition_id"}]`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(response.status).json({ error: "Anthropic API error", details: errText });
    }

    const data = await response.json();
    const text = data.content
      ?.map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    if (!text) {
      return res.status(500).json({ error: "Empty response from Anthropic" });
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const quotes = JSON.parse(clean);

    return res.status(200).json({ quotes });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
