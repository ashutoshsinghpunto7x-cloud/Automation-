/**
 * In-memory store for the active Vapi call.
 * Survives across requests in the same server process.
 */

export interface TranscriptMsg {
  role: "assistant" | "user";
  text: string;
  timestamp: string;
}

export interface CallState {
  active: boolean;
  callId: string;
  callerName: string;
  callerPhone: string;
  startedAt: string;
  messages: TranscriptMsg[];
  summary: string | null;
  endedAt: string | null;
  sentiment: string;
  intent: string;
  language: string;
  noise: string;
}

const INITIAL: CallState = {
  active: false,
  callId: "",
  callerName: "",
  callerPhone: "",
  startedAt: "",
  messages: [],
  summary: null,
  endedAt: null,
  sentiment: "--",
  intent: "--",
  language: "--",
  noise: "--",
};

let store: CallState = { ...INITIAL };

export function getCall(): CallState { return store; }

export function startCall(callId: string, callerName: string, callerPhone: string): void {
  store = {
    ...INITIAL,
    active: true,
    callId,
    callerName: callerName || "Unknown",
    callerPhone: callerPhone || "--",
    startedAt: new Date().toISOString(),
    messages: [],
  };
}

export function addMessage(role: "assistant" | "user", text: string): void {
  if (!store.active && !store.callId) return;
  const now = new Date();
  const hh = now.getHours(); const mm = now.getMinutes();
  const ampm = hh >= 12 ? "PM" : "AM";
  const h = hh % 12 || 12;
  const timestamp = `${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")} ${ampm}`;
  store.messages = [...store.messages, { role, text, timestamp }];
}

export function updateAnalysis(sentiment: string, intent: string, language: string, noise: string): void {
  if (sentiment) store.sentiment = sentiment;
  if (intent)    store.intent    = intent;
  if (language)  store.language  = language;
  if (noise)     store.noise     = noise;
}

export function endCall(summary: string): void {
  store.active  = false;
  store.summary = summary || null;
  store.endedAt = new Date().toISOString();
}

export function resetCall(): void {
  store = { ...INITIAL };
}
