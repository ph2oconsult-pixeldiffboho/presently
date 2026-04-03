import { useState, useEffect, useCallback, useRef } from "react";
import DAYS from "./data/days.js";

// ─── Emotional States ───
const STATES = [
  { id: "restless", label: "Restless" },
  { id: "heavy", label: "Heavy" },
  { id: "unsure", label: "Unsure" },
  { id: "steady", label: "Steady" },
  { id: "clear", label: "Clear" },
];

const PHASE_META = {
  Notice: { num: 1, color: "#7a8b6f" },
  Interrupt: { num: 2, color: "#8b7a5e" },
  Choose: { num: 3, color: "#6f7a8b" },
  Integrate: { num: 4, color: "#8b6f7a" },
};

const FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";

// ─── Persistence ───
function load() {
  try {
    const raw = localStorage.getItem("presently_v2");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(data) {
  try { localStorage.setItem("presently_v2", JSON.stringify(data)); } catch {}
}

function getDefault() {
  return {
    currentDay: 1,
    journal: [],         // { day, date, state, reflection }
    completedDays: [],   // [1, 2, 3...]
    startedAt: new Date().toISOString(),
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── App ───
export default function Presently() {
  const [screen, setScreen] = useState("arrival"); // arrival | insight | action | reflect | close | journal | complete30
  const [fade, setFade] = useState("in");
  const [userData, setUserData] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [committed, setCommitted] = useState(false);
  const inputRef = useRef(null);

  // Boot
  useEffect(() => {
    const stored = load();
    if (stored) {
      setUserData(stored);
      // If they already completed today, show close or journal
      const today = stored.currentDay;
      if (stored.completedDays.includes(today)) {
        setScreen("close");
      }
    } else {
      const fresh = getDefault();
      save(fresh);
      setUserData(fresh);
    }
  }, []);

  const currentDay = userData?.currentDay || 1;
  const dayData = DAYS.find(d => d.day === currentDay) || DAYS[0];
  const phase = dayData.phase;
  const phaseMeta = PHASE_META[phase];
  const lastReflection = userData?.journal?.length > 0
    ? userData.journal[userData.journal.length - 1]
    : null;

  const transition = useCallback((next, delay = 380) => {
    setFade("out");
    setTimeout(() => {
      setScreen(next);
      setFade("in");
    }, delay);
  }, []);

  const handleStateSelect = useCallback((stateId) => {
    setSelectedState(stateId);
    transition("insight");
  }, [transition]);

  const handleContinueToAction = useCallback(() => {
    transition("action");
  }, [transition]);

  const handleCommit = useCallback(() => {
    setCommitted(true);
    setTimeout(() => transition("reflect"), 1000);
  }, [transition]);

  const handleReflectionSubmit = useCallback(() => {
    const text = reflectionText.trim();
    const updated = { ...userData };

    if (text) {
      updated.journal = [...(updated.journal || []), {
        day: currentDay,
        date: new Date().toISOString(),
        state: selectedState,
        reflection: text,
        phase: dayData.phase,
        title: dayData.title,
      }];
    }

    updated.completedDays = [...new Set([...(updated.completedDays || []), currentDay])];
    save(updated);
    setUserData(updated);

    if (currentDay >= 30) {
      transition("complete30");
    } else {
      transition("close");
    }
  }, [reflectionText, userData, currentDay, selectedState, dayData, transition]);

  const handleSkipReflection = useCallback(() => {
    const updated = { ...userData };
    updated.completedDays = [...new Set([...(updated.completedDays || []), currentDay])];
    save(updated);
    setUserData(updated);

    if (currentDay >= 30) {
      transition("complete30");
    } else {
      transition("close");
    }
  }, [userData, currentDay, transition]);

  const handleNextDay = useCallback(() => {
    if (currentDay >= 30) {
      transition("complete30");
      return;
    }
    const updated = { ...userData, currentDay: currentDay + 1 };
    save(updated);
    setUserData(updated);
    setSelectedState(null);
    setReflectionText("");
    setCommitted(false);
    transition("arrival");
  }, [userData, currentDay, transition]);

  const handleReset = useCallback(() => {
    const fresh = getDefault();
    save(fresh);
    setUserData(fresh);
    setSelectedState(null);
    setReflectionText("");
    setCommitted(false);
    setScreen("arrival");
    setFade("in");
  }, []);

  if (!userData) return null;

  const journalEntries = userData.journal || [];
  const completedCount = (userData.completedDays || []).length;
  const progressPct = Math.min(completedCount / 30, 1);

  return (
    <>
      <link href={FONTS} rel="stylesheet" />
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --bg:#0c0b0a;--surface:#141312;--surface2:#1c1b19;
          --text:#ddd8d0;--text-dim:#706b63;--text-faint:#3d3a36;
          --accent:#b8a07a;--accent-soft:rgba(184,160,122,0.07);
          --warm:rgba(184,160,122,0.03);
        }
        html,body,#root{height:100%;background:var(--bg);color:var(--text)}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

        .app{
          min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;
          align-items:center;justify-content:center;padding:2rem 1.5rem;
          position:relative;overflow-y:auto;
          background:radial-gradient(ellipse 70% 45% at 50% 25%,var(--warm),transparent 70%),var(--bg);
        }
        .app::after{
          content:'';position:fixed;inset:0;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E");
        }

        .scene{
          max-width:400px;width:100%;position:relative;z-index:1;
          transition:opacity 0.45s ease,transform 0.45s ease;
        }
        .scene.fade-out{opacity:0;transform:translateY(5px)}
        .scene.fade-in{opacity:1;transform:translateY(0)}

        /* ─── Phase badge ─── */
        .phase-badge{
          display:flex;align-items:center;gap:0.5rem;
          margin-bottom:2.5rem;justify-content:center;
        }
        .phase-dot{width:5px;height:5px;border-radius:50%}
        .phase-label{
          font-size:0.65rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;
        }
        .phase-track{
          display:flex;gap:3px;margin-left:0.5rem;
        }
        .phase-seg{
          width:16px;height:3px;border-radius:1.5px;background:var(--surface2);
          transition:background 0.3s;
        }
        .phase-seg.filled{background:var(--accent);opacity:0.6}
        .phase-seg.current{background:var(--accent);opacity:1}

        /* ─── Greeting ─── */
        .greeting{
          font-size:0.75rem;color:var(--text-dim);letter-spacing:0.1em;
          text-transform:uppercase;text-align:center;margin-bottom:0.3rem;
          font-weight:300;
        }
        .day-title{
          font-size:0.7rem;color:var(--text-faint);text-align:center;
          margin-bottom:2.5rem;letter-spacing:0.06em;
        }

        /* ─── Yesterday echo ─── */
        .echo{
          text-align:center;margin-bottom:2rem;padding:1rem 1.2rem;
          background:var(--accent-soft);border-radius:0.75rem;
          border:1px solid rgba(184,160,122,0.05);
        }
        .echo-label{font-size:0.6rem;color:var(--text-dim);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.4rem}
        .echo-text{font-family:'Cormorant Garamond',serif;font-size:0.95rem;font-style:italic;color:var(--text);opacity:0.6;line-height:1.45}

        /* ─── Core text ─── */
        .prompt{
          font-family:'Cormorant Garamond',serif;font-size:1.75rem;font-weight:300;
          font-style:italic;text-align:center;line-height:1.45;color:var(--text);
          margin-bottom:2.5rem;
        }
        .body-text{
          font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:400;
          line-height:1.55;color:var(--text);text-align:center;
          padding:1.2rem 1.4rem;background:var(--accent-soft);
          border-radius:0.75rem;border:1px solid rgba(184,160,122,0.05);
        }
        .action-text{
          font-size:1.1rem;font-weight:300;line-height:1.55;color:var(--text);
          text-align:center;margin-bottom:2.5rem;
        }

        /* ─── States ─── */
        .states{display:flex;flex-wrap:wrap;justify-content:center;gap:0.55rem}
        .state-pill{
          background:var(--surface);border:1px solid rgba(255,255,255,0.035);
          color:var(--text-dim);padding:0.6rem 1.35rem;border-radius:100px;
          cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.82rem;
          font-weight:400;letter-spacing:0.03em;transition:all 0.25s ease;
        }
        .state-pill:hover{background:var(--surface2);color:var(--text);border-color:rgba(184,160,122,0.12)}
        .state-pill:active{transform:scale(0.97)}

        /* ─── Buttons ─── */
        .btn{
          display:block;width:100%;padding:0.95rem;border:1px solid rgba(184,160,122,0.18);
          background:transparent;color:var(--accent);border-radius:0.55rem;
          font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:400;
          letter-spacing:0.03em;cursor:pointer;transition:all 0.25s ease;
          margin-top:2rem;
        }
        .btn:hover{background:var(--accent-soft);border-color:rgba(184,160,122,0.3)}
        .btn:active{transform:scale(0.99)}
        .btn.done{background:rgba(184,160,122,0.08);border-color:rgba(184,160,122,0.25);pointer-events:none}
        .btn-row{display:flex;gap:0.6rem;margin-top:2rem}
        .btn-primary{
          flex:1;padding:0.85rem;background:var(--accent-soft);
          border:1px solid rgba(184,160,122,0.12);color:var(--accent);
          border-radius:0.55rem;font-family:'DM Sans',sans-serif;
          font-size:0.82rem;cursor:pointer;transition:all 0.25s;
        }
        .btn-primary:hover{background:rgba(184,160,122,0.1)}
        .btn-ghost{
          padding:0.85rem 1rem;background:transparent;border:none;
          color:var(--text-faint);font-family:'DM Sans',sans-serif;
          font-size:0.78rem;cursor:pointer;transition:color 0.25s;
        }
        .btn-ghost:hover{color:var(--text-dim)}

        /* ─── Input ─── */
        .input{
          width:100%;background:transparent;border:none;
          border-bottom:1px solid rgba(255,255,255,0.05);
          color:var(--text);font-family:'DM Sans',sans-serif;
          font-size:0.92rem;font-weight:300;padding:0.7rem 0;
          outline:none;margin-bottom:0;transition:border-color 0.3s;
        }
        .input::placeholder{color:var(--text-faint)}
        .input:focus{border-color:rgba(184,160,122,0.25)}

        /* ─── Close/Complete ─── */
        .close-wrap{text-align:center;padding:2rem 0}
        .close-msg{
          font-family:'Cormorant Garamond',serif;font-size:1.35rem;
          font-weight:300;font-style:italic;color:var(--text);
          line-height:1.5;margin-bottom:2rem;
        }
        .arc-wrap{width:44px;height:44px;margin:0 auto 1.5rem}
        .arc-wrap svg{transform:rotate(-90deg)}
        .arc-wrap circle{fill:none;stroke-width:2;stroke-linecap:round}
        .arc-bg{stroke:var(--surface2)}
        .arc-fill{stroke:var(--accent);transition:stroke-dashoffset 1.2s ease}
        .close-sub{font-size:0.7rem;color:var(--text-faint);letter-spacing:0.06em}

        /* ─── Final complete ─── */
        .final{text-align:center;padding:2rem 0}
        .final-title{
          font-family:'Cormorant Garamond',serif;font-size:2rem;
          font-weight:300;color:var(--text);margin-bottom:0.5rem;
        }
        .final-body{
          font-size:0.9rem;color:var(--text-dim);line-height:1.6;
          max-width:320px;margin:0 auto 2rem;font-weight:300;
        }

        /* ─── Journal ─── */
        .journal-head{
          font-family:'Cormorant Garamond',serif;font-size:1.5rem;
          font-weight:300;color:var(--text);margin-bottom:0.25rem;
        }
        .journal-sub{font-size:0.72rem;color:var(--text-dim);margin-bottom:1.5rem;letter-spacing:0.03em}
        .j-entry{padding:1.1rem 0;border-bottom:1px solid rgba(255,255,255,0.025)}
        .j-meta{
          font-size:0.6rem;color:var(--text-faint);letter-spacing:0.08em;
          text-transform:uppercase;margin-bottom:0.4rem;
          display:flex;align-items:center;gap:0.5rem;
        }
        .j-title{font-size:0.75rem;color:var(--text-dim);margin-bottom:0.35rem;font-weight:400}
        .j-text{font-size:0.88rem;color:var(--text);line-height:1.5;font-weight:300}
        .j-empty{text-align:center;color:var(--text-faint);font-size:0.82rem;padding:3rem 0;font-weight:300}

        /* ─── Bottom nav ─── */
        .bnav{
          position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:center;
          gap:2.5rem;padding:0.8rem 0 max(1.5rem, env(safe-area-inset-bottom));
          z-index:10;background:linear-gradient(transparent,var(--bg) 35%);
        }
        .bnav-btn{
          background:none;border:none;color:var(--text-faint);
          font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;
          cursor:pointer;font-family:'DM Sans',sans-serif;transition:color 0.25s;padding:0.4rem;
        }
        .bnav-btn:hover,.bnav-btn.on{color:var(--text-dim)}

        /* Stagger */
        .s1{animation:up .55s ease .08s both}
        .s2{animation:up .55s ease .2s both}
        .s3{animation:up .55s ease .35s both}
        .s4{animation:up .55s ease .5s both}
        .s5{animation:up .55s ease .7s both}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        @media(max-width:390px){
          .prompt{font-size:1.45rem}
          .state-pill{padding:0.5rem 1.1rem;font-size:0.78rem}
        }
      `}</style>

      <div className="app">

        {/* ════════ ARRIVAL ════════ */}
        {screen === "arrival" && (
          <div className={`scene fade-${fade}`}>
            <div className="phase-badge s1">
              <span className="phase-dot" style={{ background: phaseMeta.color }} />
              <span className="phase-label" style={{ color: phaseMeta.color }}>
                Phase {phaseMeta.num}: {phase}
              </span>
              <div className="phase-track">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`phase-seg ${i < phaseMeta.num ? 'filled' : ''} ${i === phaseMeta.num ? 'current' : ''}`} />
                ))}
              </div>
            </div>

            <div className="greeting s1">{getGreeting()}</div>
            <div className="day-title s1">{dayData.title}</div>

            {lastReflection && currentDay > 1 && (
              <div className="echo s2">
                <div className="echo-label">Last time you said</div>
                <div className="echo-text">"{lastReflection.reflection}"</div>
              </div>
            )}

            <div className={`prompt ${lastReflection && currentDay > 1 ? 's3' : 's2'}`}>
              How are you, right now?
            </div>

            <div className={`states ${lastReflection && currentDay > 1 ? 's4' : 's3'}`}>
              {STATES.map(s => (
                <button key={s.id} className="state-pill" onClick={() => handleStateSelect(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════ INSIGHT ════════ */}
        {screen === "insight" && (
          <div className={`scene fade-${fade}`}>
            <div className="phase-badge s1">
              <span className="phase-dot" style={{ background: phaseMeta.color }} />
              <span className="phase-label" style={{ color: phaseMeta.color }}>Day {currentDay}</span>
            </div>

            <div className="prompt s2">{dayData.arrival_prompt}</div>

            <button className="btn s3" onClick={handleContinueToAction}>Continue</button>
          </div>
        )}

        {/* ════════ ACTION ════════ */}
        {screen === "action" && (
          <div className={`scene fade-${fade}`}>
            <div className="action-text s1">{dayData.action}</div>
            <button
              className={`btn s2 ${committed ? 'done' : ''}`}
              onClick={handleCommit}
            >
              {committed ? "Noted" : "I'll do this once"}
            </button>
          </div>
        )}

        {/* ════════ REFLECT ════════ */}
        {screen === "reflect" && (
          <div className={`scene fade-${fade}`}>
            <div className="prompt s1" style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>
              {dayData.reflection_prompt}
            </div>
            <input
              ref={inputRef}
              className="input s2"
              type="text"
              placeholder="Write it as it felt…"
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && reflectionText.trim() && handleReflectionSubmit()}
              autoFocus
            />
            <div className="btn-row s3">
              <button className="btn-primary" onClick={handleReflectionSubmit} disabled={!reflectionText.trim()}>
                Keep this
              </button>
              <button className="btn-ghost" onClick={handleSkipReflection}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* ════════ CLOSE ════════ */}
        {screen === "close" && (
          <div className={`scene fade-${fade}`}>
            <div className="close-wrap">
              <div className="close-msg s1">{dayData.close_message}</div>

              <div className="arc-wrap s2">
                <svg viewBox="0 0 44 44" width="44" height="44">
                  <circle className="arc-bg" cx="22" cy="22" r="18" />
                  <circle
                    className="arc-fill"
                    cx="22" cy="22" r="18"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - progressPct)}
                  />
                </svg>
              </div>

              <div className="close-sub s3">
                {completedCount >= 30
                  ? "30 days complete"
                  : `${completedCount} of 30`
                }
              </div>

              {currentDay < 30 && (
                <button className="btn s4" onClick={handleNextDay}>Tomorrow</button>
              )}
              {currentDay >= 30 && !userData.completedDays?.includes(30) && (
                <button className="btn s4" onClick={() => transition("complete30")}>Complete</button>
              )}
            </div>
          </div>
        )}

        {/* ════════ 30-DAY COMPLETE ════════ */}
        {screen === "complete30" && (
          <div className={`scene fade-${fade}`}>
            <div className="final">
              <div className="final-title s1">Still here.</div>
              <div className="final-body s2">
                Thirty days. You didn't just read words. You changed how you move through the world.
                This was never about the app. It was always about you.
              </div>
              <div className="close-msg s3" style={{ fontSize: '1.15rem' }}>Go gently.</div>
              <button className="btn s4" onClick={() => transition("journal")}>Read your thread</button>
              <button className="btn-ghost s5" onClick={handleReset} style={{ margin: '1rem auto', display: 'block' }}>
                Begin again
              </button>
            </div>
          </div>
        )}

        {/* ════════ JOURNAL ════════ */}
        {screen === "journal" && (
          <div className={`scene fade-${fade}`} style={{ paddingBottom: '5rem' }}>
            <div className="journal-head s1">Your thread</div>
            <div className="journal-sub s1">{journalEntries.length} reflection{journalEntries.length !== 1 ? 's' : ''}</div>

            {journalEntries.length === 0 ? (
              <div className="j-empty s2">Nothing here yet. That changes today.</div>
            ) : (
              [...journalEntries].reverse().map((je, i) => (
                <div className="j-entry" key={i} style={{ animation: `up 0.45s ease ${0.08 + i * 0.06}s both` }}>
                  <div className="j-meta">
                    <span>{new Date(je.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>·</span>
                    <span>{je.state}</span>
                  </div>
                  {je.title && <div className="j-title">Day {je.day}: {je.title}</div>}
                  <div className="j-text">{je.reflection}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ════════ BOTTOM NAV ════════ */}
        {(screen === "close" || screen === "journal" || screen === "complete30") && (
          <div className="bnav">
            <button className={`bnav-btn ${screen !== "journal" ? "on" : ""}`} onClick={() => {
              if (screen === "journal") transition("close");
            }}>
              Today
            </button>
            <button className={`bnav-btn ${screen === "journal" ? "on" : ""}`} onClick={() => {
              if (screen !== "journal") transition("journal");
            }}>
              Journal
            </button>
          </div>
        )}
      </div>
    </>
  );
}
