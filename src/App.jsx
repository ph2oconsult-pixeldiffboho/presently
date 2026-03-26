import { useState, useEffect, useCallback, useRef } from "react";

const CATEGORIES = [
  { id: "all", label: "All Wisdom", icon: "✦" },
  { id: "gratitude", label: "Gratitude", icon: "🙏" },
  { id: "growth", label: "Personal Growth", icon: "🌱" },
  { id: "mindset", label: "Mindset", icon: "🧠" },
  { id: "manifestation", label: "Manifestation", icon: "✨" },
  { id: "purpose", label: "Purpose", icon: "🧭" },
  { id: "learning", label: "Lifelong Learning", icon: "📖" },
  { id: "spiritual", label: "Spiritual Connection", icon: "🕊" },
];

const SEED_QUOTES = [
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive — to breathe, to think, to enjoy, to love.", author: "Marcus Aurelius", era: "Roman Emperor & Stoic Philosopher, 121–180 AD", category: "gratitude", tradition: "western" },
  { text: "Enough is a feast.", author: "Buddhist Proverb", era: "Ancient Buddhist Teaching", category: "gratitude", tradition: "eastern" },
  { text: "If the only prayer you ever say in your entire life is thank you, it will be enough.", author: "Meister Eckhart", era: "German Theologian & Mystic, 1260–1328", category: "gratitude", tradition: "western" },
  { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Indigenous Proverb", era: "Traditional Indigenous Wisdom", category: "gratitude", tradition: "indigenous" },
  { text: "When eating bamboo sprouts, remember the one who planted them.", author: "Chinese Proverb", era: "Traditional Chinese Wisdom", category: "gratitude", tradition: "eastern" },
  { text: "Acknowledging the good that you already have in your life is the foundation for all abundance.", author: "Eckhart Tolle", era: "Contemporary Spiritual Teacher", category: "gratitude", tradition: "modern" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", era: "Chinese Philosopher, 6th Century BC", category: "growth", tradition: "eastern" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb", era: "Traditional Japanese Wisdom", category: "growth", tradition: "eastern" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "growth", tradition: "eastern" },
  { text: "A gem cannot be polished without friction, nor a person perfected without trials.", author: "Seneca", era: "Roman Stoic Philosopher, 4 BC–65 AD", category: "growth", tradition: "western" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", era: "American Philosopher & Historian, 1885–1981", category: "growth", tradition: "western" },
  { text: "The mind is everything. What you think, you become.", author: "The Buddha", era: "Spiritual Teacher, c. 563–483 BC", category: "mindset", tradition: "eastern" },
  { text: "The obstacle is the path.", author: "Zen Proverb", era: "Traditional Zen Buddhist Teaching", category: "mindset", tradition: "eastern" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl", era: "Austrian Psychiatrist, 1905–1997", category: "mindset", tradition: "western" },
  { text: "To the mind that is still, the whole universe surrenders.", author: "Lao Tzu", era: "Chinese Philosopher, 6th Century BC", category: "mindset", tradition: "eastern" },
  { text: "What you seek is seeking you.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "manifestation", tradition: "eastern" },
  { text: "The universe is not outside of you. Look inside yourself; everything that you want, you already are.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "manifestation", tradition: "eastern" },
  { text: "All that we are is the result of what we have thought.", author: "The Buddha", era: "Spiritual Teacher, c. 563–483 BC", category: "manifestation", tradition: "eastern" },
  { text: "Your word is the power that you have to create.", author: "Don Miguel Ruiz", era: "Mexican Toltec Spiritualist, b. 1938", category: "manifestation", tradition: "indigenous" },
  { text: "Once you make a decision, the universe conspires to make it happen.", author: "Ralph Waldo Emerson", era: "American Philosopher, 1803–1882", category: "manifestation", tradition: "western" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", era: "German Philosopher, 1844–1900", category: "purpose", tradition: "western" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain", era: "American Author, 1835–1910", category: "purpose", tradition: "western" },
  { text: "We are all visitors to this time, this place. We are just passing through. Our purpose here is to observe, to learn, to grow, to love — and then we return home.", author: "Aboriginal Australian Proverb", era: "Traditional Aboriginal Wisdom", category: "purpose", tradition: "indigenous" },
  { text: "When you do things from your soul, you feel a river moving in you, a joy.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "purpose", tradition: "eastern" },
  { text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius", era: "Chinese Philosopher, 551–479 BC", category: "learning", tradition: "eastern" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb", era: "Traditional Chinese Wisdom", category: "learning", tradition: "eastern" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", era: "Indian Spiritual Leader, 1869–1948", category: "learning", tradition: "eastern" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", era: "Greek Philosopher, 470–399 BC", category: "learning", tradition: "western" },
  { text: "A single conversation with a wise person is worth a month's study of books.", author: "Chinese Proverb", era: "Traditional Chinese Wisdom", category: "learning", tradition: "eastern" },
  { text: "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.", author: "Pierre Teilhard de Chardin", era: "French Jesuit & Philosopher, 1881–1955", category: "spiritual", tradition: "western" },
  { text: "Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power.", author: "Lao Tzu", era: "Chinese Philosopher, 6th Century BC", category: "spiritual", tradition: "eastern" },
  { text: "Humankind has not woven the web of life. We are but one thread within it. Whatever we do to the web, we do to ourselves.", author: "Chief Seattle", era: "Suquamish & Duwamish Chief, 1786–1866", category: "spiritual", tradition: "indigenous" },
  { text: "The Great Spirit is in all things. He is in the air we breathe. The Great Spirit is our Father, but the Earth is our Mother.", author: "Big Thunder (Bedagi)", era: "Wabanaki Algonquin Nation", category: "spiritual", tradition: "indigenous" },
  { text: "Silence is the language of God; all else is poor translation.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "spiritual", tradition: "eastern" },
  { text: "When we walk upon Mother Earth, we always plant our feet carefully because we know the faces of our future generations are looking up at us from beneath the ground.", author: "Oren Lyons", era: "Onondaga Nation Faithkeeper", category: "spiritual", tradition: "indigenous" },
  { text: "Waking up this morning, I smile. Twenty-four brand new hours are before me.", author: "Thich Nhat Hanh", era: "Vietnamese Zen Buddhist Monk, 1926–2022", category: "spiritual", tradition: "eastern" },

  // === MEL ROBBINS ===
  { text: "You are one decision away from a completely different life.", author: "Mel Robbins", era: "American Motivational Speaker & Author, b. 1968", category: "mindset", tradition: "modern" },
  { text: "Stop saying you're fine. Discover a more powerful you.", author: "Mel Robbins", era: "American Motivational Speaker & Author, b. 1968", category: "growth", tradition: "modern" },
  { text: "If you have the courage to start, you have the courage to succeed.", author: "Mel Robbins", era: "American Motivational Speaker & Author, b. 1968", category: "manifestation", tradition: "modern" },

  // === MICHELLE OBAMA ===
  { text: "There is no limit to what we, as women, can accomplish.", author: "Michelle Obama", era: "Former U.S. First Lady & Author, b. 1964", category: "growth", tradition: "modern" },
  { text: "When they go low, we go high.", author: "Michelle Obama", era: "Former U.S. First Lady & Author, b. 1964", category: "mindset", tradition: "modern" },
  { text: "Your story is what you have, what you will always have. It is something to own.", author: "Michelle Obama", era: "Former U.S. First Lady & Author, b. 1964", category: "purpose", tradition: "modern" },
  { text: "Success is not about how much money you make; it's about the difference you make in people's lives.", author: "Michelle Obama", era: "Former U.S. First Lady & Author, b. 1964", category: "purpose", tradition: "modern" },

  // === OPRAH WINFREY ===
  { text: "Be thankful for what you have; you'll end up having more. If you concentrate on what you don't have, you will never, ever have enough.", author: "Oprah Winfrey", era: "American Media Leader & Philanthropist, b. 1954", category: "gratitude", tradition: "modern" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey", era: "American Media Leader & Philanthropist, b. 1954", category: "growth", tradition: "modern" },
  { text: "The biggest adventure you can ever take is to live the life of your dreams.", author: "Oprah Winfrey", era: "American Media Leader & Philanthropist, b. 1954", category: "manifestation", tradition: "modern" },
  { text: "You become what you believe, not what you think or what you want.", author: "Oprah Winfrey", era: "American Media Leader & Philanthropist, b. 1954", category: "mindset", tradition: "modern" },

  // === BRENÉ BROWN ===
  { text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome.", author: "Brené Brown", era: "American Research Professor & Author, b. 1965", category: "growth", tradition: "modern" },
  { text: "You are imperfect, you are wired for struggle, but you are worthy of love and belonging.", author: "Brené Brown", era: "American Research Professor & Author, b. 1965", category: "spiritual", tradition: "modern" },

  // === MAYA ANGELOU ===
  { text: "We delight in the beauty of the butterfly, but rarely admit the changes it has gone through to achieve that beauty.", author: "Maya Angelou", era: "American Poet & Civil Rights Activist, 1928–2014", category: "growth", tradition: "modern" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou", era: "American Poet & Civil Rights Activist, 1928–2014", category: "purpose", tradition: "modern" },

  // === WAYNE DYER ===
  { text: "When you change the way you look at things, the things you look at change.", author: "Wayne Dyer", era: "American Self-Help Author & Speaker, 1940–2015", category: "mindset", tradition: "modern" },
  { text: "Abundance is not something we acquire. It is something we tune into.", author: "Wayne Dyer", era: "American Self-Help Author & Speaker, 1940–2015", category: "manifestation", tradition: "modern" },

  // === DEEPAK CHOPRA ===
  { text: "Every time you are tempted to react in the same old way, ask if you want to be a prisoner of the past or a pioneer of the future.", author: "Deepak Chopra", era: "Indian-American Author & Wellness Advocate, b. 1946", category: "mindset", tradition: "modern" },
  { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra", era: "Indian-American Author & Wellness Advocate, b. 1946", category: "spiritual", tradition: "modern" },

  // === TONY ROBBINS ===
  { text: "It is in your moments of decision that your destiny is shaped.", author: "Tony Robbins", era: "American Life Coach & Author, b. 1960", category: "manifestation", tradition: "modern" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", era: "American Life Coach & Author, b. 1960", category: "growth", tradition: "modern" },

  // === JAY SHETTY ===
  { text: "When you learn to live for others, they will live for you.", author: "Jay Shetty", era: "British-American Author & Former Monk, b. 1987", category: "purpose", tradition: "modern" },

  // === ADDITIONAL RUMI ===
  { text: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "manifestation", tradition: "eastern" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "growth", tradition: "eastern" },
  { text: "Don't be satisfied with stories, how things have gone with others. Unfold your own myth.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", category: "purpose", tradition: "eastern" },

  // === NELSON MANDELA ===
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", era: "South African Leader & Nobel Laureate, 1918–2013", category: "mindset", tradition: "african" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", era: "South African Leader & Nobel Laureate, 1918–2013", category: "learning", tradition: "african" },

  // === DESMOND TUTU ===
  { text: "Hope is being able to see that there is light despite all of the darkness.", author: "Desmond Tutu", era: "South African Archbishop & Nobel Laureate, 1931–2021", category: "mindset", tradition: "african" },

  // === ROBIN SHARMA ===
  { text: "Don't live the same year 75 times and call it a life.", author: "Robin Sharma", era: "Canadian Author & Leadership Speaker, b. 1964", category: "growth", tradition: "modern" },

  // === LOUISE HAY ===
  { text: "You have been criticising yourself for years, and it hasn't worked. Try approving of yourself and see what happens.", author: "Louise Hay", era: "American Motivational Author, 1926–2017", category: "mindset", tradition: "modern" },

  // === KAHLIL GIBRAN ===
  { text: "Your living is determined not so much by what life brings to you as by the attitude you bring to life.", author: "Kahlil Gibran", era: "Lebanese-American Poet & Philosopher, 1883–1931", category: "mindset", tradition: "eastern" },
];

const TRADITION_COLORS = {
  eastern: { bg: "rgba(220,38,38,0.08)", border: "#b91c1c", label: "Eastern" },
  western: { bg: "rgba(37,99,235,0.08)", border: "#1d4ed8", label: "Western" },
  indigenous: { bg: "rgba(217,119,6,0.08)", border: "#b45309", label: "Indigenous" },
  modern: { bg: "rgba(16,185,129,0.08)", border: "#059669", label: "Modern" },
  african: { bg: "rgba(168,85,247,0.08)", border: "#7c3aed", label: "African" },
};

const FONTS_LINK = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap";

async function fetchAIQuotes(category, usedAuthors) {
  const response = await fetch("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, usedAuthors: usedAuthors.slice(-40) }),
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  return data.quotes;
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "3rem" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", opacity: 0.3,
          animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1.3)}}`}</style>
    </div>
  );
}

export default function WisdomQuotes() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentQuote, setCurrentQuote] = useState(null);
  const [fadeState, setFadeState] = useState("in");
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [totalServed, setTotalServed] = useState(0);
  const [aiStatus, setAiStatus] = useState("ready"); // ready | fetching | fallback
  const [statusMsg, setStatusMsg] = useState(null);

  const queueRef = useRef({});
  const usedAuthorsRef = useRef(new Set());
  const fetchingRef = useRef({});

  const getQueue = (cat) => queueRef.current[cat] || [];
  const setQueue = (cat, quotes) => { queueRef.current[cat] = quotes; };

  const prefetch = useCallback(async (cat) => {
    if (fetchingRef.current[cat]) return;
    fetchingRef.current[cat] = true;
    try {
      const usedArr = Array.from(usedAuthorsRef.current);
      const newQuotes = await fetchAIQuotes(cat, usedArr);
      const existing = getQueue(cat);
      const deduped = newQuotes.filter(
        (q) => !usedAuthorsRef.current.has(q.author) && !existing.some((e) => e.author === q.author)
      );
      setQueue(cat, [...existing, ...deduped]);
    } catch (e) {
      console.warn("Prefetch failed:", e);
    } finally {
      fetchingRef.current[cat] = false;
    }
  }, []);

  const pickSeed = useCallback((cat) => {
    const seeds = cat === "all" ? SEED_QUOTES : SEED_QUOTES.filter((q) => q.category === cat);
    const unused = seeds.filter((q) => !usedAuthorsRef.current.has(q.author));
    const pool = unused.length > 0 ? unused : seeds;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedAuthorsRef.current.add(pick.author);
    return pick;
  }, []);

  const getNextQuote = useCallback(async (cat) => {
    // Try queue first
    const queue = getQueue(cat);
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(cat, rest);
      usedAuthorsRef.current.add(next.author);
      if (rest.length <= 2) prefetch(cat);
      return next;
    }

    // Try API
    if (aiStatus !== "fallback") {
      setAiStatus("fetching");
      try {
        const usedArr = Array.from(usedAuthorsRef.current);
        const newQuotes = await fetchAIQuotes(cat, usedArr);
        const deduped = newQuotes.filter((q) => !usedAuthorsRef.current.has(q.author));
        const pool = deduped.length > 0 ? deduped : newQuotes;
        const [next, ...rest] = pool;
        if (rest.length > 0) setQueue(cat, rest);
        usedAuthorsRef.current.add(next.author);
        setAiStatus("ready");
        return next;
      } catch (e) {
        console.error("AI fetch failed:", e);
        setAiStatus("fallback");
        setStatusMsg("AI unavailable — showing curated wisdom");
        return pickSeed(cat);
      }
    }

    return pickSeed(cat);
  }, [aiStatus, prefetch, pickSeed]);

  const showNewQuote = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setStatusMsg(null);
    setFadeState("out");

    try {
      const q = await getNextQuote(activeCategory);
      setTimeout(() => {
        setCurrentQuote(q);
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), q]);
        setHistoryIndex((prev) => prev + 1);
        setTotalServed((prev) => prev + 1);
        setFadeState("in");
        setLoading(false);
      }, 420);
    } catch (e) {
      const fallback = pickSeed(activeCategory);
      setTimeout(() => {
        setCurrentQuote(fallback);
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), fallback]);
        setHistoryIndex((prev) => prev + 1);
        setTotalServed((prev) => prev + 1);
        setFadeState("in");
        setLoading(false);
      }, 420);
    }
  }, [activeCategory, getNextQuote, historyIndex, loading, pickSeed]);

  const goBack = () => {
    if (historyIndex > 0) {
      setFadeState("out");
      setTimeout(() => {
        setHistoryIndex((prev) => prev - 1);
        setCurrentQuote(history[historyIndex - 1]);
        setFadeState("in");
      }, 400);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setFadeState("out");
      setTimeout(() => {
        setHistoryIndex((prev) => prev + 1);
        setCurrentQuote(history[historyIndex + 1]);
        setFadeState("in");
      }, 400);
    }
  };

  const toggleFavorite = () => {
    if (!currentQuote) return;
    setFavorites((prev) => {
      const exists = prev.find((f) => f.text === currentQuote.text);
      if (exists) return prev.filter((f) => f.text !== currentQuote.text);
      return [...prev, currentQuote];
    });
  };

  const isFavorited = currentQuote && favorites.some((f) => f.text === currentQuote.text);

  // Boot
  useEffect(() => {
    const pick = pickSeed("all");
    setCurrentQuote(pick);
    setHistory([pick]);
    setHistoryIndex(0);
    setTotalServed(1);
    prefetch("all");
  }, []);

  // Category switch
  useEffect(() => {
    setFadeState("out");
    const pick = pickSeed(activeCategory);
    setTimeout(() => {
      setCurrentQuote(pick);
      setHistory([pick]);
      setHistoryIndex(0);
      setTotalServed((prev) => prev + 1);
      setFadeState("in");
    }, 400);
    prefetch(activeCategory);
  }, [activeCategory]);

  const tradition = currentQuote ? TRADITION_COLORS[currentQuote.tradition] || TRADITION_COLORS.modern : null;

  return (
    <>
      <link href={FONTS_LINK} rel="stylesheet" />
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--bg:#0f0f0f;--surface:#1a1a1a;--surface2:#242424;--text:#e8e4de;--text-dim:#8a8580;--accent:#c9a96e;--accent-glow:rgba(201,169,110,0.15)}
        body{background:var(--bg);color:var(--text);font-family:'Outfit',sans-serif}
        .app{min-height:100vh;display:flex;flex-direction:column;align-items:center;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,169,110,0.06) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 100%,rgba(120,80,40,0.04) 0%,transparent 50%),var(--bg);padding:2rem 1rem;position:relative;overflow:hidden}
        .app::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none}
        .header{text-align:center;margin-bottom:2rem;position:relative;z-index:1}
        .header h1{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:2.8rem;letter-spacing:0.08em;color:var(--accent);margin-bottom:0.25rem}
        .header p{font-weight:300;font-size:0.85rem;color:var(--text-dim);letter-spacing:0.15em;text-transform:uppercase}
        .ai-pill{display:inline-flex;align-items:center;gap:0.35rem;margin-top:0.65rem;padding:0.25rem 0.75rem;border-radius:100px;font-size:0.65rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase}
        .ai-pill.live{border:1px solid rgba(16,185,129,0.35);color:#10b981;background:rgba(16,185,129,0.06)}
        .ai-pill.loading{border:1px solid rgba(201,169,110,0.35);color:var(--accent);background:rgba(201,169,110,0.06)}
        .ai-pill.off{border:1px solid rgba(239,68,68,0.25);color:#ef4444;background:rgba(239,68,68,0.05)}
        .dot{width:6px;height:6px;border-radius:50%;display:inline-block}
        .dot.green{background:#10b981}
        .dot.amber{background:var(--accent);animation:blink 1s infinite}
        .dot.red{background:#ef4444}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .categories{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;max-width:700px;margin-bottom:2.5rem;position:relative;z-index:1}
        .cat-btn{background:var(--surface);border:1px solid rgba(255,255,255,0.06);color:var(--text-dim);padding:0.5rem 1rem;border-radius:100px;cursor:pointer;font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:400;letter-spacing:0.03em;transition:all 0.3s ease;display:flex;align-items:center;gap:0.4rem}
        .cat-btn:hover{background:var(--surface2);color:var(--text);border-color:rgba(255,255,255,0.1)}
        .cat-btn.active{background:var(--accent-glow);border-color:var(--accent);color:var(--accent);font-weight:500}
        .quote-container{max-width:720px;width:100%;position:relative;z-index:1}
        .quote-card{background:var(--surface);border:1px solid rgba(255,255,255,0.05);border-radius:1.5rem;padding:3rem 2.5rem;position:relative;overflow:hidden;transition:opacity 0.4s ease,transform 0.4s ease;min-height:220px}
        .quote-card.fade-out{opacity:0;transform:translateY(8px)}
        .quote-card.fade-in{opacity:1;transform:translateY(0)}
        .quote-card::before{content:'"';position:absolute;top:-0.3rem;left:1.2rem;font-family:'Cormorant Garamond',serif;font-size:8rem;color:var(--accent);opacity:0.08;line-height:1}
        .tradition-badge{display:inline-flex;align-items:center;gap:0.35rem;padding:0.3rem 0.75rem;border-radius:100px;font-size:0.7rem;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:1.5rem;border:1px solid}
        .quote-text{font-family:'Cormorant Garamond',serif;font-size:1.65rem;font-weight:400;line-height:1.55;color:var(--text);margin-bottom:2rem;font-style:italic}
        .quote-attribution{display:flex;flex-direction:column;gap:0.2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.06)}
        .author-name{font-weight:500;font-size:1rem;color:var(--accent);letter-spacing:0.02em}
        .author-era{font-weight:300;font-size:0.8rem;color:var(--text-dim);letter-spacing:0.03em}
        .controls{display:flex;align-items:center;justify-content:center;gap:0.75rem;margin-top:2rem}
        .ctrl-btn{background:var(--surface);border:1px solid rgba(255,255,255,0.06);color:var(--text-dim);width:48px;height:48px;border-radius:50%;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease}
        .ctrl-btn:hover:not(:disabled){background:var(--surface2);color:var(--text);border-color:rgba(255,255,255,0.12);transform:scale(1.05)}
        .ctrl-btn:disabled{opacity:0.25;cursor:not-allowed}
        .ctrl-btn.primary{width:64px;height:64px;background:linear-gradient(135deg,var(--accent),#a07d45);border:none;color:#0f0f0f;font-size:1.4rem;font-weight:600;box-shadow:0 4px 24px rgba(201,169,110,0.25)}
        .ctrl-btn.primary:hover:not(:disabled){transform:scale(1.08);box-shadow:0 6px 32px rgba(201,169,110,0.35)}
        .ctrl-btn.primary:disabled{opacity:0.5}
        .ctrl-btn.fav-active{color:#ef4444;border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.08)}
        .status-msg{text-align:center;margin-top:1rem;font-size:0.75rem;color:#f59e0b;letter-spacing:0.03em}
        .fav-toggle-bar{display:flex;justify-content:center;margin-top:2rem}
        .fav-toggle-btn{background:none;border:none;color:var(--text-dim);font-family:'Outfit',sans-serif;font-size:0.8rem;letter-spacing:0.08em;cursor:pointer;padding:0.5rem 1rem;transition:color 0.2s;text-transform:uppercase}
        .fav-toggle-btn:hover{color:var(--accent)}
        .favorites-panel{max-width:720px;width:100%;margin-top:1.5rem;position:relative;z-index:1}
        .fav-card{background:var(--surface);border:1px solid rgba(255,255,255,0.05);border-radius:1rem;padding:1.5rem;margin-bottom:0.75rem;transition:border-color 0.2s}
        .fav-card:hover{border-color:rgba(201,169,110,0.15)}
        .fav-card .fav-text{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-style:italic;line-height:1.5;margin-bottom:0.75rem;color:var(--text)}
        .fav-card .fav-author{font-size:0.8rem;color:var(--accent);font-weight:500}
        .fav-remove{background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:0.75rem;font-family:'Outfit',sans-serif;margin-top:0.5rem;padding:0;transition:color 0.2s}
        .fav-remove:hover{color:#ef4444}
        .counter{text-align:center;margin-top:2rem;font-size:0.7rem;color:var(--text-dim);letter-spacing:0.1em;text-transform:uppercase;position:relative;z-index:1}
        @media(max-width:600px){.header h1{font-size:2rem}.quote-card{padding:2rem 1.5rem}.quote-text{font-size:1.3rem}.categories{gap:0.35rem}.cat-btn{padding:0.4rem 0.75rem;font-size:0.72rem}}
      `}</style>

      <div className="app">
        <header className="header">
          <h1>Presently</h1>
          <p>Daily Quotes for a Calmer Mind</p>
          <div className={`ai-pill ${aiStatus === "fallback" ? "off" : aiStatus === "fetching" ? "loading" : "live"}`}>
            <span className={`dot ${aiStatus === "fallback" ? "red" : aiStatus === "fetching" ? "amber" : "green"}`} />
            {aiStatus === "fallback" ? "Curated Collection" : aiStatus === "fetching" ? "Discovering Wisdom…" : "AI-Powered · Unlimited"}
          </div>
        </header>

        <nav className="categories">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} className={`cat-btn ${activeCategory === cat.id ? "active" : ""}`} onClick={() => setActiveCategory(cat.id)}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </nav>

        <div className="quote-container">
          {loading && !currentQuote ? (
            <div className="quote-card fade-in"><Loader /></div>
          ) : currentQuote ? (
            <div className={`quote-card fade-${fadeState}`}>
              {tradition && (
                <div className="tradition-badge" style={{ background: tradition.bg, borderColor: tradition.border, color: tradition.border }}>
                  <span style={{ fontSize: "0.55rem" }}>●</span>
                  {tradition.label} Wisdom
                </div>
              )}
              <div className="quote-text">{currentQuote.text}</div>
              <div className="quote-attribution">
                <span className="author-name">{currentQuote.author}</span>
                <span className="author-era">{currentQuote.era}</span>
              </div>
            </div>
          ) : null}

          <div className="controls">
            <button className="ctrl-btn" onClick={goBack} disabled={historyIndex <= 0} title="Previous">‹</button>
            <button className={`ctrl-btn ${isFavorited ? "fav-active" : ""}`} onClick={toggleFavorite} title={isFavorited ? "Remove from favorites" : "Save to favorites"}>
              {isFavorited ? "♥" : "♡"}
            </button>
            <button className="ctrl-btn primary" onClick={showNewQuote} disabled={loading} title="New quote">
              {loading ? "…" : "✦"}
            </button>
            <button className="ctrl-btn" onClick={goForward} disabled={historyIndex >= history.length - 1} title="Next">›</button>
          </div>

          {statusMsg && <div className="status-msg">{statusMsg}</div>}
        </div>

        {favorites.length > 0 && (
          <div className="fav-toggle-bar">
            <button className="fav-toggle-btn" onClick={() => setShowFavorites(!showFavorites)}>
              {showFavorites ? "Hide" : "Show"} Favorites ({favorites.length})
            </button>
          </div>
        )}

        {showFavorites && favorites.length > 0 && (
          <div className="favorites-panel">
            {favorites.map((fav, i) => (
              <div className="fav-card" key={i}>
                <div className="fav-text">"{fav.text}"</div>
                <div className="fav-author">— {fav.author}</div>
                <button className="fav-remove" onClick={() => setFavorites((prev) => prev.filter((f) => f.text !== fav.text))}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="counter">
          {totalServed} quotes explored{history.length > 1 ? ` · ${history.length} in history` : ""}{favorites.length > 0 ? ` · ${favorites.length} saved` : ""}
        </div>
      </div>
    </>
  );
}
