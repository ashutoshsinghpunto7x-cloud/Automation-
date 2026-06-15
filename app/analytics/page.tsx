"use client";
import { useEffect, useState, useMemo } from "react";
import { RefreshCw, TrendingUp, Users, Phone, Calendar } from "lucide-react";

interface Stats {
  totalLeads: number; callsToday: number; totalAttempted: number;
  answered: number; inProgress: number; apiErrors: number;
  successRate: number; hotLeads: number; warmLeads: number;
  coldLeads: number; visitsBooked: number; interested: number; convRate: string;
}

interface Lead {
  "Preferred Location": string;
  "Property Type": string;
  "Budget Range": string;
  "Call Status": string;
  "Visit Scheduled": string;
  Sentiment: string;
  Intrested: string;
  Timestamp: string;
}

// Simple bar chart
function BarChart({ data, color = "#3b82f6", maxLabel = "" }: { data: { label: string; value: number }[]; color?: string; maxLabel?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map(d => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--text-3)", fontSize: 11, width: 120, flexShrink: 0, textAlign: "right" }}>{d.label}</span>
          <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(d.value / max) * 100}%`,
              background: color,
              borderRadius: 4,
              transition: "width 0.6s ease",
              minWidth: d.value > 0 ? 4 : 0,
            }}/>
          </div>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, width: 24, textAlign: "right" }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart via SVG
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return <p style={{ color: "var(--text-3)", fontSize: 12, textAlign: "center" }}>No data yet</p>;

  const r = 50; const cx = 60; const cy = 60; const stroke = 14;
  let offset = 0;
  const circ = 2 * Math.PI * r;

  const arcs = segments.map(s => {
    const pct  = s.value / total;
    const dash = pct * circ;
    const gap  = circ - dash;
    const arc  = { ...s, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        {arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth={stroke}
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={-a.offset + circ * 0.25}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="var(--text-3)">TOTAL</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }}/>
            <span style={{ color: "var(--text-2)", fontSize: 11 }}>{s.label}</span>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, marginLeft: "auto" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Funnel
function Funnel({ steps }: { steps: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...steps.map(s => s.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {steps.map((s, i) => (
        <div key={s.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "var(--text-2)", fontSize: 12 }}>{s.label}</span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{s.value}</span>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(s.value/max)*100}%`, background: s.color, borderRadius: 5, transition: "width 0.6s ease" }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ title, children, style = {} }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px", ...style }}>
      <p style={{ color: "var(--text-2)", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [leads, setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUp, setLastUp]   = useState("");

  const fetchData = async () => {
    try {
      const [sr, lr] = await Promise.all([fetch("/api/stats"), fetch("/api/leads")]);
      const sd = await sr.json();
      const ld = await lr.json();
      if (sd.stats) setStats(sd.stats);
      if (ld.leads) setLeads(ld.leads);
      setLastUp(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30_000); return () => clearInterval(t); }, []);

  // ── Derived charts ────────────────────────────────────────────────────
  const locationData = useMemo(() => {
    const map: Record<string,number> = {};
    leads.forEach(l => { const k = l["Preferred Location"] || "Unknown"; map[k] = (map[k]||0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([label,value])=>({label,value}));
  }, [leads]);

  const propertyData = useMemo(() => {
    const map: Record<string,number> = {};
    leads.forEach(l => { const k = l["Property Type"] || "Unknown"; map[k] = (map[k]||0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value}));
  }, [leads]);

  const budgetData = useMemo(() => {
    const map: Record<string,number> = {};
    leads.forEach(l => { const k = l["Budget Range"] || "Not Specified"; map[k] = (map[k]||0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label,value}));
  }, [leads]);

  const sentimentData = useMemo(() => {
    const map: Record<string,number> = {};
    leads.forEach(l => { if (l.Sentiment) { const k=l.Sentiment; map[k]=(map[k]||0)+1; }});
    const colors = ["#4ade80","#60a5fa","#fbbf24","#f87171","#a78bfa","#fb923c"];
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([label,value],i)=>({label,value,color:colors[i%colors.length]}));
  }, [leads]);

  const s = stats;

  const funnelSteps = [
    { label: "Total Leads",     value: s?.totalLeads  ?? 0, color: "#3b82f6"  },
    { label: "Calls Attempted", value: (s?.answered ?? 0) + (s?.inProgress ?? 0), color: "#60a5fa" },
    { label: "Calls Answered",  value: s?.answered    ?? 0, color: "#4ade80"  },
    { label: "Interested",      value: s?.interested  ?? 0, color: "#fbbf24"  },
    { label: "Visits Booked",   value: s?.visitsBooked ?? 0, color: "#f59e0b" },
  ];

  const callStatusSegs = [
    { label: "Answered",    value: s?.answered    ?? 0, color: "#4ade80" },
    { label: "In Progress", value: s?.inProgress  ?? 0, color: "#60a5fa" },
    { label: "Pending",     value: s?.apiErrors   ?? 0, color: "#fbbf24" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Analytics</h1>
            <p style={{ color: "var(--text-3)", fontSize: 12 }}>{lastUp ? `Updated ${lastUp}` : "Loading..."} · auto-refreshes every 30s</p>
          </div>
          <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", color: "var(--text-2)", fontSize: 12 }}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>
        {loading && <p style={{ color: "var(--text-3)", textAlign: "center", marginTop: 60 }}>Loading analytics...</p>}

        {!loading && (
          <>
            {/* Top KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "TOTAL LEADS",      value: s?.totalLeads   ?? 0, color: "#fff",    sub: "in pipeline"         },
                { label: "CALL SUCCESS RATE", value: `${s?.convRate ?? 0}%`, color: "#4ade80", sub: "visits / answered"  },
                { label: "INTERESTED",        value: s?.interested   ?? 0, color: "#fbbf24", sub: "from calls"          },
                { label: "VISITS BOOKED",     value: s?.visitsBooked ?? 0, color: "#60a5fa", sub: "site visits"         },
              ].map(c => (
                <div key={c.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px" }}>
                  <p style={{ color: "var(--text-3)", fontSize: 9, letterSpacing: "0.07em", fontWeight: 600, marginBottom: 8 }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: 26, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{c.value}</p>
                  <p style={{ color: "var(--text-3)", fontSize: 10 }}>{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Row 1: Funnel + Call Donut */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Card title="Lead Conversion Funnel">
                <Funnel steps={funnelSteps}/>
              </Card>
              <Card title="Call Status Breakdown">
                <DonutChart segments={callStatusSegs}/>
              </Card>
            </div>

            {/* Row 2: Location + Budget */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Card title="Top Preferred Locations">
                {locationData.length > 0
                  ? <BarChart data={locationData} color="#3b82f6"/>
                  : <p style={{ color: "var(--text-3)", fontSize: 12 }}>No location data yet</p>}
              </Card>
              <Card title="Budget Range Distribution">
                {budgetData.length > 0
                  ? <BarChart data={budgetData} color="#a78bfa"/>
                  : <p style={{ color: "var(--text-3)", fontSize: 12 }}>No budget data yet</p>}
              </Card>
            </div>

            {/* Row 3: Property type + Sentiment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card title="Property Type Enquiries">
                {propertyData.length > 0
                  ? <BarChart data={propertyData} color="#4ade80"/>
                  : <p style={{ color: "var(--text-3)", fontSize: 12 }}>No property data yet</p>}
              </Card>
              <Card title="Caller Sentiment">
                {sentimentData.length > 0
                  ? <DonutChart segments={sentimentData}/>
                  : <p style={{ color: "var(--text-3)", fontSize: 12 }}>Sentiment data will appear after calls</p>}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
