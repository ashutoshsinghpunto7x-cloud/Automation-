"use client";
import { useState, useEffect } from "react";
import LiveCallCard     from "./components/LiveCallCard";
import LiveConversation from "./components/LiveConversation";
import StatsSidebar     from "./components/StatsSidebar";
import {
  PhoneOff, Users, Phone, Megaphone, RotateCcw, Plug, IndianRupee,
  Clock, TrendingUp, ArrowUp,
} from "lucide-react";

interface Stats {
  totalLeads:number; callsToday:number; answered:number; inProgress:number;
  apiErrors:number; visitsBooked:number; interested:number; convRate:string;
}

/* ── Bottom stat cards ── */
function StatCard({ icon: Icon, ic, ibg, label, value, sub, subColor, trend, trendUp }: {
  icon: React.ComponentType<{size?:number;color?:string}>;
  ic:string; ibg:string; label:string; value:string; sub:string;
  subColor?:string; trend?:string; trendUp?:boolean;
}) {
  return (
    <div style={{
      flex:1, background:"var(--bg-card)", border:"1px solid var(--border)",
      borderRadius:16, padding:"14px 16px",
      display:"flex", alignItems:"center", gap:14,
    }}>
      <div style={{
        width:44, height:44, borderRadius:13, background:ibg,
        border:`1px solid ${ic}44`,
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      }}>
        <Icon size={20} color={ic} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color:"#fff", fontSize:22, fontWeight:700, lineHeight:1.1, marginBottom:2 }}>{value}</p>
        <p style={{ color:"#6b7280", fontSize:10, fontWeight:700, letterSpacing:"0.06em" }}>{label}</p>
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
          {trend && (trendUp ? <TrendingUp size={9} color="#22c55e"/> : <ArrowUp size={9} color="#6b7280" style={{transform:"rotate(180deg)"}}/>)}
          <p style={{ color:subColor||"#4b5563", fontSize:10 }}>{sub}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Calls vs Conversions: real summary only ── */
function CallsConvChart({ s }: { s: Stats|null }) {
  return (
    <div style={{ height:80, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
      {s ? (
        <div style={{ display:"flex", gap:24 }}>
          <div style={{ textAlign:"center" }}>
            <p style={{ color:"#3b82f6", fontSize:28, fontWeight:700, lineHeight:1 }}>{s.answered}</p>
            <p style={{ color:"#6b7280", fontSize:10, marginTop:3 }}>Calls Made</p>
          </div>
          <div style={{ width:1, background:"rgba(255,255,255,0.07)", alignSelf:"stretch" }} />
          <div style={{ textAlign:"center" }}>
            <p style={{ color:"#22c55e", fontSize:28, fontWeight:700, lineHeight:1 }}>{s.visitsBooked}</p>
            <p style={{ color:"#6b7280", fontSize:10, marginTop:3 }}>Visits Booked</p>
          </div>
          <div style={{ width:1, background:"rgba(255,255,255,0.07)", alignSelf:"stretch" }} />
          <div style={{ textAlign:"center" }}>
            <p style={{ color:"#f59e0b", fontSize:28, fontWeight:700, lineHeight:1 }}>{s.convRate}%</p>
            <p style={{ color:"#6b7280", fontSize:10, marginTop:3 }}>Conv Rate</p>
          </div>
        </div>
      ) : (
        <p style={{ color:"#374151", fontSize:11 }}>Loading data...</p>
      )}
    </div>
  );
}

/* ── Lead Funnel ── */
function LeadFunnel({ s }: { s: Stats|null }) {
  const total = s?.totalLeads || 49;
  const items = [
    { label:"Leads",      value:s?.totalLeads   ||49, color:"#3b82f6", pct:"100%" },
    { label:"Contacted",  value:s?.answered     ||27, color:"#8b5cf6", pct:null   },
    { label:"Interested", value:s?.interested   ||18, color:"#f59e0b", pct:null   },
    { label:"Booked",     value:s?.visitsBooked || 2, color:"#22c55e", pct:null   },
  ].map(it=>({ ...it, pct: it.pct ?? `${Math.round(it.value/total*100)}%` }));

  return (
    <div style={{ display:"flex", gap:18, alignItems:"center" }}>
      {/* Funnel SVG */}
      <svg viewBox="0 0 90 140" style={{ width:90, height:140, flexShrink:0 }}>
        {items.map(({ color }, i) => {
          const topW=84-i*17; const botW=84-(i+1)*17;
          const y=i*34; const topX=(90-topW)/2; const botX=(90-botW)/2;
          return (
            <path key={i}
              d={`M${topX} ${y} L${topX+topW} ${y} L${botX+botW} ${y+30} L${botX} ${y+30} Z`}
              fill={color} opacity={0.85-i*0.08}
            />
          );
        })}
      </svg>
      {/* Labels */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
        {items.map(({ label, value, color, pct }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:color }} />
              <span style={{ color:"#9ca3af", fontSize:12 }}>{label}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{value}</span>
              <span style={{ color:"#4b5563", fontSize:11 }}>{pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentList() {
  return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#374151", fontSize:11, textAlign:"center" }}>
        No agent data available.<br/>
        <span style={{ fontSize:10, color:"#1f2937" }}>Connect agents via Integrations to track performance.</span>
      </p>
    </div>
  );
}

/* ── Live Call Banner ── */
function LiveBanner({ name, isActive }: { name:string; isActive:boolean }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"9px 16px", marginBottom:10,
      background:isActive?"rgba(34,197,94,0.05)":"rgba(255,255,255,0.02)",
      border:isActive?"1px solid rgba(34,197,94,0.22)":"1px solid var(--border)",
      borderRadius:12,
    }}>
      {/* Left: status dot + title */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div className={isActive?"pulse-dot":""} style={{
          width:9, height:9, borderRadius:"50%",
          background:isActive?"#22c55e":"#374151",
          boxShadow:isActive?"0 0 8px #22c55e, 0 0 16px rgba(34,197,94,0.3)":"none",
        }} />
        <span style={{ color:isActive?"#fff":"#4b5563", fontSize:14, fontWeight:700 }}>
          {isActive?`LIVE CALL – ${name}`:"NO ACTIVE CALL"}
        </span>
      </div>
      {/* Right: timer + end call */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Clock size={14} color={isActive?"#9ca3af":"#374151"} />
          <span style={{ color:isActive?"#9ca3af":"#374151", fontSize:13, fontFamily:"monospace", letterSpacing:"0.05em" }}>
            {isActive?"--:--:--":"--:--:--"}
          </span>
        </div>
        <button style={{
          background:isActive?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",
          border:isActive?"1px solid rgba(239,68,68,0.40)":"1px solid var(--border)",
          borderRadius:9, padding:"6px 16px",
          display:"flex", alignItems:"center", gap:7,
        }}>
          <PhoneOff size={13} color={isActive?"#ef4444":"#374151"} />
          <span style={{ color:isActive?"#ef4444":"#374151", fontSize:12, fontWeight:600 }}>End Call</span>
        </button>
      </div>
    </div>
  );
}

/* ══ Main Page ══ */
export default function OverviewPage() {
  const [stats,  setStats]  = useState<Stats|null>(null);
  const [name,   setName]   = useState("Ashutosh Singh");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sr, lr, vr] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/leads"),
          fetch("/api/vapi/live"),
        ]);
        const [sd, ld, vd] = await Promise.all([sr.json(), lr.json(), vr.json()]);
        if (sd.stats) setStats(sd.stats);

        /* Vapi Redis is source of truth for active call state */
        if (vd.active === true) {
          setActive(true);
          /* prefer sheet lead name, fall back to what Vapi reported */
          const sheetLead = ld.leads?.find((l: Record<string,string>) => {
            const s = (l["Call Status"]||"").toLowerCase();
            return s.includes("in progress") || s==="calling...";
          });
          setName(sheetLead?.["Full Name"] || sheetLead?.["Name"] || vd.callerName || "--");
        } else {
          setActive(false);
          setName("--");
        }
      } catch { /* ignore */ }
    };
    load();
    const t = setInterval(load, 5_000); // poll every 5s
    return ()=>clearInterval(t);
  }, []);

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"12px 16px 16px", display:"flex", flexDirection:"column", gap:12, background:"var(--bg-base)" }}>

      {/* ── ROW 1: Live banner + three panels ── */}
      <div style={{ display:"flex", gap:12 }}>

        {/* Left+Center: banner + caller info + conversation */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
          <LiveBanner name={name} isActive={active} />

          <div style={{ display:"flex", gap:10 }}>
            {/* Caller Info */}
            <div style={{ width:264, flexShrink:0, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"14px 16px" }}>
              <LiveCallCard />
            </div>
            {/* Live Conversation */}
            <div style={{ flex:1, minWidth:0, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"14px 16px", minHeight:390 }}>
              <LiveConversation />
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div style={{ width:264, flexShrink:0, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"14px 16px", maxHeight:520, overflowY:"auto" }}>
          <StatsSidebar />
        </div>
      </div>

      {/* ── ROW 2: Six stat cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
        <StatCard icon={Users}       ic="#3b82f6" ibg="rgba(59,130,246,0.15)"
          label="TOTAL LEADS"   value={stats?.totalLeads !== undefined ? String(stats.totalLeads) : "--"}
          sub={stats ? `${stats.interested} interested` : ""} subColor="#22c55e" />
        <StatCard icon={Phone}       ic="#8b5cf6" ibg="rgba(139,92,246,0.15)"
          label="IN PROGRESS"   value={stats?.inProgress !== undefined ? String(stats.inProgress) : "--"}
          sub="Currently calling" />
        <StatCard icon={Megaphone}   ic="#f59e0b" ibg="rgba(245,158,11,0.15)"
          label="CALLS MADE"    value={stats?.answered !== undefined ? String(stats.answered) : "--"}
          sub={stats ? `${stats.apiErrors} pending` : ""} />
        <StatCard icon={RotateCcw}   ic="#22c55e" ibg="rgba(34,197,94,0.15)"
          label="VISITS BOOKED" value={stats?.visitsBooked !== undefined ? String(stats.visitsBooked) : "--"}
          sub={stats ? `${stats.convRate}% conv rate` : ""} subColor="#22c55e" />
        <StatCard icon={Plug}        ic="#3b82f6" ibg="rgba(59,130,246,0.15)"
          label="INTERESTED"    value={stats?.interested !== undefined ? String(stats.interested) : "--"}
          sub="From calls" />
        <StatCard icon={IndianRupee} ic="#f59e0b" ibg="rgba(245,158,11,0.15)"
          label="API ERRORS"    value={stats?.apiErrors !== undefined ? String(stats.apiErrors) : "--"}
          sub="Need retry" />
      </div>

      {/* ── ROW 3: Three charts ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>

        {/* Calls vs Conversions */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>CALLS VS CONVERSIONS</span>
            <span style={{ color:"#6b7280", fontSize:10, background:"var(--bg-inner)", border:"1px solid var(--border)", borderRadius:7, padding:"3px 9px" }}>This Month ▾</span>
          </div>
          <div style={{ display:"flex", gap:14, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#3b82f6" }} />
              <span style={{ color:"#6b7280", fontSize:10 }}>Calls</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e" }} />
              <span style={{ color:"#6b7280", fontSize:10 }}>Conversions</span>
            </div>
          </div>
          <CallsConvChart s={stats} />
        </div>

        {/* Lead Funnel */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>LEAD FUNNEL</span>
            <RotateCcw size={13} color="#4b5563" />
          </div>
          <LeadFunnel s={stats} />
        </div>

        {/* Agent Performance */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>AGENT PERFORMANCE</span>
            <span style={{ color:"#6b7280", fontSize:10, background:"var(--bg-inner)", border:"1px solid var(--border)", borderRadius:7, padding:"3px 9px" }}>This Month ▾</span>
          </div>
          <AgentList />
        </div>

      </div>
    </div>
  );
}
