import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      ok: false,
      error: "Missing env vars",
      UPSTASH_REDIS_REST_URL: url ? "✅ set" : "❌ MISSING",
      UPSTASH_REDIS_REST_TOKEN: token ? "✅ set" : "❌ MISSING",
    });
  }

  try {
    const redis = Redis.fromEnv();
    await redis.set("vapi:test:ping", "pong", { ex: 60 });
    const val = await redis.get("vapi:test:ping");
    return NextResponse.json({
      ok: true,
      ping: val,
      UPSTASH_REDIS_REST_URL: "✅ set",
      UPSTASH_REDIS_REST_TOKEN: "✅ set",
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      UPSTASH_REDIS_REST_URL: "✅ set",
      UPSTASH_REDIS_REST_TOKEN: "✅ set",
    });
  }
}
