import { NextRequest, NextResponse } from "next/server";
import { startCall, addMessage, updateAnalysis, endCall } from "@/lib/callStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    console.log("[Vapi] Raw payload:", JSON.stringify(rawBody).slice(0, 300));

    /* n8n wraps Vapi payload as { body: {...}, headers: {...}, ... }
       Direct Vapi sends { message: {...} } directly */
    const body = rawBody?.body ?? rawBody;
    const msg  = body?.message ?? body;
    const type = msg?.type ?? msg?.message?.type;
    console.log("[Vapi] Resolved type:", type);

    switch (type) {

      case "call-started":
      case "call.started": {
        const callObj = msg?.call ?? msg?.message?.call ?? msg ?? {};
        const callId  = callObj?.id ?? "";
        const cust    = callObj?.customer ?? callObj?.callee ?? {};
        const name    = cust?.name ?? cust?.fullName ?? "";
        const phone   = cust?.number ?? cust?.phoneNumber ?? "";
        await startCall(callId, name, phone);
        console.log("[Vapi] Call started:", callId, name, phone);
        break;
      }

      case "transcript": {
        /* skip partial transcripts — only store final utterances */
        if (msg?.transcriptType === "partial") break;
        const role = msg?.role ?? "";
        const text = (typeof msg?.transcript === "string" ? msg.transcript : "") || msg?.text || "";
        if (role && text.trim()) {
          await addMessage(
            role === "assistant" || role === "bot" ? "ai" : "user",
            text.trim()
          );
          console.log("[Vapi] transcript stored:", role, text.slice(0, 60));
        }
        break;
      }

      case "conversation-update": {
        /* conversation-update sends the full conversation array — sync only the
           last message to avoid duplicating everything on each event */
        const arr: { role: string; message: string; content?: string }[] = msg?.conversation ?? [];
        const last = arr[arr.length - 1];
        if (last) {
          const text = last.message ?? last.content ?? "";
          if (text.trim()) {
            await addMessage(
              last.role === "assistant" || last.role === "bot" ? "ai" : "user",
              text.trim()
            );
            console.log("[Vapi] conversation-update last msg:", last.role, text.slice(0, 60));
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
