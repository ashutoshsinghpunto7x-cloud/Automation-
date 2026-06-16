import { NextResponse } from "next/server";
import { getCall, resetCall } from "@/lib/callStore";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const redis = Redis.fromEnv();

export async function GET() {
  const [call, lastPayload] = await Promise.all([
    getCall(),
    redis.get("vapi:last:payload").catch(() => null),
  ]);

  return NextResponse.json({
    callState: call,
    lastWebhookPayload: lastPayload,
    _meta: {
      messageCount: call.messages?.length ?? 0,
      lastMessage: call.messages?.[call.messages.length - 1] ?? null,
      checkedAt: new Date().toISOString(),
      tip: "POST to /api/vapi/inject with {action:'start'|'message'|'end'|'reset'} to test UI",
    },
  });
}

/** POST /api/vapi/debug — reset Redis state */
export async function POST() {
  await resetCall();
  return NextResponse.json({ reset: true });
}
