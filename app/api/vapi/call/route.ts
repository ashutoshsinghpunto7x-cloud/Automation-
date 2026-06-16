/**
 * POST /api/vapi/call
 * Initiates an outbound Vapi call to a customer.
 * Required env vars: VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const apiKey       = process.env.VAPI_API_KEY;
    const assistantId  = process.env.VAPI_ASSISTANT_ID;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

    if (!apiKey || !assistantId || !phoneNumberId) {
      return NextResponse.json(
        { error: "Missing VAPI_API_KEY, VAPI_ASSISTANT_ID, or VAPI_PHONE_NUMBER_ID in environment variables." },
        { status: 500 }
      );
    }

    /* Format phone — add +91 if bare Indian number */
    const formatted = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    const vapiRes = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId,
        phoneNumberId,
        customer: {
          number: formatted,
          ...(name ? { name } : {}),
        },
      }),
    });

    const data = await vapiRes.json();

    if (!vapiRes.ok) {
      console.error("[Vapi call] Error:", data);
      return NextResponse.json({ error: data?.message ?? "Vapi call failed" }, { status: vapiRes.status });
    }

    console.log("[Vapi call] Initiated:", data?.id, formatted);
    return NextResponse.json({ callId: data?.id, status: data?.status });

  } catch (err: any) {
    console.error("[Vapi call] Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
