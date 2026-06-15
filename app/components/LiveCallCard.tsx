"use client";
import { useState, useEffect } from "react";
import { Phone, Home, MapPin, Globe, PhoneCall, Star, PhoneOutgoing } from "lucide-react";

interface Lead { [key: string]: string; }

function detectStatus(lead: Lead): "in-progress" | "calling" | null {
  const s = (lead["Call Status"] || "").toLowerCase();
  if (s.includes("in progress")) return "in-progress";
  if (s === "calling...") return "calling";
  return null;
}

function SpeakBars() {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2 }}>
      {[0,1,2,3,4].map(i => <div key={i} className="speak-bar" style={{ height:6 }} />)}
    </div>
  );
}

/* Mini area sparkline for AI Confidence */
function ConfSparkline() {
  const pts: [number,number][] = [[0,30],[30,22],[60,28],[90,18],[120,24],[150,15],[180,20],[210,12],[240,18]];
  const d = pts.reduce((acc,[x,y],i) => {
    if (i===0) return `M${x} ${y}`;
    const [px,py]=pts[i-1]; const cx=(px+x)/2;
    return `${acc} C${cx} ${py},${cx} ${y},${x} ${y}`;
  },"");
  return (
    <svg viewBox="0 0 240 36" style={{ width:"100%", height:28, display:"block", marginTop:6 }}>
      <defs>
        <linearGradient id="csg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${d} L240 36 L0 36 Z`} fill="url(#csg)"/>
      <path d={d} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="240" cy="18" r="3" fill="#3b82f6"/>
    </svg>
  );
}

function LeadScoreRing({ score }: { score: number }) {
  const r = 16; const c = 2 * Math.PI * r;
  const pct = Math.min(score, 100) / 100;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <svg width="44" height="44" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5"/>
        <circle cx="22" cy="22" r={r} fill="none"
          stroke={color} strokeWidth="3.5"
          strokeDasharray={c} strokeDashoffset={c*(1-pct)}
          strokeLinecap="round"
        />
      </svg>
      <div>
        <div style={{ color:"#fff", fontSize:18, fontWeight:700, lineHeight:1 }}>{score}</div>
        <div style={{ color:"#6b7280", fontSize:9 }}>/100</div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueColor="#9ca3af", extra }: {
  icon: React.ComponentType<{size?:number;color?:string}>;
  label: string; value: string; valueColor?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ flexShrink:0, display:"flex" }}><Icon size={13} color="#4b5563" /></div>
      <span style={{ color:"#6b7280", fontSize:11, marginLeft:8, flex:1 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ color:valueColor, fontSize:11, fontWeight:500 }}>{value}</span>
        {extra}
      </div>
    </div>
  );
}

export default function LiveCallCard() {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [loading, setLoading]       = useState(true);
  const [lastFetch, setLastFetch]   = useState("");

  const fetchLive = async () => {
    try {
      const res  = await fetch("/api/leads");
      const data = await res.json();
      if (data.leads && Array.isArray(data.leads)) {
        const found = data.leads.find((l: Lead) => detectStatus(l) !== null) ?? null;
        setActiveLead(found);
      }
      setLastFetch(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    } catch { /* keep prev */ }
    finally   { setLoading(false); }
  };

  useEffect(() => {
    fetchLive();
    const t = setInterval(fetchLive, 15_000);
    return () => clearInterval(t);
  }, []);

  const isActive = activeLead !== null;
  const name     = activeLead?.["Full Name"] || activeLead?.["Name"] || "Ashutosh Singh";
  const phone    = activeLead?.["Phone Number"] || activeLead?.["Phone"] || "9219583594";
  const property = activeLead?.["Property Type"] || activeLead?.["Property"] || "Residential";
  const location = activeLead?.["Location"] || activeLead?.["City"] || "Shalimar City, Bhopal";
  const source   = activeLead?.["Lead Source"] || activeLead?.["Source"] || "Facebook Ad";
  const callSt   = activeLead?.["Call Status"] || "In Progress";
  const initials = name.split(" ").filter(Boolean).slice(0,2).map((w:string)=>w[0]).join("").toUpperCase()||"AS";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ color:"#6b7280", fontSize:10, fontWeight:700, letterSpacing:"0.09em" }}>CALLER INFO</span>
        <button style={{
          background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)",
          borderRadius:6, padding:"3px 10px",
          color:"#60a5fa", fontSize:10, fontWeight:600,
        }}>Transcript</button>
      </div>

      {/* Avatar card */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:12, border:"1px solid var(--border)", marginBottom:12 }}>
        <div style={{
          width:46, height:46, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#2563eb,#4f46e5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 18px rgba(59,130,246,0.35)",
        }}>
          <span style={{ color:"#fff", fontSize:16, fontWeight:700 }}>{loading?"?":initials}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:"#fff", fontSize:14, fontWeight:600, lineHeight:1.3, marginBottom:4 }}>
            {loading ? "Loading..." : name}
          </p>
          {isActive ? (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div className="pulse-dot" style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e" }} />
              <span style={{ color:"#22c55e", fontSize:11, fontWeight:600 }}>Speaking</span>
              <SpeakBars />
            </div>
          ) : (
            <span style={{ color:"#4b5563", fontSize:11 }}>No active call</span>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div style={{ flex:1 }}>
        <InfoRow icon={Phone}     label="Phone"       value={phone}
          extra={<PhoneOutgoing size={11} color="#4b5563" />} />
        <InfoRow icon={Home}      label="Property"    value={property} />
        <InfoRow icon={MapPin}    label="Location"    value={location} />
        <InfoRow icon={Globe}     label="Lead Source" value={source} />
        <InfoRow icon={PhoneCall} label="Call Status" value={callSt}
          valueColor={isActive?"#22c55e":"#6b7280"} />
        <div style={{ display:"flex", alignItems:"center", padding:"8px 0" }}>
          <Star size={13} color="#4b5563" style={{ flexShrink:0 }} />
          <span style={{ color:"#6b7280", fontSize:11, marginLeft:8, flex:1 }}>Lead Score</span>
          <LeadScoreRing score={isActive?78:0} />
        </div>
      </div>

      {/* AI Confidence */}
      <div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:10, padding:"10px 12px", marginTop:6 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#6b7280", fontSize:10, fontWeight:600, letterSpacing:"0.05em" }}>AI Confidence</span>
          <span style={{ color:"#fff", fontSize:18, fontWeight:700 }}>{isActive?"92%":"--"}</span>
        </div>
        {isActive && <ConfSparkline />}
      </div>

      {lastFetch && (
        <p style={{ color:"#374151", fontSize:9, textAlign:"right", marginTop:5 }}>Synced {lastFetch}</p>
      )}
    </div>
  );
}
