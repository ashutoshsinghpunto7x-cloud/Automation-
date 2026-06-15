import { NextRequest, NextResponse } from "next/server";
import { startCall, addMessage, updateAnalysis, endCall } from "@/lib/callStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg  = body?.message ?? body; // Vapi wraps in { message: {...} }

    const type = msg?.type ?? msg?.message?.type;

    switch (type) {

      /* ── Call started ── */
      case "call-started":
      case "call.started": {
        const call   = msg?.call ?? msg?.message?.call ?? {};
        const callId = call?.id ?? "";
        const name   = call?.customer?.name ?? call?.callee?.name ?? "";
        const phone  = call?.customer?.number ?? call?.callee?.number ?? "";
        startCall(callId, name, phone);
        console.log("[Vapi] Call started:", callId, name, phone);
        break;
      }

      /* ── Live transcript chunks ── */
      case "transcript":
      case "conversation-update": {
        const role = msg?.role ?? msg?.transcript?.role ?? "";
        const text = msg?.transcript ?? msg?.transcript?.transcript ?? msg?.text ?? "";
        if (role && text) {
          addMessage(role === "assistant" || role === "bot" ? "assistant" : "user", text);
        }
        /* Also handle conversation-update which gives full array */
        if (msg?.conversation) {
          const arr: { role:string; content:string }[] = msg.conversation;
          arr.forEach(m => {
            if (m.content?.trim()) addMessage(
              m.role === "assistant" || m.role === "bot" ? "assistant" : "user",
              m.content
            );
          });
        }
        break;
      }

      /* ── Analysis updates (sentiment etc.) ── */
      case "function-call":
      case "analysis": {
        const a = msg?.analysis ?? msg?.functionCall?.parameters ?? {};
        updateAnalysis(a?.sentiment, a?.intent, a?.language, a?.noiseLevel);
        break;
      }

      /* ── End of call report ── */
      case "end-of-call-report":
      case "call-ended":
      case "call.ended": {
        const report = msg ?? {};
        /* Final transcript from full array */
        if (report?.transcript && typeof report.transcript === "string") {
          /* parse "Agent: ... \nUser: ..." lines */
          const lines = report.transcript.split("\n").filter(Boolean);
          lines.forEach((line: string) => {
            if (line.startsWith("AI:") || line.startsWith("Agent:") || line.startsWith("Assistant:")) {
              addMessage("assistant", line.replace(/^(AI:|Agent:|Assistant:)\s*/i, "").trim());
            } else if (line.startsWith("User:") || line.startsWith("Customer:")) {
              addMessage("user", line.replace(/^(User:|Customer:)\s*/i, "").trim());
            }
          });
        }
        /* Summary */
        const summary = report?.summary ?? report?.call?.summary ?? "";
        endCall(summary);
        /* Update analysis */
        const analysis = report?.analysis ?? {};
        updateAnalysis(
          analysis?.sentiment,
          analysis?.successEvaluation ?? analysis?.intent,
          "",
          ""
        );
        console.log("[Vapi] Call ended. Summary:", summary?.slice(0, 100));
        break;
      }

      default:
        /* Ignore heartbeat, status-update, etc. */
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Vapi webhook error]", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

/* Vapi sends a GET to verify the endpoint exists */
export async function GET() {
  return NextResponse.json({ status: "Vapi webhook endpoint active" });
}
