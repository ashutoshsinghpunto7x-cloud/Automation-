import { NextResponse } from "next/server";
import { getCall } from "@/lib/callStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const call = getCall();
  return NextResponse.json(call);
}
