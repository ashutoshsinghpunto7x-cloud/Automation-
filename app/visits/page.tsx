"use client";
import { useEffect, useState, useMemo } from "react";
import { Calendar, MapPin, Phone, RefreshCw, Clock } from "lucide-react";

interface Lead {
  _rowIndex: string;
  Timestamp: string;
  "Full Name": string;
  "Phone Number": string;
  "Preferred Location": string;
  "Budget Range": string;
  "Property Type": string;
  "Call Status": string;
  "Visit Scheduled": string;
  "Visit Date": string;
  "Call Summary": string;
  Sentiment: string;
  "Buying Intent": string;
  "Key Insights": string;
  Intrested: string;
}

function Tag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function parseVisitDate(raw: string): Date | null {
  if (!raw) return null;
  // try DD/MM/YYYY
  const parts = raw.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`);
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(raw: string) {
  const d = parseVisitDate(raw);
  if (!d) return raw || "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isUpcoming(raw: string) {
  const d = parseVisitDate(raw);
  if (!d) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return d >= today;
}

function isThisWeek(raw: string) {
  const d = parseVisitDate(raw);
  if (!d) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const week  = new Date(today); week.setDate(today.getDate() + 7);
  return d >= today && d <= week;
}

export default function VisitsPage() {
  const [leads, setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUp, setLastUp]   = useState("");
  const [tab, setTab]         = useState<"all"|"upcoming"|"past">("all");

  const fetchLeads = async () => {
    try {
      const res  = await fetch("/api/leads");
      const data = await res.json();
      if (data.leads) {
        const visits = (data.leads as Lead[]).filter(l => l["Visit Scheduled"]?.toUpperCase() === "TRUE");
        setLeads(visits);
        setLastUp(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); const t = setInterval(fetchLeads, 30_000); return () => clearInterval(t); }, []);

  const filtered = useMemo(() => {
    let list = [...leads];
    if (tab === "upcoming") list = list.filter(l => isUpcoming(l["Visit Date"]));
    if (tab === "past")     list = list.filter(l => !isUpcoming(l["Visit Date"]));
    list.sort((a,b) => {
      const da = parseVisitDate(a["Visit Date"])?.getTime() ?? 0;
      const db = parseVisitDate(b["Visit Date"])?.getTime() ?? 0;
      return tab === "past" ? db - da : da - db;
    });
    return list;
  }, [leads, tab]);

  const upcoming  = leads.filter(l => isUpcoming(l["Visit Date"])).length;
  const thisWeek  = leads.filter(l => isThisWeek(l["Visit Date"])).length;
  const past      = leads.filter(l => !isUpcoming(l["Visit Date"])).length;

  const TABS = [
    { key: "all",      label: `All (${leads.length})`      },
    { key: "upcoming", label: `Upcoming (${upcoming})`     },
    { key: "past",     label: `Past (${past})`             },
  ] as const;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Site Visits</h1>
            <p style={{ color: "var(--text-3)", fontSize: 12 }}>
              {lastUp ? `Updated ${lastUp}` : "Loading..."} · auto-refreshes every 30s
            </p>
          </div>
          <button onClick={fetchLeads} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", color: "var(--text-2)", fontSize: 12 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "TOTAL VISITS",   value: leads.length, color: "#fff",    icon: <Calendar size={16} color="#3b82f6"/> },
            { label: "UPCOMING",       value: upcoming,     color: "#60a5fa", icon: <Clock size={16} color="#60a5fa"/>    },
            { label: "THIS WEEK",      value: thisWeek,     color: "#4ade80", icon: <Calendar size={16} color="#4ade80"/> },
            { label: "COMPLETED",      value: past,         color: "#a78bfa", icon: <Calendar size={16} color="#a78bfa"/> },
          ].map(c => (
            <div key={c.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ color: "var(--text-3)", fontSize: 9, letterSpacing: "0.07em", fontWeight: 600, marginBottom: 8 }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{c.value}</p>
                </div>
                <div style={{ background: "var(--bg-inner)", borderRadius: 10, padding: 8 }}>{c.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 500,
              background: tab === t.key ? "var(--blue-dim)" : "var(--bg-card)",
              border: `1px solid ${tab === t.key ? "rgba(59,130,246,0.4)" : "var(--border)"}`,
              color: tab === t.key ? "#60a5fa" : "var(--text-3)",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        {loading && <p style={{ color: "var(--text-3)", textAlign: "center", marginTop: 60 }}>Loading visits...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
            <Calendar size={32} color="var(--text-3)" />
            <p style={{ color: "var(--text-3)", fontSize: 13 }}>No visits in this category</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}>
          {!loading && filtered.map((lead, i) => {
            const upcoming = isUpcoming(lead["Visit Date"]);
            return (
              <div key={lead._rowIndex} style={{ background: "var(--bg-card)", border: `1px solid ${upcoming ? "rgba(59,130,246,0.3)" : "var(--border)"}`, borderRadius: 16, padding: "18px", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{lead["Full Name"] || "—"}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                      <Phone size={11} color="var(--text-3)" />
                      <p style={{ color: "var(--text-3)", fontSize: 12 }}>{lead["Phone Number"] || "—"}</p>
                    </div>
                  </div>
                  <Tag
                    label={upcoming ? "Upcoming" : "Completed"}
                    color={upcoming ? "#60a5fa" : "#a78bfa"}
                    bg={upcoming ? "rgba(59,130,246,0.12)" : "rgba(167,139,250,0.12)"}
                  />
                </div>

                <div style={{ height: 1, background: "var(--border)" }} />

                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Detail icon={<Calendar size={12} color="#60a5fa"/>} label="Visit Date"    value={formatDate(lead["Visit Date"])} />
                  <Detail icon={<MapPin   size={12} color="#4ade80"/>} label="Location"     value={lead["Preferred Location"] || "—"} />
                  <Detail icon={<span style={{ fontSize: 12 }}>🏠</span>}  label="Property"     value={lead["Property Type"] || "—"} />
                  <Detail icon={<span style={{ fontSize: 12 }}>💰</span>}  label="Budget"       value={lead["Budget Range"] || "—"} />
                </div>

                {/* Summary */}
                {lead["Call Summary"] && (
                  <div style={{ background: "var(--bg-inner)", borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ color: "var(--text-3)", fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>CALL SUMMARY</p>
                    <p style={{ color: "var(--text-2)", fontSize: 11, lineHeight: 1.6 }}>
                      {lead["Call Summary"].length > 160 ? lead["Call Summary"].slice(0,160) + "…" : lead["Call Summary"]}
                    </p>
                  </div>
                )}

                {/* Sentiment + intent row */}
                {(lead.Sentiment || lead["Buying Intent"]) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {lead.Sentiment && (
                      <span style={{ background: "var(--bg-inner)", border: "1px solid var(--border)", borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "var(--text-2)" }}>
                        😊 {lead.Sentiment}
                      </span>
                    )}
                    {lead["Buying Intent"] && (
                      <span style={{ background: "var(--bg-inner)", border: "1px solid var(--border)", borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "var(--text-2)" }}>
                        🎯 {lead["Buying Intent"]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && filtered.length > 0 && (
          <p style={{ color: "var(--text-3)", fontSize: 11, textAlign: "center", marginTop: 20 }}>
            Showing {filtered.length} visit{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
        {icon}
        <p style={{ color: "var(--text-3)", fontSize: 9, fontWeight: 600, letterSpacing: "0.05em" }}>{label.toUpperCase()}</p>
      </div>
      <p style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>{value}</p>
    </div>
  );
}
