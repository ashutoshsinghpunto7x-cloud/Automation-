"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle, ExternalLink, Copy, ChevronRight } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function Row({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
      <div>
        <p style={{ color: "var(--text-1)", fontSize: 13 }}>{label}</p>
        {sub && <p style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>{sub}</p>}
      </div>
      <div>{right}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none",
        background: value ? "#3b82f6" : "#374151",
        position: "relative", transition: "background 0.2s", cursor: "pointer",
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s",
      }}/>
    </button>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {ok
        ? <CheckCircle size={14} color="#4ade80"/>
        : <AlertCircle size={14} color="#f87171"/>}
      <span style={{ color: ok ? "#4ade80" : "#f87171", fontSize: 12, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export default function SettingsPage() {
  const [notifVisit, setNotifVisit]     = useState(true);
  const [notifCall, setNotifCall]       = useState(false);
  const [autoRefresh, setAutoRefresh]   = useState(true);
  const [copied, setCopied]             = useState(false);

  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID ?? "";
  const sheetName = process.env.NEXT_PUBLIC_SHEET_NAME ?? "Form responses 5";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 40px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Settings</h1>
          <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>Dashboard configuration for Shalimar Developers</p>
        </div>

        {/* Data source */}
        <Section title="Data Source — Google Sheets">
          <Row
            label="Connection Status"
            sub="Live data from n8n automation"
            right={<StatusPill ok={true} label="Connected"/>}
          />
          <Row
            label="Sheet Name"
            sub={sheetName}
            right={
              <span style={{ background: "var(--bg-inner)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px", color: "var(--text-2)", fontSize: 11, fontFamily: "monospace" }}>
                {sheetName}
              </span>
            }
          />
          <Row
            label="Spreadsheet ID"
            sub="Used by API routes to fetch data"
            right={
              <button
                onClick={() => handleCopy(sheetId)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--bg-inner)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", color: copied ? "#4ade80" : "var(--text-2)", fontSize: 11 }}
              >
                <Copy size={11}/> {copied ? "Copied!" : "Copy ID"}
              </button>
            }
          />
          <Row
            label="Auto-refresh Interval"
            sub="Dashboard polls for new data automatically"
            right={
              <span style={{ color: "var(--text-2)", fontSize: 12 }}>Every 30 seconds</span>
            }
          />
          <div style={{ padding: "14px 20px" }}>
            <a
              href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#60a5fa", fontSize: 12, textDecoration: "none" }}
            >
              <ExternalLink size={12}/> Open Google Sheet
            </a>
          </div>
        </Section>

        {/* Automation */}
        <Section title="n8n Automation">
          <Row
            label="Automation Status"
            sub="Google Form → Vapi call → Sheet → Dashboard"
            right={<StatusPill ok={true} label="Active"/>}
          />
          <Row
            label="Trigger"
            sub="New Google Form submission"
            right={<span style={{ color: "var(--text-2)", fontSize: 12 }}>Google Sheets Trigger</span>}
          />
          <Row
            label="AI Calling"
            sub="Vapi voice agent makes outbound calls"
            right={<StatusPill ok={true} label="Enabled"/>}
          />
          <Row
            label="AI Scoring"
            sub="OpenAI scores leads after each call"
            right={<StatusPill ok={true} label="Enabled"/>}
          />
          <div style={{ padding: "14px 20px" }}>
            <p style={{ color: "var(--text-3)", fontSize: 11, lineHeight: 1.6 }}>
              To modify the automation workflow, log in to your n8n instance and open the <strong style={{ color: "var(--text-2)" }}>Shalimar Real Estate AI Caller</strong> workflow.
            </p>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row
            label="Visit Booked Alert"
            sub="Show notification when a lead books a site visit"
            right={<Toggle value={notifVisit} onChange={setNotifVisit}/>}
          />
          <Row
            label="Call Completed Alert"
            sub="Notify when AI agent finishes a call"
            right={<Toggle value={notifCall} onChange={setNotifCall}/>}
          />
          <Row
            label="Auto-refresh"
            sub="Automatically update dashboard data every 30s"
            right={<Toggle value={autoRefresh} onChange={setAutoRefresh}/>}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <Row
            label="Dashboard"
            sub="VoxCall AI Calling Dashboard"
            right={<span style={{ color: "var(--text-3)", fontSize: 12 }}>v1.0.0</span>}
          />
          <Row
            label="Client"
            sub="Lucknow, Uttar Pradesh"
            right={<span style={{ color: "var(--text-2)", fontSize: 12 }}>Shalimar Developers</span>}
          />
          <Row
            label="Built by"
            sub="Powered by Next.js · Supabase · Vapi · n8n"
            right={<span style={{ color: "var(--text-3)", fontSize: 12 }}>Ekansh Saxena</span>}
          />
        </Section>
      </div>
    </div>
  );
}
