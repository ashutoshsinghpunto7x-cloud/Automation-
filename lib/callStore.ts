import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "vapi:call:state";

export interface CallMessage {
  role: "ai" | "user";
  text: string;
  time: string;
}

export interface CallState {
  active: boolean;
  callId: string;
  callerName: string;
  callerPhone: string;
  messages: CallMessage[];
  sentiment: string;
  intent: string;
  language: string;
  noise: string;
  summary: string;
  endedAt: string;
}

const DEFAULT: CallState = {
  active: false, callId: "", callerName: "", callerPhone: "",
  messages: [], sentiment: "--", intent: "--", language: "--", noise: "--",
  summary: "", endedAt: "",
};

export async function getCall(): Promise<CallState> {
  try {
    const data = await redis.get<CallState>(KEY);
    return data ?? DEFAULT;
  } catch { return DEFAULT; }
}

export async function startCall(callId: string, callerName: string, callerPhone: string) {
  await redis.set(KEY, { ...DEFAULT, active: true, callId, callerName, callerPhone });
}

export async function addMessage(role: "ai" | "user", text: string) {
  const call = await getCall();
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const messages = [...(call.messages ?? []).slice(-49), { role, text, time }];
  await redis.set(KEY, { ...call, messages });
}

export async function updateAnalysis(sentiment?: string, intent?: string, language?: string, noise?: string) {
  const call = await getCall();
  await redis.set(KEY, {
    ...call,
    sentiment: sentiment ?? call.sentiment,
    intent: intent ?? call.intent,
    language: language ?? call.language,
    noise: noise ?? call.noise,
  });
}

export async function endCall(summary: string) {
  const call = await getCall();
  const endedAt = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  await redis.set(KEY, { ...call, active: false, summary, endedAt }, { ex: 3600 });
}

export async function resetCall() {
  await redis.set(KEY, DEFAULT);
}
