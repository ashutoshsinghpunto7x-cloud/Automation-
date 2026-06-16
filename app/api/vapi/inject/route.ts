/**
 * POST /api/vapi/inject
 * Manually inject test data into Redis to verify the UI works
 * independently of the real webhook.
 *
 * Usage examples:
 *   { "action": "start", "name": "Test User", "phone": "9876543210" }
 *   { "action": "message", "role": "user",  "text": "Hello, I am interested" }
 *   { "action": "message", "role": "ai",    "text": "Great! Tell me more." }
 *   { "action": "end",    "summary": "Customer was interested in 2BHK." }
 *   { "action": "reset" }
 */
import { NextRequest, NextResponse } from "next/server";
import { startCall, addMessage, endCall, resetCall } from "@/lib/callStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, name, phone, role, text, summary } = body;

  switch (action) {
    case "start":
      await startCall("test-call-001", name ?? "Test Caller", phone ?? "9999999999");
      return NextResponse.json({ ok: true, action: "started" });

    case "message":
      await addMessage(role === "ai" ? "ai" : "user", text ?? "Test message");
      return NextResponse.json({ ok: true, action: "message added" });

    case "end":
      await endCall(summary ?? "Test call summary.");
      return NextResponse.json({ ok: true, action: "ended" });

    case "reset":
      await resetCall();
      return NextResponse.json({ ok: true, action: "reset" });

    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
}
