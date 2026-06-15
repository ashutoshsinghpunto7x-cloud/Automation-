"use client";
import { useEffect, useState } from "react";
import { Users, Phone, Clock, Calendar, TrendingUp } from "lucide-react";

interface Stats {
  totalLeads:number; callsToday:number; answered:number; inProgress:number;
  apiErrors:number; visitsBooked:number; interested:number; convRate:string;
}

/* Mini sparkline for conversion rate */
function ConvSparkline() {
  const pts: [number,number][] = [[0,60],[40,55],[80,48],[120,40],[160,32],[200,28],[240,22],[280,30],[300,20]];
  const d = pts.reduce((acc,[x,y],i) => {
    if (i===0) return `M${x} ${y}`;
    const [px,py]=pts[i-1]; const cx=(px+x)/2;
    return `${acc} C${cx} ${py},${cx} ${y},${x} ${y}`;
  },"");
  return (
    <svg viewBox="0 0 300 70" style={{ width:"100%", height:44, display:"block", marginTop:6 }}>
      <defs>
        <linearGradient id="yg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#eab308" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${d} L300 70 L0 70 Z`} fill="url(#yg)"/>
      <path d={d} fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="280" cy="30" r="3.5" fill="#fff" stroke="#eab308" strokeWidth="1.5"/>
    </svg>
  );
}

/* Call volume chart */
function CallVolumeChart() {
  const pts: [number,number][] = [[0,72],[60,60],[120,50],[180,36],[240,54],[300,44]];
  const d = pts.reduce((acc,[x,y],i) => {
    if (i===0) return `M${x} ${y}`;
    const [px,py]=pts[i-1]; const cx=(px+x)/2;
    return `${acc} C${cx} ${py},${cx} ${y},${x} ${y}`;
  },"");
  const MONTHS = ["Feb","Mar","Apr","May","Jun","Jul"];
  return (
    <div>
      <svg viewBox="0 0 300 90" style={{ width:"100%", height:74, display:"block" }}>
        {/* Grid lines */}
        {[0,20,40,60].map(v => {
          const y = 80 - v;
          return (
            <g key={v}>
              <line x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              <text x="-2" y={y+3} fontSize="8" fill="#374151" textAnchor="end">{v}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="cvg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={`${d} L300 80 L0 80 Z`} fill="url(#cvg2)"/>
        <path d={d} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        {/* Jun highlight point */}
        <circle cx="240" cy="54" r="4.5" fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
        {/* Jun label */}
        <rect x="214" y="38" width="52" height="14" rx="4" fill="#181929" stroke="rgba(59,130,246,0.3)" strokeWidth="1"/>
        <text x="240" y="49" textAnchor="middle" fontSize="8" fill="#9ca3af" fontWeight="600">Jun</text>
        {/* 49 Calls label top-right */}
        <text x="298" y="10" textAnchor="end" fontSize="9" fill="#3b82f6" fontWeight="700">49 Calls</text>
      </svg>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        {MONTHS.map(m => (
          <span key={m} style={{ color:m==="Jun"?"#fff":"#374151", fontSize:9, fontWeight:m==="Jun"?600:400, background:m==="Jun"?"var(--bg-inner)":"transparent", padding:m==="Jun"?"1px 5px":"0", borderRadius:4 }}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StatsSidebar() {
  const [stats, setStats] = useState<Stats|null>(null);
  const [conn,  setConn]  = useState<boolean|null>(null);
  const [upd,   setUpd]   = useState("");

  const load = async () => {
    try {
      const res  = await fetch("/api/stats");
      const data = await res.json();
      setConn(data.connected);
      if (data.stats) { setStats(data.stats); setUpd(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})); }
    } catch { setConn(false); }
  };

  useEffect(() => { load(); const t=setInterval(load,30_000); return()=>clearInterval(t); }, []);

  const s = stats;

  const KPI = [
    {
      label:"TOTAL LEADS", value:s?String(s.totalLeads):"--",
      trend:s?`${s.interested} interested`:"", trendUp:false,
      icon:Users, ic:"#3b82f6", ibg:"rgba(59,130,246,0.15)",
    },
    {
      label:"CALLS MADE", value:s?String(s.answered):"--",
      trend:"", trendUp:false,
      icon:Phone, ic:"#22c55e", ibg:"rgba(34,197,94,0.15)",
    },
    {
      label:"PENDING CALLS", value:s?String(s.apiErrors):"--",
      trend:s?`${s.inProgress} in progress`:"", trendUp:false,
      icon:Clock, ic:"#f59e0b", ibg:"rgba(245,158,11,0.15)",
    },
    {
      label:"VISITS BOOKED", value:s?String(s.visitsBooked):"--",
      trend:"", trendUp:false,
      icon:Calendar, ic:"#3b82f6", ibg:"rgba(59,130,246,0.15)",
    },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:0, overflowY:"auto" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ color:"#fff", fontSize:13, fontWeight:700, letterSpacing:"-0.01em" }}>KEY STATISTICS</span>
        <button style={{
          background:"var(--bg-inner)", border:"1px solid var(--border-md)",
          borderRadius:10, padding:"4px 10px",
          display:"flex", alignItems:"center", gap:5,
        }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:conn===true?"#22c55e":conn===false?"#ef4444":"#6b7280", boxShadow:conn===true?"0 0 5px #22c55e":"none" }} />
          <span style={{ color:"var(--text-2)", fontSize:10, fontWeight:500 }}>Today</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 4L5 6.5L7.5 4" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 2x2 KPI grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
        {KPI.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ background:"var(--bg-inner)", border:"1px solid var(--border)", borderRadius:14, padding:"12px 12px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <p style={{ color:"#6b7280", fontSize:9, letterSpacing:"0.08em", fontWeight:700 }}>{k.label}</p>
                <div style={{ width:26, height:26, borderRadius:8, background:k.ibg, border:`1px solid ${k.ic}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={13} color={k.ic} />
                </div>
              </div>
              <p style={{ color:"#fff", fontSize:26, fontWeight:700, lineHeight:1, marginBottom:4 }}>{k.value}</p>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                {k.trendUp && <TrendingUp size={10} color="#22c55e" />}
                <p style={{ color:k.trendUp?"#22c55e":"#6b7280", fontSize:10 }}>{k.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Rate */}
      <div style={{ background:"var(--bg-inner)", border:"1px solid var(--border)", borderRadius:14, padding:"12px 14px", marginBottom:8 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
          <p style={{ color:"#6b7280", fontSize:9, letterSpacing:"0.08em", fontWeight:700 }}>CONVERSION RATE</p>
        </div>
        <p style={{ color:"#eab308", fontSize:30, fontWeight:700, lineHeight:1.1 }}>
          {s ? `${s.convRate}%` : "--"}
        </p>
        <p style={{ color:"#4b5563", fontSize:10, marginTop:2 }}>
          {s ? `${s.visitsBooked} visits from ${s.answered} completed calls` : ""}
        </p>
        <ConvSparkline />
      </div>

      {/* Call Volume */}
      <div style={{ background:"var(--bg-inner)", border:"1px solid var(--border)", borderRadius:14, padding:"12px 14px", flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
          <div>
            <span style={{ color:"var(--text-1)", fontSize:12, fontWeight:700 }}>CALL VOLUME</span>
            <span style={{ color:"#4b5563", fontSize:10, marginLeft:6 }}>(This Month)</span>
          </div>
        </div>
        <CallVolumeChart />
      </div>

      {upd && (
        <p style={{ color:"#374151", fontSize:9, textAlign:"center", marginTop:8 }}>
          Updated {upd} · auto-refreshes every 30s
        </p>
      )}
    </div>
  );
}
