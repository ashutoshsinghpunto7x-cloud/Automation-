import { NextResponse } from "next/server";
import { getCall, resetCall } from "@/lib/callStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const call = await getCall();
  return NextResponse.json({
    ...call,
    _meta: {
      messageCount: call.messages?.length ?? 0,
      lastMessage: call.messages?.[call.messages.length - 1] ?? null,
      checkedAt: new Date().toISOString(),
    },
  });
}

/** POST /api/vapi/debug — reset Redis state (useful after a stuck call) */
export async function POST() {
  await resetCall();
  return NextResponse.json({ reset: true });
}
