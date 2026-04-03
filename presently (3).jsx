import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── Presently: 30-Day Alignment Curriculum ───
// Phase 1: Notice (Days 1–7)   — Awareness without action
// Phase 2: Interrupt (Days 8–14) — Breaking autopilot
// Phase 3: Choose (Days 15–22)  — Intentional living
// Phase 4: Integrate (Days 23–30) — Embodiment

const DAYS = [
  // ═══════════════════════════════════════
  // PHASE 1: NOTICE (Days 1–7)
  // ═══════════════════════════════════════
  {
    day: 1,
    phase: "Notice",
    title: "Begin here",
    arrival_prompt: "You showed up. That's the first act of attention.",
    action: "At some point today, stop and notice what your body is doing. Shoulders, jaw, hands. Just notice.",
    reflection_prompt: "What did you find when you checked in with your body?",
    close_message: "You've started. That's more than most.",
    is_reflection_day: false,
  },
  {
    day: 2,
    phase: "Notice",
    title: "The first thought",
    arrival_prompt: "What was the first thing on your mind when you woke up?",
    action: "Before your first conversation today, pause for one full breath. That's it.",
    reflection_prompt: "What runs in the background of your mind when you're not paying attention?",
    close_message: "Noticing is the beginning of everything.",
    is_reflection_day: false,
  },
  {
    day: 3,
    phase: "Notice",
    title: "The space between",
    arrival_prompt: "Most of life happens between the big moments.",
    action: "Find one gap in your day — waiting for coffee, a red light, a loading screen. Be in it. Don't fill it.",
    reflection_prompt: "What happens when you let a moment be empty?",
    close_message: "The gaps are where you find yourself.",
    is_reflection_day: false,
  },
  {
    day: 4,
    phase: "Notice",
    title: "What you carry",
    arrival_prompt: "You bring something invisible into every room. What is it today?",
    action: "Name one thing weighing on you. Say it out loud, even quietly. Don't solve it. Just name it.",
    reflection_prompt: "What shifted when you named it?",
    close_message: "Naming things takes their power.",
    is_reflection_day: false,
  },
  {
    day: 5,
    phase: "Notice",
    title: "How you speak to yourself",
    arrival_prompt: "If your inner voice were a person, would you keep them around?",
    action: "Catch one unkind thing you say to yourself today. Notice it. That's enough.",
    reflection_prompt: "What did you catch yourself saying?",
    close_message: "Awareness is not correction. It's the step before.",
    is_reflection_day: false,
  },
  {
    day: 6,
    phase: "Notice",
    title: "What you avoid",
    arrival_prompt: "We all have a thing we keep not doing. You already know what it is.",
    action: "Look at the thing you've been avoiding. Don't do it. Just look at it for ten seconds.",
    reflection_prompt: "What are you actually afraid of when you avoid that thing?",
    close_message: "Looking at it is half the work.",
    is_reflection_day: false,
  },
  {
    day: 7,
    phase: "Notice",
    title: "Week one",
    arrival_prompt: "Seven days of paying attention. What have you learned about yourself?",
    action: "Write one sentence about who you've been this week. Not who you want to be. Who you've been.",
    reflection_prompt: "In one sentence — what pattern did you notice this week?",
    close_message: "This is your baseline. Everything builds from here.",
    is_reflection_day: true,
  },

  // ═══════════════════════════════════════
  // PHASE 2: INTERRUPT (Days 8–14)
  // ═══════════════════════════════════════
  {
    day: 8,
    phase: "Interrupt",
    title: "The pause",
    arrival_prompt: "You've been noticing. Now: what if you paused before reacting?",
    action: "The next time you feel a strong reaction today, wait three seconds before responding. Just three.",
    reflection_prompt: "What did three seconds change?",
    close_message: "Three seconds is a revolution.",
    is_reflection_day: false,
  },
  {
    day: 9,
    phase: "Interrupt",
    title: "One less thing",
    arrival_prompt: "More isn't better. What if you did less today, but meant it?",
    action: "Remove one thing from today. One task, one scroll, one obligation. Let it go.",
    reflection_prompt: "What did you let go of? How did it feel?",
    close_message: "Subtraction is underrated.",
    is_reflection_day: false,
  },
  {
    day: 10,
    phase: "Interrupt",
    title: "The story you tell",
    arrival_prompt: "You tell yourself a story about who you are. What if it's out of date?",
    action: "Catch one moment today where you act from an old story about yourself. Notice it without fixing it.",
    reflection_prompt: "What old story showed up today?",
    close_message: "Stories can be rewritten. But first, you have to see them.",
    is_reflection_day: false,
  },
  {
    day: 11,
    phase: "Interrupt",
    title: "Discomfort as data",
    arrival_prompt: "The things that make you uncomfortable are trying to tell you something.",
    action: "When something uncomfortable comes up today, ask: what is this telling me? Don't fix it. Listen.",
    reflection_prompt: "What was the discomfort trying to say?",
    close_message: "Discomfort isn't the enemy. Numbness is.",
    is_reflection_day: false,
  },
  {
    day: 12,
    phase: "Interrupt",
    title: "The other person",
    arrival_prompt: "Everyone you meet today is carrying something you can't see.",
    action: "In one interaction today, listen for thirty seconds longer than feels natural.",
    reflection_prompt: "What did you hear when you listened longer?",
    close_message: "Most people aren't heard. You changed that today.",
    is_reflection_day: false,
  },
  {
    day: 13,
    phase: "Interrupt",
    title: "Energy audit",
    arrival_prompt: "Some things fill you. Some things drain you. You already know which is which.",
    action: "At the end of today, write two columns: Gave Energy / Took Energy. Be honest.",
    reflection_prompt: "What surprised you about where your energy went?",
    close_message: "Energy is the truest currency you have.",
    is_reflection_day: false,
  },
  {
    day: 14,
    phase: "Interrupt",
    title: "Week two",
    arrival_prompt: "You've been interrupting your autopilot for a week. That takes courage.",
    action: "Name one pattern you broke this week. Even a small one.",
    reflection_prompt: "What pattern did you interrupt? What replaced it?",
    close_message: "Breaking a pattern is proof you're not stuck.",
    is_reflection_day: true,
  },

  // ═══════════════════════════════════════
  // PHASE 3: CHOOSE (Days 15–22)
  // ═══════════════════════════════════════
  {
    day: 15,
    phase: "Choose",
    title: "Intention",
    arrival_prompt: "Noticing is passive. Choosing is active. Today you choose.",
    action: "Before you start today, finish this sentence: 'Today, I choose to...' — carry it with you.",
    reflection_prompt: "What did you choose? Did you follow through?",
    close_message: "Choice is the muscle. Use it daily.",
    is_reflection_day: false,
  },
  {
    day: 16,
    phase: "Choose",
    title: "The hard conversation",
    arrival_prompt: "There's something you need to say to someone. You've been finding reasons not to.",
    action: "Say one honest thing today that you've been holding back. It doesn't have to be big.",
    reflection_prompt: "What happened when you said the thing?",
    close_message: "Honesty is expensive. But silence costs more.",
    is_reflection_day: false,
  },
  {
    day: 17,
    phase: "Choose",
    title: "Gratitude without performance",
    arrival_prompt: "Real gratitude is quiet. It doesn't need an audience.",
    action: "Send one message to someone you appreciate. No occasion. No explanation.",
    reflection_prompt: "Who did you reach out to? What did it feel like?",
    close_message: "Gratitude sent is gratitude doubled.",
    is_reflection_day: false,
  },
  {
    day: 18,
    phase: "Choose",
    title: "Boundary",
    arrival_prompt: "Every yes to something is a no to something else.",
    action: "Say no to one thing today that doesn't serve you. Politely. Firmly.",
    reflection_prompt: "What did you say no to? What did that protect?",
    close_message: "Boundaries aren't walls. They're architecture.",
    is_reflection_day: false,
  },
  {
    day: 19,
    phase: "Choose",
    title: "What you feed",
    arrival_prompt: "Your attention is food. What have you been feeding?",
    action: "For one hour today, consume nothing — no scrolling, no news, no input. Be with your own thoughts.",
    reflection_prompt: "What came up in the quiet?",
    close_message: "Silence isn't empty. It's full of answers.",
    is_reflection_day: false,
  },
  {
    day: 20,
    phase: "Choose",
    title: "The person you're becoming",
    arrival_prompt: "You are not who you were last month. Can you feel the difference?",
    action: "Write one sentence about who you are becoming. Not who you wish to be. Who you're actually becoming.",
    reflection_prompt: "Who are you becoming?",
    close_message: "Identity is not fixed. It's practiced.",
    is_reflection_day: false,
  },
  {
    day: 21,
    phase: "Choose",
    title: "Week three",
    arrival_prompt: "Three weeks. You've moved from noticing to interrupting to choosing. That's real growth.",
    action: "Name one choice you made this week that the old version of you wouldn't have made.",
    reflection_prompt: "What choice surprised you this week?",
    close_message: "You're not the same person who started this. That's the point.",
    is_reflection_day: true,
  },
  {
    day: 22,
    phase: "Choose",
    title: "Rest as action",
    arrival_prompt: "Choosing to rest is still choosing. Sometimes it's the bravest choice.",
    action: "Find fifteen minutes today with no purpose. Don't optimise it. Just be.",
    reflection_prompt: "How did it feel to rest on purpose?",
    close_message: "Rest isn't the absence of work. It's the presence of trust.",
    is_reflection_day: false,
  },

  // ═══════════════════════════════════════
  // PHASE 4: INTEGRATE (Days 23–30)
  // ═══════════════════════════════════════
  {
    day: 23,
    phase: "Integrate",
    title: "Your morning",
    arrival_prompt: "How you start the day is how you meet the day.",
    action: "Tomorrow morning, before picking up your phone, do one thing with intention. Water. Stretch. Breathe.",
    reflection_prompt: "What would your mornings look like if they belonged to you?",
    close_message: "Own your morning and the day negotiates with you.",
    is_reflection_day: false,
  },
  {
    day: 24,
    phase: "Integrate",
    title: "Your people",
    arrival_prompt: "You become the energy of the five people closest to you.",
    action: "Reach out to someone who makes you better. Tell them. No reason needed.",
    reflection_prompt: "Who lifts you? Who drains you? Be honest.",
    close_message: "Relationships are environments. Choose them.",
    is_reflection_day: false,
  },
  {
    day: 25,
    phase: "Integrate",
    title: "Your body",
    arrival_prompt: "Your body has been keeping score. It's time to listen.",
    action: "Move your body for ten minutes today. Not for fitness. For feeling.",
    reflection_prompt: "What does your body know that your mind ignores?",
    close_message: "The body doesn't lie. Learn its language.",
    is_reflection_day: false,
  },
  {
    day: 26,
    phase: "Integrate",
    title: "Your work",
    arrival_prompt: "Does your work reflect who you are, or just what you do?",
    action: "Find one moment in your work today where you can bring real presence. Not performance. Presence.",
    reflection_prompt: "Where does your work feel alive? Where does it feel hollow?",
    close_message: "Work without presence is just time spent.",
    is_reflection_day: false,
  },
  {
    day: 27,
    phase: "Integrate",
    title: "Forgiveness",
    arrival_prompt: "There's something you haven't forgiven. It's taking up space.",
    action: "Name one thing you're holding onto. You don't have to forgive it today. Just acknowledge it's there.",
    reflection_prompt: "What would you gain if you let that go?",
    close_message: "Forgiveness isn't for them. It's for you.",
    is_reflection_day: false,
  },
  {
    day: 28,
    phase: "Integrate",
    title: "Legacy",
    arrival_prompt: "If today were your only legacy, what would it say?",
    action: "Do one thing today purely because it's the right thing to do. No recognition. No return.",
    reflection_prompt: "What do you want people to say about you when you're not in the room?",
    close_message: "Legacy isn't built in big moments. It's built in small, unseen ones.",
    is_reflection_day: false,
  },
  {
    day: 29,
    phase: "Integrate",
    title: "Your letter",
    arrival_prompt: "Tomorrow this chapter closes. But first, one more thing.",
    action: "Write a short note to yourself — the person who started this 29 days ago. What would you tell them?",
    reflection_prompt: "What would you say to the person you were on Day 1?",
    close_message: "You have always been the guide you were looking for.",
    is_reflection_day: true,
  },
  {
    day: 30,
    phase: "Integrate",
    title: "Still here",
    arrival_prompt: "Thirty days. You didn't just read words. You changed how you move through the world.",
    action: "Today, carry nothing from this app. You already have everything you need. Go live it.",
    reflection_prompt: "In one sentence: what changed?",
    close_message: "This was never about the app. It was always about you. Go gently.",
    is_reflection_day: true,
  },
];


// ─── Presently: Adaptive Intelligence Engine v2 ───
// Pure functions. No side effects. No storage.
// Now includes voice reflection tracking.

// ─── 1. BEHAVIOURAL STATE MODEL ───

function computeBehaviourProfile(userData) {
  const journal = userData.journal || [];
  const completed = userData.completedDays || [];
  const dayLogs = userData.dayLogs || [];
  const currentDay = userData.currentDay || 1;

  const totalDays = Math.max(completed.length, 1);
  const reflectionsWritten = journal.length;
  const reflectionRate = reflectionsWritten / totalDays;
  const skippedReflections = totalDays - reflectionsWritten;
  const skipRate = skippedReflections / totalDays;

  // Reflection depth (text entries)
  const lengths = journal.map(j => {
    if (j.type === "voice") return j.duration > 15 ? "deep" : j.duration > 6 ? "medium" : "short";
    const len = (j.reflection || "").length;
    if (len === 0) return "none";
    if (len < 40) return "short";
    if (len < 120) return "medium";
    return "deep";
  });
  const deepCount = lengths.filter(l => l === "deep").length;
  const shortCount = lengths.filter(l => l === "short").length;
  const medCount = lengths.filter(l => l === "medium").length;

  // Voice tracking
  const voiceEntries = journal.filter(j => j.type === "voice");
  const textEntries = journal.filter(j => j.type !== "voice");
  const voiceRate = reflectionsWritten > 0 ? voiceEntries.length / reflectionsWritten : 0;
  const prefersVoice = voiceRate > 0.5 && voiceEntries.length >= 2;
  const avoidsVoice = voiceEntries.length === 0 && textEntries.length >= 4;
  const lastWasVoice = journal.length > 0 && journal[journal.length - 1]?.type === "voice";

  // Engagement style
  let engagementStyle = "responsive";
  if (reflectionRate < 0.3) {
    engagementStyle = "quiet";
  } else if (reflectionRate > 0.6 && (deepCount + medCount) > shortCount) {
    engagementStyle = "reflective";
  }

  // Recent states (last 7 day logs)
  const recentLogs = dayLogs.slice(-7);
  const recentStates = recentLogs.map(l => l.arrivalState).filter(Boolean);

  const stateCounts = {};
  recentStates.forEach(s => { stateCounts[s] = (stateCounts[s] || 0) + 1; });
  const dominantState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const dominantCount = stateCounts[dominantState] || 0;
  const hasDominantPattern = dominantCount >= 3 && recentStates.length >= 4;

  // Streak
  let softStreak = 0;
  for (let d = currentDay; d >= 1; d--) {
    if (completed.includes(d)) {
      softStreak++;
    } else if (completed.includes(d - 1)) {
      continue;
    } else {
      break;
    }
  }

  // Absence
  const lastCompleted = completed.length > 0 ? Math.max(...completed) : 0;
  const daysSinceLastComplete = currentDay - lastCompleted;
  const isReturningAfterAbsence = daysSinceLastComplete > 1 && completed.length > 0;
  const absenceLength = isReturningAfterAbsence ? daysSinceLastComplete : 0;

  return {
    totalDays,
    reflectionRate: Math.round(reflectionRate * 100) / 100,
    skipRate: Math.round(skipRate * 100) / 100,
    deepCount,
    shortCount,
    engagementStyle,
    recentStates,
    dominantState,
    hasDominantPattern,
    softStreak,
    isReturningAfterAbsence,
    absenceLength,
    currentDay,
    // Voice
    voiceRate: Math.round(voiceRate * 100) / 100,
    prefersVoice,
    avoidsVoice,
    lastWasVoice,
    voiceCount: voiceEntries.length,
  };
}

// ─── 2. ADAPTIVE COPY VARIANTS ───

const ARRIVAL_MICRO = {
  returning_1: [
    "You're here again. Start there.",
    "Back. That's what matters.",
  ],
  returning_3plus: [
    "Let's make this simple today.",
    "No catching up. Just today.",
    "Start exactly where you are.",
  ],
  heavy_pattern: [
    "It's been a heavier stretch.",
    "Heavy days still count.",
  ],
  steady_pattern: [
    "Something is settling.",
    "There's a steadiness building.",
  ],
  clear_pattern: [
    "Clarity suits you.",
    "You've been arriving clearly.",
  ],
  quiet_user: [
    "No pressure. Just presence.",
  ],
  default: null,
};

const ACTION_FRAMING = {
  returning: ["Keep it light today.", "Just this one thing."],
  quiet: ["Small and real."],
  reflective: ["Sit with this one."],
  default: null,
};

const REFLECTION_PLACEHOLDER = {
  quiet: "A word is enough…",
  responsive: "Write it as it felt…",
  reflective: "Stay with it…",
};

// Voice-specific copy
const VOICE_NUDGE = {
  prefersVoice: ["Say it again today.", "Your voice knows."],
  avoidsVoice: ["You can say it instead."],
};

const VOICE_ACK_SHORT = [
  "You said that out loud.",
  "That was enough.",
  "You let it out.",
];

const VOICE_ACK_LONG = [
  "You stayed with it.",
  "You didn't hold that in.",
  "You heard yourself say it.",
  "That came out clearly.",
];

const CLOSE_AFTER_SKIP = [
  "You still noticed.",
  "You don't have to write for this to count.",
  "Showing up is the thing.",
  "That was enough.",
];

const CLOSE_AFTER_SHORT = [
  "That says enough.",
  "You caught it.",
  "Brief and real.",
];

const CLOSE_AFTER_DEEP = [
  "There's something clear in that.",
  "You stayed with it.",
  "That's the kind of thought that changes things.",
];

const CLOSE_AFTER_RETURN = [
  "You came back. That matters more than you think.",
  "Welcome back. No need to explain.",
];

const CLOSE_AFTER_VOICE = [
  "You said it out loud. That's different.",
  "Your voice carried something today.",
  "Some things need to be heard, even by yourself.",
];

// ─── 3. PICK FUNCTION ───

function pick(arr, seed) {
  if (!arr || arr.length === 0) return null;
  return arr[seed % arr.length];
}

// ─── 4. GET ADAPTIVE COPY ───

function getAdaptiveCopy(profile, dayNumber, didReflect, reflectionLength, reflectionType) {
  const seed = dayNumber;
  const result = {
    arrivalMicro: null,
    actionFraming: null,
    reflectionPlaceholder: REFLECTION_PLACEHOLDER[profile.engagementStyle] || REFLECTION_PLACEHOLDER.responsive,
    voiceNudge: null,
    closeOverride: null,
    voiceAck: null,
  };

  // Arrival micro-line (~40%)
  const showMicro = (seed * 7 + 3) % 10 < 4;

  if (profile.isReturningAfterAbsence) {
    result.arrivalMicro = profile.absenceLength >= 3
      ? pick(ARRIVAL_MICRO.returning_3plus, seed)
      : pick(ARRIVAL_MICRO.returning_1, seed);
  } else if (showMicro && profile.hasDominantPattern) {
    if (profile.dominantState === "heavy") result.arrivalMicro = pick(ARRIVAL_MICRO.heavy_pattern, seed);
    else if (profile.dominantState === "steady") result.arrivalMicro = pick(ARRIVAL_MICRO.steady_pattern, seed);
    else if (profile.dominantState === "clear") result.arrivalMicro = pick(ARRIVAL_MICRO.clear_pattern, seed);
  } else if (showMicro && profile.engagementStyle === "quiet") {
    result.arrivalMicro = pick(ARRIVAL_MICRO.quiet_user, seed);
  }

  // Action framing (~30%)
  const showFraming = (seed * 3 + 1) % 10 < 3;
  if (profile.isReturningAfterAbsence) {
    result.actionFraming = pick(ACTION_FRAMING.returning, seed);
  } else if (showFraming) {
    result.actionFraming = pick(ACTION_FRAMING[profile.engagementStyle], seed);
  }

  // Voice nudge (on reflection screen, ~25% when relevant)
  const showVoiceNudge = (seed * 5 + 2) % 10 < 3;
  if (showVoiceNudge && profile.prefersVoice) {
    result.voiceNudge = pick(VOICE_NUDGE.prefersVoice, seed);
  } else if (showVoiceNudge && profile.avoidsVoice && dayNumber > 5) {
    result.voiceNudge = pick(VOICE_NUDGE.avoidsVoice, seed);
  }

  // Close override
  if (reflectionType === "voice") {
    result.closeOverride = pick(CLOSE_AFTER_VOICE, seed);
  } else if (profile.isReturningAfterAbsence) {
    result.closeOverride = pick(CLOSE_AFTER_RETURN, seed);
  } else if (!didReflect) {
    result.closeOverride = pick(CLOSE_AFTER_SKIP, seed);
  } else if (reflectionLength === "short") {
    result.closeOverride = pick(CLOSE_AFTER_SHORT, seed);
  } else if (reflectionLength === "deep") {
    result.closeOverride = pick(CLOSE_AFTER_DEEP, seed);
  }

  // Voice acknowledgment (shown between recording and close)
  if (reflectionType === "voice") {
    if (reflectionLength === "deep" || reflectionLength === "medium") {
      result.voiceAck = pick(VOICE_ACK_LONG, seed);
    } else {
      result.voiceAck = pick(VOICE_ACK_SHORT, seed);
    }
  }

  return result;
}

// ─── 5. WEEKLY SUMMARY ───

function getWeeklySummary(profile, weekNumber) {
  const { recentStates, reflectionRate, skipRate } = profile;

  let patternLine = "";
  if (recentStates.length >= 3) {
    const heavyDays = recentStates.filter(s => s === "heavy" || s === "restless").length;
    const calmDays = recentStates.filter(s => s === "steady" || s === "clear").length;
    const ratio = recentStates.length;
    if (heavyDays > ratio * 0.5) patternLine = "This week, you arrived more restless than settled.";
    else if (calmDays > ratio * 0.5) patternLine = "This week, you arrived with more clarity than not.";
    else patternLine = "This week was a mix. That's how most real weeks look.";
  } else {
    patternLine = "A shorter week. Still counts.";
  }

  let growthLine = "";
  if (reflectionRate > 0.6) growthLine = "You wrote more than you skipped. That takes something.";
  else if (reflectionRate > 0.3) growthLine = "You showed up, even on days words didn't come.";
  else if (skipRate > 0.7) growthLine = "You kept arriving. That's the practice.";
  else growthLine = "You stayed in it.";

  const reinforcements = [
    "That's how attention builds.",
    "Small things, repeated, become structure.",
    "You're building something that doesn't show up in metrics.",
    "This is what consistency actually looks like.",
  ];

  return { patternLine, growthLine, reinforcementLine: pick(reinforcements, weekNumber) };
}

// ─── 6. HELPERS ───

function classifyReflection(text) {
  if (!text || text.trim().length === 0) return "none";
  const len = text.trim().length;
  if (len < 40) return "short";
  if (len < 120) return "medium";
  return "deep";
}

function classifyVoiceDuration(seconds) {
  if (seconds < 6) return "short";
  if (seconds < 15) return "medium";
  return "deep";
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function createDayLog(dayNumber, phase, arrivalState, actionCommitted, reflectionWritten, reflectionText, reflectionType) {
  return {
    dayNumber,
    phase,
    arrivalState,
    actionCommitted,
    reflectionWritten,
    reflectionLength: reflectionType === "voice"
      ? null // duration tracked in journal entry
      : classifyReflection(reflectionText),
    reflectionType: reflectionType || "text",
    completedDay: true,
    completedAtTime: getTimeOfDay(),
    timestamp: new Date().toISOString(),
  };
}


// ─── Constants ───
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
function load() { try { const r = localStorage.getItem("presently_v3"); return r ? JSON.parse(r) : null; } catch { return null; } }
function save(d) { try { localStorage.setItem("presently_v3", JSON.stringify(d)); } catch {} }
function getDefault() { return { currentDay: 1, journal: [], completedDays: [], dayLogs: [], startedAt: new Date().toISOString() }; }
function getGreeting() { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; return "Good evening"; }

// ─── Voice helpers ───
function saveAudioBlob(blob, dayNumber) {
  // Store in localStorage as base64 (small recordings only — under ~1min)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const key = `presently_audio_${dayNumber}`;
      try { localStorage.setItem(key, reader.result); } catch {}
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
function loadAudioUrl(dayNumber) {
  try { return localStorage.getItem(`presently_audio_${dayNumber}`) || null; } catch { return null; }
}

// ─── App ───
export default function Presently() {
  const [screen, setScreen] = useState("arrival");
  const [fade, setFade] = useState("in");
  const [userData, setUserData] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [committed, setCommitted] = useState(false);
  const [didReflect, setDidReflect] = useState(false);
  const [reflectionLen, setReflectionLen] = useState("none");
  const [reflectionType, setReflectionType] = useState("text");

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [micAllowed, setMicAllowed] = useState(null); // null=unknown, true, false
  const [playingDay, setPlayingDay] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const durationRef = useRef(0);
  const audioPlayerRef = useRef(null);
  const inputRef = useRef(null);

  // Boot
  useEffect(() => {
    const stored = load();
    if (stored) {
      if (!stored.dayLogs) stored.dayLogs = [];
      setUserData(stored);
      if (stored.completedDays.includes(stored.currentDay)) setScreen("close");
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
  const lastReflection = userData?.journal?.length > 0 ? userData.journal[userData.journal.length - 1] : null;

  const profile = useMemo(() => userData ? computeBehaviourProfile(userData) : null, [userData]);
  const adaptive = useMemo(() => profile ? getAdaptiveCopy(profile, currentDay, didReflect, reflectionLen, reflectionType) : {}, [profile, currentDay, didReflect, reflectionLen, reflectionType]);

  const weekNumber = Math.ceil(currentDay / 7);
  const isEndOfWeek = currentDay > 1 && currentDay % 7 === 0;
  const weekly = useMemo(() => profile ? getWeeklySummary(profile, weekNumber) : null, [profile, weekNumber]);

  const transition = useCallback((next, delay = 380) => {
    setFade("out");
    setTimeout(() => { setScreen(next); setFade("in"); }, delay);
  }, []);

  // ─── Handlers ───
  const handleStateSelect = useCallback(id => { setSelectedState(id); transition("insight"); }, [transition]);
  const handleContinueToAction = useCallback(() => transition("action"), [transition]);
  const handleCommit = useCallback(() => { setCommitted(true); setTimeout(() => transition("reflect"), 1000); }, [transition]);

  const completeDay = useCallback((text, type = "text", duration = 0) => {
    const wrote = !!text || type === "voice";
    const rLen = type === "voice" ? classifyVoiceDuration(duration) : classifyReflection(text);
    setDidReflect(wrote);
    setReflectionLen(rLen);
    setReflectionType(type);

    const updated = { ...userData };
    if (wrote) {
      const entry = {
        day: currentDay, date: new Date().toISOString(), state: selectedState,
        phase: dayData.phase, title: dayData.title, type,
      };
      if (type === "voice") {
        entry.duration = duration;
        entry.reflection = `Voice reflection (${duration}s)`;
      } else {
        entry.reflection = text;
      }
      updated.journal = [...(updated.journal || []), entry];
    }

    const log = createDayLog(currentDay, dayData.phase, selectedState, committed, wrote, text, type);
    updated.dayLogs = [...(updated.dayLogs || []), log];
    updated.completedDays = [...new Set([...(updated.completedDays || []), currentDay])];
    save(updated);
    setUserData(updated);

    if (type === "voice" && wrote) {
      transition("voiceack");
    } else if (currentDay >= 30) {
      transition("complete30");
    } else if (isEndOfWeek) {
      transition("weekly");
    } else {
      transition("close");
    }
  }, [userData, currentDay, selectedState, dayData, committed, isEndOfWeek, transition]);

  const handleReflectionSubmit = useCallback(() => completeDay(reflectionText.trim()), [reflectionText, completeDay]);
  const handleSkipReflection = useCallback(() => completeDay(null), [completeDay]);

  // ─── Voice Recording ───
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicAllowed(true);
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      durationRef.current = 0;

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setAudioDuration(durationRef.current);
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
      };

      mr.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setAudioDuration(d => d + 1);
      }, 1000);
    } catch {
      setMicAllowed(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const handleEnterVoice = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    transition("voice");
    // Auto-start after transition
    setTimeout(() => startRecording(), 500);
  }, [transition, startRecording]);

  const handleKeepVoice = useCallback(async () => {
    if (audioBlob) {
      await saveAudioBlob(audioBlob, currentDay);
    }
    completeDay(null, "voice", audioDuration);
  }, [audioBlob, currentDay, audioDuration, completeDay]);

  const handleDiscardVoice = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    transition("reflect"); // back to text option
  }, [transition]);

  const handleVoiceAckContinue = useCallback(() => {
    if (currentDay >= 30) transition("complete30");
    else if (isEndOfWeek) transition("weekly");
    else transition("close");
  }, [currentDay, isEndOfWeek, transition]);

  const handleNextDay = useCallback(() => {
    if (currentDay >= 30) { transition("complete30"); return; }
    const updated = { ...userData, currentDay: currentDay + 1 };
    save(updated);
    setUserData(updated);
    setSelectedState(null); setReflectionText(""); setCommitted(false);
    setDidReflect(false); setReflectionLen("none"); setReflectionType("text");
    setAudioBlob(null); setAudioUrl(null); setAudioDuration(0);
    transition("arrival");
  }, [userData, currentDay, transition]);

  const handleReset = useCallback(() => {
    const fresh = getDefault();
    save(fresh);
    setUserData(fresh);
    setSelectedState(null); setReflectionText(""); setCommitted(false);
    setDidReflect(false); setScreen("arrival"); setFade("in");
  }, []);

  // Journal audio playback
  const handlePlayAudio = useCallback((day) => {
    const url = loadAudioUrl(day);
    if (!url) return;
    if (playingDay === day) {
      audioPlayerRef.current?.pause();
      setPlayingDay(null);
      return;
    }
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    const audio = new Audio(url);
    audio.onended = () => setPlayingDay(null);
    audio.play();
    audioPlayerRef.current = audio;
    setPlayingDay(day);
  }, [playingDay]);

  if (!userData) return null;

  const journalEntries = userData.journal || [];
  const completedCount = (userData.completedDays || []).length;
  const progressPct = Math.min(completedCount / 30, 1);
  const closeMessage = adaptive.closeOverride || dayData.close_message;

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
        .app::after{content:'';position:fixed;inset:0;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E")}
        .scene{max-width:400px;width:100%;position:relative;z-index:1;transition:opacity 0.45s ease,transform 0.45s ease}
        .scene.fade-out{opacity:0;transform:translateY(5px)}
        .scene.fade-in{opacity:1;transform:translateY(0)}
        .phase-badge{display:flex;align-items:center;gap:0.5rem;margin-bottom:2.5rem;justify-content:center}
        .phase-dot{width:5px;height:5px;border-radius:50%}
        .phase-label{font-size:0.65rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase}
        .phase-track{display:flex;gap:3px;margin-left:0.5rem}
        .phase-seg{width:16px;height:3px;border-radius:1.5px;background:var(--surface2);transition:background 0.3s}
        .phase-seg.filled{background:var(--accent);opacity:0.6}
        .phase-seg.current{background:var(--accent);opacity:1}
        .greeting{font-size:0.75rem;color:var(--text-dim);letter-spacing:0.1em;text-transform:uppercase;text-align:center;margin-bottom:0.3rem;font-weight:300}
        .day-title{font-size:0.7rem;color:var(--text-faint);text-align:center;margin-bottom:1rem;letter-spacing:0.06em}
        .micro-line{font-size:0.78rem;color:var(--text-dim);text-align:center;margin-bottom:1.5rem;font-weight:300;font-style:italic;opacity:0;animation:fadeSlow .8s ease .6s forwards}
        @keyframes fadeSlow{to{opacity:.7}}
        .echo{text-align:center;margin-bottom:1.5rem;padding:1rem 1.2rem;background:var(--accent-soft);border-radius:0.75rem;border:1px solid rgba(184,160,122,0.05)}
        .echo-label{font-size:0.6rem;color:var(--text-dim);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.4rem}
        .echo-text{font-family:'Cormorant Garamond',serif;font-size:0.95rem;font-style:italic;color:var(--text);opacity:0.6;line-height:1.45}
        .prompt{font-family:'Cormorant Garamond',serif;font-size:1.75rem;font-weight:300;font-style:italic;text-align:center;line-height:1.45;color:var(--text);margin-bottom:2.5rem}
        .action-text{font-size:1.1rem;font-weight:300;line-height:1.55;color:var(--text);text-align:center;margin-bottom:2.5rem}
        .action-framing{font-size:0.72rem;color:var(--text-dim);text-align:center;margin-bottom:1rem;letter-spacing:0.05em;font-style:italic}
        .states{display:flex;flex-wrap:wrap;justify-content:center;gap:0.55rem}
        .state-pill{background:var(--surface);border:1px solid rgba(255,255,255,0.035);color:var(--text-dim);padding:0.6rem 1.35rem;border-radius:100px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.82rem;font-weight:400;letter-spacing:0.03em;transition:all 0.25s ease}
        .state-pill:hover{background:var(--surface2);color:var(--text);border-color:rgba(184,160,122,0.12)}
        .state-pill:active{transform:scale(0.97)}
        .btn{display:block;width:100%;padding:0.95rem;border:1px solid rgba(184,160,122,0.18);background:transparent;color:var(--accent);border-radius:0.55rem;font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:400;letter-spacing:0.03em;cursor:pointer;transition:all 0.25s ease;margin-top:2rem}
        .btn:hover{background:var(--accent-soft);border-color:rgba(184,160,122,0.3)}
        .btn.done{background:rgba(184,160,122,0.08);border-color:rgba(184,160,122,0.25);pointer-events:none}
        .btn-row{display:flex;gap:0.6rem;margin-top:2rem}
        .btn-primary{flex:1;padding:0.85rem;background:var(--accent-soft);border:1px solid rgba(184,160,122,0.12);color:var(--accent);border-radius:0.55rem;font-family:'DM Sans',sans-serif;font-size:0.82rem;cursor:pointer;transition:all 0.25s}
        .btn-primary:hover{background:rgba(184,160,122,0.1)}
        .btn-ghost{padding:0.85rem 1rem;background:transparent;border:none;color:var(--text-faint);font-family:'DM Sans',sans-serif;font-size:0.78rem;cursor:pointer;transition:color 0.25s}
        .btn-ghost:hover{color:var(--text-dim)}
        .input{width:100%;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,0.05);color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.92rem;font-weight:300;padding:0.7rem 0;outline:none;transition:border-color 0.3s}
        .input::placeholder{color:var(--text-faint)}
        .input:focus{border-color:rgba(184,160,122,0.25)}

        /* ─── Voice option on reflect screen ─── */
        .voice-opt{
          display:flex;align-items:center;justify-content:center;gap:0.5rem;
          margin-top:1.2rem;cursor:pointer;transition:color 0.25s;
          color:var(--text-faint);font-size:0.78rem;letter-spacing:0.03em;
        }
        .voice-opt:hover{color:var(--text-dim)}
        .voice-opt-dot{
          width:8px;height:8px;border-radius:50%;border:1.5px solid var(--text-faint);
          transition:border-color 0.25s;
        }
        .voice-opt:hover .voice-opt-dot{border-color:var(--accent)}

        /* ─── Voice mode fullscreen ─── */
        .voice-screen{
          position:fixed;inset:0;z-index:100;background:var(--bg);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:2rem;cursor:pointer;
          transition:opacity 0.45s ease;
        }
        .voice-screen.fade-out{opacity:0}
        .voice-screen.fade-in{opacity:1}
        .voice-prompt{
          font-family:'Cormorant Garamond',serif;font-size:1.6rem;
          font-weight:300;font-style:italic;color:var(--text);
          margin-bottom:0.5rem;text-align:center;
        }
        .voice-sub{font-size:0.78rem;color:var(--text-faint);margin-bottom:3rem;text-align:center;font-weight:300}

        /* Pulse circle */
        .pulse-wrap{position:relative;width:80px;height:80px;margin:0 auto 2rem}
        .pulse-ring{
          position:absolute;inset:0;border-radius:50%;
          border:1.5px solid rgba(184,160,122,0.15);
          animation:pulseRing 2s ease-in-out infinite;
        }
        .pulse-ring:nth-child(2){animation-delay:0.5s}
        .pulse-ring:nth-child(3){animation-delay:1s}
        .pulse-core{
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:12px;height:12px;border-radius:50%;background:var(--accent);
          opacity:0.8;animation:pulseCore 2s ease-in-out infinite;
        }
        @keyframes pulseRing{
          0%{transform:scale(0.8);opacity:0.4}
          50%{transform:scale(1.3);opacity:0.1}
          100%{transform:scale(0.8);opacity:0.4}
        }
        @keyframes pulseCore{
          0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.8}
          50%{transform:translate(-50%,-50%) scale(1.2);opacity:1}
        }
        .voice-timer{font-size:0.65rem;color:var(--text-faint);letter-spacing:0.1em;text-align:center;margin-top:1rem;opacity:0.4}
        .voice-stop-hint{font-size:0.68rem;color:var(--text-faint);text-align:center;margin-top:2rem;opacity:0.3}

        /* Review state */
        .voice-review{text-align:center;padding:2rem 0}
        .voice-review-prompt{
          font-family:'Cormorant Garamond',serif;font-size:1.5rem;
          font-weight:300;font-style:italic;color:var(--text);margin-bottom:0.6rem;
        }
        .voice-review-micro{font-size:0.78rem;color:var(--text-dim);margin-bottom:2rem;font-weight:300;font-style:italic}

        /* Voice ack screen */
        .voice-ack{text-align:center;padding:3rem 0}
        .voice-ack-msg{
          font-family:'Cormorant Garamond',serif;font-size:1.35rem;
          font-weight:300;font-style:italic;color:var(--text);
          margin-bottom:2rem;line-height:1.5;
        }

        /* Mic denied */
        .mic-denied{text-align:center;padding:2rem 0}
        .mic-denied-msg{font-size:0.85rem;color:var(--text-dim);margin-bottom:1.5rem;font-weight:300;line-height:1.5}

        /* Journal voice entry */
        .j-voice{
          display:flex;align-items:center;gap:0.6rem;margin-top:0.3rem;
        }
        .j-play-btn{
          width:28px;height:28px;border-radius:50%;border:1px solid rgba(184,160,122,0.2);
          background:transparent;color:var(--accent);font-size:0.6rem;
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          transition:all 0.25s;flex-shrink:0;
        }
        .j-play-btn:hover{background:var(--accent-soft);border-color:rgba(184,160,122,0.35)}
        .j-play-btn.playing{background:rgba(184,160,122,0.1);border-color:var(--accent)}
        .j-duration{font-size:0.7rem;color:var(--text-faint);letter-spacing:0.05em}

        .close-wrap{text-align:center;padding:2rem 0}
        .close-msg{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:300;font-style:italic;color:var(--text);line-height:1.5;margin-bottom:2rem}
        .arc-wrap{width:44px;height:44px;margin:0 auto 1.5rem}
        .arc-wrap svg{transform:rotate(-90deg)}
        .arc-wrap circle{fill:none;stroke-width:2;stroke-linecap:round}
        .arc-bg{stroke:var(--surface2)}
        .arc-fill{stroke:var(--accent);transition:stroke-dashoffset 1.2s ease}
        .close-sub{font-size:0.7rem;color:var(--text-faint);letter-spacing:0.06em}
        .weekly-wrap{text-align:center;padding:1.5rem 0}
        .weekly-title{font-size:0.65rem;color:var(--text-dim);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2rem}
        .weekly-line{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:300;font-style:italic;line-height:1.55;color:var(--text);margin-bottom:0.8rem}
        .weekly-line.dim{color:var(--text-dim);font-size:1.05rem}
        .weekly-line.strong{color:var(--accent);font-size:1.1rem;margin-top:1.5rem}
        .weekly-stats{display:flex;justify-content:center;gap:2rem;margin-top:2rem;padding-top:1.2rem;border-top:1px solid rgba(255,255,255,0.03)}
        .weekly-stat{text-align:center}
        .weekly-stat-num{font-size:1.4rem;color:var(--text);font-weight:300;margin-bottom:0.15rem}
        .weekly-stat-label{font-size:0.6rem;color:var(--text-faint);letter-spacing:0.08em;text-transform:uppercase}
        .final{text-align:center;padding:2rem 0}
        .final-title{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:300;color:var(--text);margin-bottom:0.5rem}
        .final-body{font-size:0.9rem;color:var(--text-dim);line-height:1.6;max-width:320px;margin:0 auto 2rem;font-weight:300}
        .journal-head{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:300;color:var(--text);margin-bottom:0.25rem}
        .journal-sub{font-size:0.72rem;color:var(--text-dim);margin-bottom:1.5rem;letter-spacing:0.03em}
        .j-entry{padding:1.1rem 0;border-bottom:1px solid rgba(255,255,255,0.025)}
        .j-meta{font-size:0.6rem;color:var(--text-faint);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.4rem;display:flex;align-items:center;gap:0.5rem}
        .j-title{font-size:0.75rem;color:var(--text-dim);margin-bottom:0.35rem;font-weight:400}
        .j-text{font-size:0.88rem;color:var(--text);line-height:1.5;font-weight:300}
        .j-empty{text-align:center;color:var(--text-faint);font-size:0.82rem;padding:3rem 0;font-weight:300}
        .bnav{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:center;gap:2.5rem;padding:0.8rem 0 max(1.5rem,env(safe-area-inset-bottom));z-index:10;background:linear-gradient(transparent,var(--bg) 35%)}
        .bnav-btn{background:none;border:none;color:var(--text-faint);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;font-family:'DM Sans',sans-serif;transition:color 0.25s;padding:0.4rem}
        .bnav-btn:hover,.bnav-btn.on{color:var(--text-dim)}
        .s1{animation:up .55s ease .08s both}.s2{animation:up .55s ease .2s both}.s3{animation:up .55s ease .35s both}.s4{animation:up .55s ease .5s both}.s5{animation:up .55s ease .7s both}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:390px){.prompt{font-size:1.45rem}.state-pill{padding:0.5rem 1.1rem;font-size:0.78rem}}
      `}</style>

      <div className="app">

        {/* ════════ ARRIVAL ════════ */}
        {screen === "arrival" && (
          <div className={`scene fade-${fade}`}>
            <div className="phase-badge s1">
              <span className="phase-dot" style={{ background: phaseMeta.color }} />
              <span className="phase-label" style={{ color: phaseMeta.color }}>Phase {phaseMeta.num}: {phase}</span>
              <div className="phase-track">{[1,2,3,4].map(i => <div key={i} className={`phase-seg ${i < phaseMeta.num ? 'filled' : ''} ${i === phaseMeta.num ? 'current' : ''}`} />)}</div>
            </div>
            <div className="greeting s1">{getGreeting()}</div>
            <div className="day-title s1">{dayData.title}</div>
            {adaptive.arrivalMicro && <div className="micro-line">{adaptive.arrivalMicro}</div>}
            {lastReflection && currentDay > 1 && !profile?.isReturningAfterAbsence && (
              <div className="echo s2">
                <div className="echo-label">{lastReflection.type === "voice" ? "Last time you spoke" : "Last time you said"}</div>
                <div className="echo-text">
                  {lastReflection.type === "voice" ? `Voice · ${lastReflection.duration}s` : `"${lastReflection.reflection}"`}
                </div>
              </div>
            )}
            <div className={`prompt ${lastReflection && currentDay > 1 ? 's3' : 's2'}`}>How are you, right now?</div>
            <div className={`states ${lastReflection && currentDay > 1 ? 's4' : 's3'}`}>
              {STATES.map(s => <button key={s.id} className="state-pill" onClick={() => handleStateSelect(s.id)}>{s.label}</button>)}
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
            {adaptive.actionFraming && <div className="action-framing s1">{adaptive.actionFraming}</div>}
            <div className={`action-text ${adaptive.actionFraming ? 's2' : 's1'}`}>{dayData.action}</div>
            <button className={`btn ${adaptive.actionFraming ? 's3' : 's2'} ${committed ? 'done' : ''}`} onClick={handleCommit}>
              {committed ? "Noted" : "I'll do this once"}
            </button>
          </div>
        )}

        {/* ════════ REFLECT ════════ */}
        {screen === "reflect" && (
          <div className={`scene fade-${fade}`}>
            <div className="prompt s1" style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>{dayData.reflection_prompt}</div>
            <input ref={inputRef} className="input s2" type="text"
              placeholder={adaptive.reflectionPlaceholder || "Write it as it felt…"}
              value={reflectionText} onChange={e => setReflectionText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && reflectionText.trim() && handleReflectionSubmit()}
              autoFocus />
            <div className="btn-row s3">
              <button className="btn-primary" onClick={handleReflectionSubmit} disabled={!reflectionText.trim()}>Keep this</button>
              <button className="btn-ghost" onClick={handleSkipReflection}>Skip for now</button>
            </div>
            {/* Voice option */}
            <div className="voice-opt s4" onClick={handleEnterVoice} role="button" tabIndex={0}>
              <span className="voice-opt-dot" />
              {adaptive.voiceNudge || "Say it out loud"}
            </div>
          </div>
        )}

        {/* ════════ VOICE MODE ════════ */}
        {screen === "voice" && (
          <div className={`voice-screen fade-${fade}`} onClick={isRecording ? stopRecording : undefined}>
            {micAllowed === false ? (
              <div className="mic-denied">
                <div className="mic-denied-msg">Microphone access wasn't granted. You can enable it in your browser settings.</div>
                <button className="btn" onClick={() => transition("reflect")}>Write instead</button>
              </div>
            ) : isRecording ? (
              <>
                <div className="voice-prompt s1">Just say it.</div>
                <div className="voice-sub s2">No need to get it right.</div>
                <div className="pulse-wrap s3">
                  <div className="pulse-ring" />
                  <div className="pulse-ring" />
                  <div className="pulse-ring" />
                  <div className="pulse-core" />
                </div>
                {audioDuration > 2 && (
                  <div className="voice-timer">{Math.floor(audioDuration / 60)}:{String(audioDuration % 60).padStart(2, '0')}</div>
                )}
                <div className="voice-stop-hint s5">Tap anywhere to stop</div>
              </>
            ) : audioBlob ? (
              <div className="voice-review">
                <div className="voice-review-prompt s1">Keep this?</div>
                <div className="voice-review-micro s2">
                  {audioDuration < 6 ? "That's enough." : audioDuration < 15 ? "You caught something." : "You stayed with that."}
                </div>
                <div className="btn-row s3" style={{ justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={handleKeepVoice}>Keep it</button>
                  <button className="btn-ghost" onClick={handleDiscardVoice}>Let it go</button>
                </div>
              </div>
            ) : (
              <div className="voice-sub">Starting…</div>
            )}
          </div>
        )}

        {/* ════════ VOICE ACK ════════ */}
        {screen === "voiceack" && (
          <div className={`scene fade-${fade}`}>
            <div className="voice-ack">
              <div className="voice-ack-msg s1">{adaptive.voiceAck || "You said that out loud."}</div>
              <button className="btn s2" onClick={handleVoiceAckContinue}>Continue</button>
            </div>
          </div>
        )}

        {/* ════════ WEEKLY SUMMARY ════════ */}
        {screen === "weekly" && weekly && (
          <div className={`scene fade-${fade}`}>
            <div className="weekly-wrap">
              <div className="weekly-title s1">Week {weekNumber}</div>
              <div className="weekly-line s2">{weekly.patternLine}</div>
              <div className="weekly-line dim s3">{weekly.growthLine}</div>
              <div className="weekly-line strong s4">{weekly.reinforcementLine}</div>
              <div className="weekly-stats s5">
                <div className="weekly-stat"><div className="weekly-stat-num">{completedCount}</div><div className="weekly-stat-label">Days</div></div>
                <div className="weekly-stat"><div className="weekly-stat-num">{journalEntries.length}</div><div className="weekly-stat-label">Reflections</div></div>
                <div className="weekly-stat"><div className="weekly-stat-num">{profile?.softStreak || 0}</div><div className="weekly-stat-label">Streak</div></div>
              </div>
              <button className="btn s5" onClick={() => transition("close")}>Continue</button>
            </div>
          </div>
        )}

        {/* ════════ CLOSE ════════ */}
        {screen === "close" && (
          <div className={`scene fade-${fade}`}>
            <div className="close-wrap">
              <div className="close-msg s1">{closeMessage}</div>
              <div className="arc-wrap s2">
                <svg viewBox="0 0 44 44" width="44" height="44">
                  <circle className="arc-bg" cx="22" cy="22" r="18" />
                  <circle className="arc-fill" cx="22" cy="22" r="18" strokeDasharray={2*Math.PI*18} strokeDashoffset={2*Math.PI*18*(1-progressPct)} />
                </svg>
              </div>
              <div className="close-sub s3">{completedCount >= 30 ? "30 days complete" : `${completedCount} of 30`}</div>
              {currentDay < 30 && <button className="btn s4" onClick={handleNextDay}>Tomorrow</button>}
            </div>
          </div>
        )}

        {/* ════════ 30-DAY COMPLETE ════════ */}
        {screen === "complete30" && (
          <div className={`scene fade-${fade}`}>
            <div className="final">
              <div className="final-title s1">Still here.</div>
              <div className="final-body s2">Thirty days. You didn't just read words. You changed how you move through the world. This was never about the app. It was always about you.</div>
              <div className="close-msg s3" style={{ fontSize: '1.15rem' }}>Go gently.</div>
              <button className="btn s4" onClick={() => transition("journal")}>Read your thread</button>
              <button className="btn-ghost s5" onClick={handleReset} style={{ margin: '1rem auto', display: 'block' }}>Begin again</button>
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
                    {je.type === "voice" && <><span>·</span><span>voice</span></>}
                  </div>
                  {je.title && <div className="j-title">Day {je.day}: {je.title}</div>}
                  {je.type === "voice" ? (
                    <div className="j-voice">
                      <button className={`j-play-btn ${playingDay === je.day ? 'playing' : ''}`} onClick={() => handlePlayAudio(je.day)}>
                        {playingDay === je.day ? "■" : "▶"}
                      </button>
                      <span className="j-duration">{je.duration}s</span>
                    </div>
                  ) : (
                    <div className="j-text">{je.reflection}</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ════════ BOTTOM NAV ════════ */}
        {(screen === "close" || screen === "journal" || screen === "complete30") && (
          <div className="bnav">
            <button className={`bnav-btn ${screen !== "journal" ? "on" : ""}`} onClick={() => { if (screen === "journal") transition("close"); }}>Today</button>
            <button className={`bnav-btn ${screen === "journal" ? "on" : ""}`} onClick={() => { if (screen !== "journal") transition("journal"); }}>Journal</button>
          </div>
        )}
      </div>
    </>
  );
}
