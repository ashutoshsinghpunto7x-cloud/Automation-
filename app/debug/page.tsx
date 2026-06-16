"use client";
import { useState, useEffect } from "react";

const CARD: React.CSSProperties = {
  background: "#1E1F25", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14, padding: "18px 20px", marginBottom: 16,
};

const BTN = (color = "#3b82f6"): React.CSSProperties => ({
  background: color, border: "none", borderRadius: 8,
  padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 600,
  cursor: "pointer", marginRight: 8, marginBottom: 8,
});

export default function DebugPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = (msg: string) =>
    setLog(l => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...l.slice(0, 49)]);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/vapi/debug");
      const d = await r.json();
      setState(d);
      append("Debug state refreshed.");
    } catch (e: any) {
      append("ERROR: " + e.message);
    }
    setLoading(false);
  };

  const inject = async (action: string, extra: object = {}) => {
    append(`Injecting: ${action} ...`);
    const r = await fetch("/api/vapi/inject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const d = await r.json();
    append(`Result: ${JSON.stringify(d)}`);
    await refresh();
  };

  useEffect(() => { refresh(); }, []);

  const call = state?.callState;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0e1a", color: "#fff", padding: 24, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Vapi Live Call · Debug Console</h1>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 24 }}>Use this page to test the live call UI without a real Vapi call.</p>

      {/* Controls */}
      <div style={CARD}>
        <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: "0.08em" }}>INJECT TEST EVENTS</p>
        <button style={BTN("#22c55e")} onClick={() => inject("start", { name: "Rahul Verma", phone: "9876543210" })}>
          ▶ Start Call
        </button>
        <button style={BTN("#3b82f6")} onClick={() => inject("message", { role: "user", text: "Hello, I am interested in 2BHK in Lucknow." })}>
          💬 User Message
        </button>
        <button style={BTN("#6366f1")} onClick={() => inject("message", { role: "ai", text: "Great! We have excellent options in Gomti Nagar. What is your budget?" })}>
          🤖 AI Message
        </button>
        <button style={BTN("#f59e0b")} onClick={() => inject("message", { role: "user", text: "Around 60 lakhs." })}>
          💬 User Reply
        </button>
        <button style={BTN("#6366f1")} onClick={() => inject("message", { role: "ai", text: "Perfect. I can schedule a site visit this Saturday. Would that work?" })}>
          🤖 AI Reply
        </button>
        <button style={BTN("#ef4444")} onClick={() => inject("end", { summary: "Customer interested in 2BHK in Gomti Nagar, budget ~60L. Site visit to be scheduled Saturday." })}>
          ⏹ End Call
        </button>
        <button style={BTN("#374151")} onClick={() => inject("reset")}>
          🔄 Reset
        </button>
        <button style={{ ...BTN("#1f2937"), border: "1px solid #374151" }} onClick={refresh}>
          {loading ? "⏳" : "↻"} Refresh State
        </button>
      </div>

      {/* Current call state */}
      <div style={CARD}>
        <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: "0.08em" }}>CURRENT REDIS STATE</p>
        {call ? (
          <div style={{ fontSize: 12, lineHeight: 1.7 }}>
            <Row label="active"      value={String(call.active)}      color={call.active ? "#22c55e" : "#ef4444"} />
            <Row label="callerName"  value={call.callerName  || "(empty)"} />
            <Row label="callerPhone" value={call.callerPhone || "(empty)"} />
            <Row label="callId"      value={call.callId      || "(empty)"} />
            <Row label="messages"    value={`${call.messages?.length ?? 0} stored`} color="#3b82f6" />
            <Row label="summary"     value={call.summary     || "(none)"} />
            <Row label="endedAt"     value={call.endedAt     || "(none)"} />
            <Row label="sentiment"   value={call.sentiment   || "--"} />

            {call.messages?.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ color: "#6b7280", fontSize: 10, marginBottom: 8 }}>MESSAGES IN REDIS:</p>
                {call.messages.map((m: any, i: number) => (
                  <div key={i} style={{ padding: "6px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ color: m.role === "ai" ? "#60a5fa" : "#9ca3af", fontWeight: 700 }}>{m.role}</span>
                    <span style={{ color: "#6b7280", marginLeft: 8, fontSize: 10 }}>{m.time}</span>
                    <p style={{ color: "#d1d5db", marginTop: 2, fontSize: 11 }}>{m.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: "#6b7280" }}>Loading...</p>
        )}
      </div>

      {/* Last webhook payload */}
      {state?.lastWebhookPayload && (
        <div style={CARD}>
          <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: "0.08em" }}>LAST WEBHOOK PAYLOAD RECEIVED</p>
          <p style={{ color: "#f59e0b", fontSize: 10, marginBottom: 8 }}>Received at: {(state.lastWebhookPayload as any)?.receivedAt}</p>
          <pre style={{ color: "#d1d5db", fontSize: 10, overflowX: "auto", whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 8 }}>
            {JSON.stringify((state.lastWebhookPayload as any)?.raw, null, 2)}
          </pre>
        </div>
      )}

      {!state?.lastWebhookPayload && (
        <div style={CARD}>
          <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>LAST WEBHOOK PAYLOAD</p>
          <p style={{ color: "#ef4444", fontSize: 12 }}>No webhook payload received yet.</p>
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 6 }}>
            Make sure Vapi (or n8n) is sending POST requests to:<br/>
            <span style={{ color: "#60a5fa" }}>https://automation-git-main-ashutoshsinghpunto7x-clouds-projects.vercel.app/api/vapi/webhook</span>
          </p>
        </div>
      )}

      {/* Action log */}
      <div style={CARD}>
        <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: "0.08em" }}>ACTION LOG</p>
        {log.length === 0 ? (
          <p style={{ color: "#374151", fontSize: 12 }}>No actions yet.</p>
        ) : (
          log.map((l, i) => (
            <p key={i} style={{ color: i === 0 ? "#d1d5db" : "#4b5563", fontSize: 11, marginBottom: 3 }}>{l}</p>
          ))
        )}
      </div>
    </div>
  );
}

function Row({ label, value, color = "#d1d5db" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", gap: 12, paddingBottom: 4 }}>
      <span style={{ color: "#6b7280", minWidth: 100 }}>{label}:</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}
