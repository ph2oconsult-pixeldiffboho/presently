// ─── Presently: Adaptive Intelligence Engine v2 ───
// Pure functions. No side effects. No storage.
// Now includes voice reflection tracking.

// ─── 1. BEHAVIOURAL STATE MODEL ───

export function computeBehaviourProfile(userData) {
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

export function getAdaptiveCopy(profile, dayNumber, didReflect, reflectionLength, reflectionType) {
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

export function getWeeklySummary(profile, weekNumber) {
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

export function classifyReflection(text) {
  if (!text || text.trim().length === 0) return "none";
  const len = text.trim().length;
  if (len < 40) return "short";
  if (len < 120) return "medium";
  return "deep";
}

export function classifyVoiceDuration(seconds) {
  if (seconds < 6) return "short";
  if (seconds < 15) return "medium";
  return "deep";
}

export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export function createDayLog(dayNumber, phase, arrivalState, actionCommitted, reflectionWritten, reflectionText, reflectionType) {
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
