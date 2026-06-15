import { NextRequest, NextResponse } from "next/server";
import { startCall, addMessage, updateAnalysis, endCall } from "@/lib/callStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg  = body?.message ?? body;
    const type = msg?.type ?? msg?.message?.type;

    switch (type) {

      case "call-started":
      case "call.started": {
        const call   = msg?.call ?? msg?.message?.call ?? {};
        const callId = call?.id ?? "";
        const name   = call?.customer?.name ?? call?.callee?.name ?? "";
        const phone  = call?.customer?.number ?? call?.callee?.number ?? "";
        await startCall(callId, name, phone);
        console.log("[Vapi] Call started:", callId, name, phone);
        break;
      }

      case "transcript":
      case "conversation-update": {
        const role = msg?.role ?? msg?.transcript?.role ?? "";
        const text = msg?.transcript ?? msg?.transcript?.transcript ?? msg?.text ?? "";
        if (role && text) {
          await addMessage(
            role === "assistant" || role === "bot" ? "ai" : "user",
            text
          );
        }
        if (msg?.conversation) {
          const arr: { role: string; content: string }[] = msg.conversation;
          for (const m of arr) {
            if (m.content?.trim()) {
              await addMessage(
                m.role === "assistant" || m.role === "bot" ? "ai" : "user",
                m.content
              );
            }
          }
        }
        break;
      }

      case "function-call":
      case "analysis": {
        const a = msg?.analysis ?? msg?.functionCall?.parameters ?? {};
        await updateAnalysis(a?.sentiment, a?.intent, a?.language, a?.noiseLevel);
        break;
      }

      case "end-of-call-report":
      case "call-ended":
      case "call.ended": {
        const report = msg ?? {};
        if (report?.transcript && typeof report.transcript === "string") {
          const lines = report.transcript.split("\n").filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("AI:") || line.startsWith("Agent:") || line.startsWith("Assistant:")) {
              await addMessage("ai", line.replace(/^(AI:|Agent:|Assistant:)\s*/i, "").trim());
            } else if (line.startsWith("User:") || line.startsWith("Customer:")) {
              await addMessage("user", line.replace(/^(User:|Customer:)\s*/i, "").trim());
            }
          }
        }
        const summary  = report?.summary ?? report?.call?.summary ?? "";
        const analysis = report?.analysis ?? {};
        await updateAnalysis(
          analysis?.sentiment,
          analysis?.successEvaluation ?? analysis?.intent,
          "",
          ""
        );
        await endCall(summary);
        console.log("[Vapi] Call ended. Summary:", summary?.slice(0, 100));
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Vapi webhook error]", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Vapi webhook endpoint active" });
}
