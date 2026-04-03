import { useState, useEffect, useCallback, useRef } from "react";

// ─── Seed data for offline fallback ───
const SEED_ENTRIES = {
  restless: [
    { quote: "To the mind that is still, the whole universe surrenders.", author: "Lao Tzu", era: "Chinese Philosopher, 6th Century BC", tradition: "eastern", carry: "Close your eyes for ten seconds right now. Just breathe. Nothing else.", reflection: "What would you do differently today if you weren't in a rush?" },
    { quote: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl", era: "Austrian Psychiatrist, 1905–1997", tradition: "western", carry: "The next time you feel reactive today, wait three seconds before responding.", reflection: "Where in your life are you reacting instead of choosing?" },
    { quote: "You are one decision away from a completely different life.", author: "Mel Robbins", era: "American Author & Speaker, b. 1968", tradition: "modern", carry: "Pick one thing on your mind. Decide on it now. Don't revisit it today.", reflection: "What have you been circling around instead of deciding?" },
  ],
  heavy: [
    { quote: "The wound is the place where the Light enters you.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", tradition: "eastern", carry: "Name one thing that's weighing on you. Don't solve it. Just name it.", reflection: "What if this hard season is building something you can't see yet?" },
    { quote: "Turn your wounds into wisdom.", author: "Oprah Winfrey", era: "American Media Leader & Philanthropist, b. 1954", tradition: "modern", carry: "Put your hand on your chest for five seconds. Feel that you're here.", reflection: "What have you survived before that once felt impossible?" },
    { quote: "Hope is being able to see that there is light despite all of the darkness.", author: "Desmond Tutu", era: "South African Archbishop & Nobel Laureate, 1931–2021", tradition: "african", carry: "Tell one person today, honestly, how you're doing. Even briefly.", reflection: "What would it feel like to let someone else carry part of this?" },
  ],
  searching: [
    { quote: "What you seek is seeking you.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", tradition: "eastern", carry: "Write down the question you keep coming back to. Keep it visible today.", reflection: "If you trusted that the answer was already forming, what would you do next?" },
    { quote: "Your story is what you have, what you will always have. It is something to own.", author: "Michelle Obama", era: "Former U.S. First Lady & Author, b. 1964", tradition: "modern", carry: "Finish this sentence on paper: 'What I actually want is...'", reflection: "What are you afraid of finding if you stop searching?" },
    { quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", era: "German Philosopher, 1844–1900", tradition: "western", carry: "Ask yourself before each task today: does this move me toward something?", reflection: "What would your life look like if you stopped doing things that don't matter to you?" },
  ],
  steady: [
    { quote: "Knowing others is intelligence; knowing yourself is true wisdom.", author: "Lao Tzu", era: "Chinese Philosopher, 6th Century BC", tradition: "eastern", carry: "At some point today, pause and notice exactly how your body feels.", reflection: "What's one thing you've learned about yourself recently that surprised you?" },
    { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", era: "American Philosopher, 1885–1981", tradition: "western", carry: "Do the most important thing on your list first. Before anything else.", reflection: "What small habit is quietly shaping who you're becoming?" },
    { quote: "When you change the way you look at things, the things you look at change.", author: "Wayne Dyer", era: "American Author & Speaker, 1940–2015", tradition: "modern", carry: "Find one ordinary thing today and look at it as if seeing it for the first time.", reflection: "What part of your routine are you doing on autopilot that deserves more attention?" },
  ],
  open: [
    { quote: "Be thankful for what you have; you'll end up having more.", author: "Oprah Winfrey", era: "American Media Leader & Philanthropist, b. 1954", tradition: "modern", carry: "Send a message to someone you're grateful for. No occasion needed.", reflection: "What's one thing you've been taking for granted that quietly makes your life work?" },
    { quote: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.", author: "Rumi", era: "Persian Poet & Sufi Mystic, 1207–1273", tradition: "eastern", carry: "Say yes to the next thing that excites you today, even if it's small.", reflection: "When was the last time you followed a feeling without needing to justify it?" },
    { quote: "We delight in the beauty of the butterfly, but rarely admit the changes it has gone through to achieve that beauty.", author: "Maya Angelou", era: "American Poet & Civil Rights Activist, 1928–2014", tradition: "modern", carry: "Acknowledge one thing you've overcome. Say it out loud, even quietly.", reflection: "What transformation in you would others not guess from the outside?" },
  ],
};

const TRADITION_COLORS = {
  eastern: { border: "#8b5e3c", label: "Eastern Wisdom" },
  western: { border: "#5b7a9d", label: "Western Philosophy" },
  indigenous: { border: "#9d7a4b", label: "Indigenous Wisdom" },
  modern: { border: "#6b8f71", label: "Modern Thinker" },
  african: { border: "#8b6b8a", label: "African Wisdom" },
};

const EMOTIONAL_STATES = [
  { id: "restless", label: "Restless" },
  { id: "heavy", label: "Heavy" },
  { id: "searching", label: "Searching" },
  { id: "steady", label: "Steady" },
  { id: "open", label: "Open" },
];

const FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getStoredData() {
  try {
    const raw = localStorage.getItem("presently_data");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeData(data) {
  try {
    localStorage.setItem("presently_data", JSON.stringify(data));
  } catch {}
}

function getDayCount(data) {
  if (!data || !data.firstDay) return 1;
  const first = new Date(data.firstDay);
  const now = new Date();
  return Math.max(1, Math.floor((now - first) / 86400000) + 1);
}

// ─── Main App ───
export default function Presently() {
  const [phase, setPhase] = useState("checkin"); // checkin | loading | insight | carry | reflect | complete | journal
  const [selectedState, setSelectedState] = useState(null);
  const [entry, setEntry] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [committed, setCommitted] = useState(false);
  const [fade, setFade] = useState("in");
  const [dayCount, setDayCount] = useState(1);
  const [journalEntries, setJournalEntries] = useState([]);
  const [yesterdayReflection, setYesterdayReflection] = useState(null);
  const [showYesterday, setShowYesterday] = useState(false);
  const usedAuthorsRef = useRef([]);
  const inputRef = useRef(null);

  // Load persisted data
  useEffect(() => {
    const data = getStoredData();
    if (data) {
      setDayCount(getDayCount(data));
      setJournalEntries(data.journal || []);
      usedAuthorsRef.current = data.usedAuthors || [];
      // Check for yesterday's reflection
      const journal = data.journal || [];
      if (journal.length > 0) {
        const last = journal[journal.length - 1];
        const lastDate = new Date(last.date);
        const now = new Date();
        const diffHours = (now - lastDate) / 3600000;
        if (diffHours < 48 && diffHours > 4) {
          setYesterdayReflection(last.reflection);
          setShowYesterday(true);
        }
      }
      // If first time, set first day
      if (!data.firstDay) {
        storeData({ ...data, firstDay: new Date().toISOString() });
      }
    } else {
      storeData({ firstDay: new Date().toISOString(), journal: [], usedAuthors: [] });
    }
  }, []);

  const transition = useCallback((nextPhase, delay = 400) => {
    setFade("out");
    setTimeout(() => {
      setPhase(nextPhase);
      setFade("in");
    }, delay);
  }, []);

  const handleStateSelect = useCallback(async (stateId) => {
    setSelectedState(stateId);
    transition("loading");

    // Try API first
    try {
      const resp = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: stateId,
          usedAuthors: usedAuthorsRef.current,
          yesterdayReflection: yesterdayReflection,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setEntry(data);
        usedAuthorsRef.current = [...usedAuthorsRef.current, data.author].slice(-30);
        const stored = getStoredData() || {};
        storeData({ ...stored, usedAuthors: usedAuthorsRef.current });
        setTimeout(() => transition("insight"), 600);
        return;
      }
    } catch {}

    // Fallback to seeds
    const seeds = SEED_ENTRIES[stateId] || SEED_ENTRIES.searching;
    const unused = seeds.filter(s => !usedAuthorsRef.current.includes(s.author));
    const pool = unused.length > 0 ? unused : seeds;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setEntry(pick);
    usedAuthorsRef.current.push(pick.author);
    setTimeout(() => transition("insight"), 600);
  }, [transition, yesterdayReflection]);

  const handleCommit = useCallback(() => {
    setCommitted(true);
    setTimeout(() => transition("reflect"), 1200);
  }, [transition]);

  const handleReflectionSubmit = useCallback(() => {
    const text = reflectionText.trim();
    if (text) {
      const newEntry = {
        date: new Date().toISOString(),
        state: selectedState,
        quote: entry?.quote,
        author: entry?.author,
        carry: entry?.carry,
        reflection: text,
      };
      const updated = [...journalEntries, newEntry];
      setJournalEntries(updated);
      const stored = getStoredData() || {};
      storeData({ ...stored, journal: updated });
    }
    transition("complete");
  }, [reflectionText, selectedState, entry, journalEntries, transition]);

  const handleSkipReflection = useCallback(() => {
    transition("complete");
  }, [transition]);

  const handleNewDay = useCallback(() => {
    setPhase("checkin");
    setSelectedState(null);
    setEntry(null);
    setReflectionText("");
    setCommitted(false);
    setShowYesterday(false);
    setFade("in");
  }, []);

  const tradition = entry ? TRADITION_COLORS[entry.tradition] || TRADITION_COLORS.modern : null;

  return (
    <>
      <link href={FONTS} rel="stylesheet" />
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg:#0c0b0a;
          --surface:#151413;
          --surface2:#1d1c1a;
          --text:#ddd8d0;
          --text-dim:#706b63;
          --text-faint:#3d3a36;
          --accent:#b8a07a;
          --accent-soft:rgba(184,160,122,0.08);
          --warm:rgba(184,160,122,0.04);
        }
        html,body,#root{height:100%;background:var(--bg);color:var(--text)}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

        .app{
          min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:2rem 1.5rem;position:relative;overflow:hidden;
          background:radial-gradient(ellipse 70% 50% at 50% 30%,var(--warm),transparent 70%),var(--bg);
        }
        .app::after{
          content:'';position:absolute;inset:0;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
        }

        .scene{
          max-width:420px;width:100%;position:relative;z-index:1;
          transition:opacity 0.5s ease,transform 0.5s ease;
        }
        .scene.fade-out{opacity:0;transform:translateY(6px)}
        .scene.fade-in{opacity:1;transform:translateY(0)}

        /* ─── Check-in Screen ─── */
        .greeting{
          font-family:'DM Sans',sans-serif;font-weight:300;font-size:0.8rem;
          color:var(--text-dim);letter-spacing:0.12em;text-transform:uppercase;
          text-align:center;margin-bottom:0.4rem;
        }
        .day-count{
          font-size:0.7rem;color:var(--text-faint);letter-spacing:0.1em;
          text-align:center;margin-bottom:3rem;text-transform:uppercase;
        }
        .yesterday-echo{
          text-align:center;margin-bottom:2rem;padding:1rem 1.25rem;
          background:var(--accent-soft);border-radius:0.75rem;
          border:1px solid rgba(184,160,122,0.06);
        }
        .yesterday-label{
          font-size:0.65rem;color:var(--text-dim);letter-spacing:0.08em;
          text-transform:uppercase;margin-bottom:0.5rem;
        }
        .yesterday-text{
          font-family:'Cormorant Garamond',serif;font-size:1rem;
          font-style:italic;color:var(--text);line-height:1.5;opacity:0.7;
        }
        .checkin-question{
          font-family:'Cormorant Garamond',serif;font-size:1.9rem;
          font-weight:300;font-style:italic;text-align:center;
          line-height:1.4;color:var(--text);margin-bottom:2.5rem;
        }
        .states{display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem}
        .state-pill{
          background:var(--surface);border:1px solid rgba(255,255,255,0.04);
          color:var(--text-dim);padding:0.65rem 1.4rem;border-radius:100px;
          cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;
          font-weight:400;letter-spacing:0.04em;transition:all 0.3s ease;
        }
        .state-pill:hover{
          background:var(--surface2);color:var(--text);
          border-color:rgba(184,160,122,0.15);
        }
        .state-pill:active{transform:scale(0.97)}

        /* ─── Loading ─── */
        .loading-wrap{display:flex;flex-direction:column;align-items:center;gap:1.5rem;padding:4rem 0}
        .loading-dots{display:flex;gap:0.5rem}
        .loading-dots span{
          width:6px;height:6px;border-radius:50%;background:var(--accent);opacity:0.3;
          animation:ldot 1.4s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2){animation-delay:0.15s}
        .loading-dots span:nth-child(3){animation-delay:0.3s}
        @keyframes ldot{0%,80%,100%{opacity:.15;transform:scale(.8)}40%{opacity:.8;transform:scale(1.2)}}
        .loading-text{font-size:0.75rem;color:var(--text-faint);letter-spacing:0.08em}

        /* ─── Insight (Quote) Screen ─── */
        .tradition-line{
          font-size:0.65rem;font-weight:500;letter-spacing:0.1em;
          text-transform:uppercase;margin-bottom:2rem;
          display:flex;align-items:center;gap:0.5rem;
        }
        .tradition-dot{width:5px;height:5px;border-radius:50%}
        .quote-block{
          font-family:'Cormorant Garamond',serif;font-size:1.7rem;
          font-weight:300;font-style:italic;line-height:1.55;
          color:var(--text);margin-bottom:2rem;
        }
        .attribution{
          padding-top:1.25rem;border-top:1px solid rgba(255,255,255,0.04);
        }
        .attr-name{font-weight:500;font-size:0.9rem;color:var(--accent);margin-bottom:0.15rem}
        .attr-era{font-size:0.75rem;color:var(--text-dim);font-weight:300}

        /* ─── Carry Screen ─── */
        .carry-label{
          font-size:0.7rem;color:var(--text-dim);letter-spacing:0.1em;
          text-transform:uppercase;margin-bottom:1rem;
        }
        .carry-text{
          font-family:'Cormorant Garamond',serif;font-size:1.25rem;
          font-weight:400;line-height:1.5;color:var(--text);
          margin-bottom:2.5rem;padding:1.25rem 1.5rem;
          background:var(--accent-soft);border-radius:0.75rem;
          border:1px solid rgba(184,160,122,0.06);
        }
        .commit-btn{
          display:block;width:100%;padding:1rem;border:1px solid rgba(184,160,122,0.2);
          background:transparent;color:var(--accent);border-radius:0.6rem;
          font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:400;
          letter-spacing:0.04em;cursor:pointer;transition:all 0.3s ease;
        }
        .commit-btn:hover{background:var(--accent-soft);border-color:rgba(184,160,122,0.35)}
        .commit-btn.done{
          background:rgba(184,160,122,0.1);border-color:rgba(184,160,122,0.3);
          color:var(--accent);pointer-events:none;
        }

        /* ─── Reflect Screen ─── */
        .reflect-question{
          font-family:'Cormorant Garamond',serif;font-size:1.35rem;
          font-weight:300;font-style:italic;line-height:1.5;
          color:var(--text);margin-bottom:1.5rem;
        }
        .reflect-input{
          width:100%;background:transparent;border:none;
          border-bottom:1px solid rgba(255,255,255,0.06);
          color:var(--text);font-family:'DM Sans',sans-serif;
          font-size:0.95rem;font-weight:300;padding:0.75rem 0;
          outline:none;margin-bottom:2rem;transition:border-color 0.3s;
        }
        .reflect-input::placeholder{color:var(--text-faint)}
        .reflect-input:focus{border-color:rgba(184,160,122,0.3)}
        .reflect-actions{display:flex;gap:0.75rem}
        .reflect-submit{
          flex:1;padding:0.85rem;background:var(--accent-soft);
          border:1px solid rgba(184,160,122,0.15);color:var(--accent);
          border-radius:0.6rem;font-family:'DM Sans',sans-serif;
          font-size:0.85rem;cursor:pointer;transition:all 0.3s;
        }
        .reflect-submit:hover{background:rgba(184,160,122,0.12)}
        .reflect-skip{
          padding:0.85rem 1.2rem;background:transparent;border:none;
          color:var(--text-faint);font-family:'DM Sans',sans-serif;
          font-size:0.8rem;cursor:pointer;transition:color 0.3s;
        }
        .reflect-skip:hover{color:var(--text-dim)}

        /* ─── Complete Screen ─── */
        .complete-wrap{text-align:center;padding:3rem 0}
        .complete-line{
          font-family:'Cormorant Garamond',serif;font-size:1.5rem;
          font-weight:300;font-style:italic;color:var(--text);
          margin-bottom:0.6rem;line-height:1.5;
        }
        .complete-sub{
          font-size:0.75rem;color:var(--text-faint);letter-spacing:0.08em;
          margin-top:1.5rem;
        }
        .progress-arc{
          width:48px;height:48px;margin:2.5rem auto 0;position:relative;
        }
        .progress-arc svg{transform:rotate(-90deg)}
        .progress-arc circle{fill:none;stroke-width:2;stroke-linecap:round}
        .arc-bg{stroke:var(--surface2)}
        .arc-fill{stroke:var(--accent);transition:stroke-dashoffset 1.5s ease}

        /* ─── Bottom Nav ─── */
        .bottom-nav{
          position:fixed;bottom:0;left:0;right:0;
          display:flex;justify-content:center;gap:2rem;
          padding:1rem 0 2rem;z-index:10;
          background:linear-gradient(transparent,var(--bg) 40%);
        }
        .nav-btn{
          background:none;border:none;color:var(--text-faint);
          font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;
          cursor:pointer;font-family:'DM Sans',sans-serif;
          transition:color 0.3s;padding:0.5rem;
        }
        .nav-btn:hover,.nav-btn.active{color:var(--text-dim)}

        /* ─── Journal Screen ─── */
        .journal-header{
          font-family:'Cormorant Garamond',serif;font-size:1.6rem;
          font-weight:300;color:var(--text);margin-bottom:0.3rem;
        }
        .journal-sub{
          font-size:0.75rem;color:var(--text-dim);margin-bottom:2rem;
          letter-spacing:0.03em;
        }
        .journal-entry{
          padding:1.25rem 0;border-bottom:1px solid rgba(255,255,255,0.03);
        }
        .journal-date{
          font-size:0.65rem;color:var(--text-faint);letter-spacing:0.08em;
          text-transform:uppercase;margin-bottom:0.5rem;
        }
        .journal-quote{
          font-family:'Cormorant Garamond',serif;font-size:1rem;
          font-style:italic;color:var(--text);opacity:0.5;
          margin-bottom:0.4rem;line-height:1.45;
        }
        .journal-reflection{
          font-size:0.9rem;color:var(--text);line-height:1.5;font-weight:300;
        }
        .journal-empty{
          text-align:center;color:var(--text-faint);
          font-size:0.85rem;padding:3rem 0;font-weight:300;
        }

        .stagger-1{animation:fadeUp .6s ease .1s both}
        .stagger-2{animation:fadeUp .6s ease .25s both}
        .stagger-3{animation:fadeUp .6s ease .4s both}
        .stagger-4{animation:fadeUp .6s ease .55s both}
        .stagger-5{animation:fadeUp .6s ease .7s both}
        .stagger-slow{animation:fadeUp .8s ease .8s both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .fade-enter{animation:fadeIn .5s ease both}

        @media(max-width:400px){
          .checkin-question{font-size:1.55rem}
          .quote-block{font-size:1.4rem}
          .state-pill{padding:0.55rem 1.1rem;font-size:0.8rem}
        }
      `}</style>

      <div className="app">
        {/* ═══════════ CHECK-IN ═══════════ */}
        {phase === "checkin" && (
          <div className={`scene fade-${fade}`}>
            <div className="greeting stagger-1">{getGreeting()}</div>
            <div className="day-count stagger-1">Day {dayCount}</div>

            {showYesterday && yesterdayReflection && (
              <div className="yesterday-echo stagger-2">
                <div className="yesterday-label">Yesterday you said</div>
                <div className="yesterday-text">"{yesterdayReflection}"</div>
              </div>
            )}

            <div className={`checkin-question ${showYesterday ? 'stagger-3' : 'stagger-2'}`}>
              How are you arriving today?
            </div>

            <div className={`states ${showYesterday ? 'stagger-4' : 'stagger-3'}`}>
              {EMOTIONAL_STATES.map((s) => (
                <button key={s.id} className="state-pill" onClick={() => handleStateSelect(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ LOADING ═══════════ */}
        {phase === "loading" && (
          <div className={`scene fade-${fade}`}>
            <div className="loading-wrap">
              <div className="loading-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ INSIGHT (QUOTE) ═══════════ */}
        {phase === "insight" && entry && (
          <div className={`scene fade-${fade}`}>
            {tradition && (
              <div className="tradition-line stagger-1" style={{ color: tradition.border }}>
                <span className="tradition-dot" style={{ background: tradition.border }} />
                {tradition.label}
              </div>
            )}
            <div className="quote-block stagger-2">{entry.quote}</div>
            <div className="attribution stagger-3">
              <div className="attr-name">{entry.author}</div>
              <div className="attr-era">{entry.era}</div>
            </div>
            <div style={{ marginTop: "2.5rem" }} className="stagger-slow">
              <button className="commit-btn" onClick={() => transition("carry")} style={{ background: 'transparent' }}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ CARRY (ACTION) ═══════════ */}
        {phase === "carry" && entry && (
          <div className={`scene fade-${fade}`}>
            <div className="carry-label stagger-1">One thing to carry today</div>
            <div className="carry-text stagger-2">{entry.carry}</div>
            <button
              className={`commit-btn stagger-3 ${committed ? 'done' : ''}`}
              onClick={handleCommit}
            >
              {committed ? "Noted" : "I'll try this"}
            </button>
          </div>
        )}

        {/* ═══════════ REFLECT ═══════════ */}
        {phase === "reflect" && entry && (
          <div className={`scene fade-${fade}`}>
            <div className="reflect-question stagger-1">{entry.reflection}</div>
            <input
              ref={inputRef}
              className="reflect-input stagger-2"
              type="text"
              placeholder="Write one honest sentence..."
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && reflectionText.trim() && handleReflectionSubmit()}
              autoFocus
            />
            <div className="reflect-actions stagger-3">
              <button className="reflect-submit" onClick={handleReflectionSubmit} disabled={!reflectionText.trim()}>
                Save
              </button>
              <button className="reflect-skip" onClick={handleSkipReflection}>
                Not today
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ COMPLETE ═══════════ */}
        {phase === "complete" && (
          <div className={`scene fade-${fade}`}>
            <div className="complete-wrap">
              <div className="complete-line stagger-1">You're aligned.</div>
              <div className="complete-line stagger-2" style={{ opacity: 0.5, fontSize: '1.2rem' }}>Go gently.</div>

              <div className="progress-arc stagger-3">
                <svg viewBox="0 0 48 48" width="48" height="48">
                  <circle className="arc-bg" cx="24" cy="24" r="20" />
                  <circle
                    className="arc-fill"
                    cx="24" cy="24" r="20"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - Math.min(dayCount, 30) / 30)}
                  />
                </svg>
              </div>

              <div className="complete-sub stagger-slow">
                {dayCount >= 30
                  ? `${dayCount} days of showing up. That's rare.`
                  : `Day ${dayCount} of 30`
                }
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ JOURNAL ═══════════ */}
        {phase === "journal" && (
          <div className={`scene fade-${fade}`}>
            <div className="journal-header stagger-1">Your thread</div>
            <div className="journal-sub stagger-1">{journalEntries.length} reflections</div>

            {journalEntries.length === 0 ? (
              <div className="journal-empty stagger-2">Nothing here yet. That changes today.</div>
            ) : (
              [...journalEntries].reverse().map((je, i) => (
                <div className="journal-entry" key={i} style={{ animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both` }}>
                  <div className="journal-date">
                    {new Date(je.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {je.state && ` · ${je.state}`}
                  </div>
                  {je.quote && <div className="journal-quote">"{je.quote}"</div>}
                  <div className="journal-reflection">{je.reflection}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══════════ BOTTOM NAV ═══════════ */}
        {(phase === "complete" || phase === "journal") && (
          <div className="bottom-nav">
            <button
              className={`nav-btn ${phase === "journal" ? "" : "active"}`}
              onClick={handleNewDay}
            >
              Begin again
            </button>
            <button
              className={`nav-btn ${phase === "journal" ? "active" : ""}`}
              onClick={() => transition("journal")}
            >
              Your journal
            </button>
          </div>
        )}
      </div>
    </>
  );
}
