"use client";
import { useState, useEffect } from "react";
import LiveCallCard     from "./components/LiveCallCard";
import LiveConversation from "./components/LiveConversation";
import StatsSidebar     from "./components/StatsSidebar";
import {
  PhoneOff, Users, Phone, Megaphone, RotateCcw, Plug, IndianRupee,
  Clock, TrendingUp, TrendingDown, ArrowUp,
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

/* ── Calls vs Conversions chart ── */
function CallsConvChart() {
  const W=400; const H=80;
  /* Calls line pts */
  const cPts: [number,number][] = [[0,55],[45,48],[90,62],[135,38],[180,28],[225,52],[270,22],[315,34],[360,18],[400,28]];
  /* Conversions line pts */
  const vPts: [number,number][] = [[0,70],[45,68],[90,72],[135,62],[180,55],[225,65],[270,50],[315,58],[360,46],[400,52]];
  const line = (pts:[number,number][]) => pts.reduce((acc,[x,y],i)=>{
    if(i===0) return `M${x} ${y}`;
    const[px,py]=pts[i-1]; const cx=(px+x)/2;
    return `${acc} C${cx} ${py},${cx} ${y},${x} ${y}`;
  },"");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:H }}>
      <defs>
        <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${line(cPts)} L${W} ${H} L0 ${H} Z`} fill="url(#cg1)"/>
      <path d={`${line(vPts)} L${W} ${H} L0 ${H} Z`} fill="url(#cg2)"/>
      <path d={line(cPts)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      <path d={line(vPts)} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
      {/* Tooltip at 22 Jun (~x=270) */}
      <line x1="270" y1="0" x2="270" y2={H} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 3"/>
      <circle cx="270" cy="22" r="4.5" fill="#fff" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="270" cy="50" r="4.5" fill="#fff" stroke="#22c55e" strokeWidth="2"/>
      {/* Tooltip box */}
      <rect x="230" y="2" width="72" height="36" rx="6" fill="#181929" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <text x="266" y="14" textAnchor="middle" fontSize="8.5" fill="#9ca3af" fontWeight="600">22 Jun</text>
      <circle cx="237" cy="21" r="3" fill="#3b82f6"/>
      <text x="243" y="24" fontSize="8" fill="#9ca3af">Calls: <tspan fill="#3b82f6" fontWeight="700">49</tspan></text>
      <circle cx="237" cy="31" r="3" fill="#22c55e"/>
      <text x="243" y="34" fontSize="8" fill="#9ca3af">Conv: <tspan fill="#22c55e" fontWeight="700">23</tspan></text>
    </svg>
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

/* ── Agent Performance ── */
const AGENTS = [
  { name:"Ava (AI)",  pct:89, delta:"+12%", up:true,  color:"#3b82f6" },
  { name:"Neon (AI)", pct:74, delta:"+5%",  up:true,  color:"#8b5cf6" },
  { name:"Echo (AI)", pct:93, delta:"+18%", up:true,  color:"#22c55e" },
  { name:"Nova (AI)", pct:68, delta:"-3%",  up:false, color:"#f59e0b" },
];

function AgentList() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {AGENTS.map(({ name, pct, delta, up, color }) => (
        <div key={name}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              {/* Agent avatar with AI indicator */}
              <div style={{ position:"relative", width:30, height:30, flexShrink:0 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--bg-inner)", border:`1.5px solid ${color}55`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="4" width="10" height="7" rx="1.5" fill={color} opacity="0.6"/>
                    <rect x="4" y="2" width="6" height="3" rx="1" fill={color} opacity="0.4"/>
                    <circle cx="5" cy="7.5" r="1.2" fill={color}/>
                    <circle cx="9" cy="7.5" r="1.2" fill={color}/>
                  </svg>
                </div>
              </div>
              <span style={{ color:"#9ca3af", fontSize:12 }}>{name}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{pct}%</span>
              <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                {up ? <TrendingUp size={10} color="#22c55e"/> : <TrendingDown size={10} color="#ef4444"/>}
                <span style={{ color:up?"#22c55e":"#ef4444", fontSize:10, fontWeight:600 }}>{delta}</span>
              </div>
            </div>
          </div>
          <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.06)" }}>
            <div style={{ height:"100%", width:`${pct}%`, borderRadius:3, background:color, opacity:0.8 }} />
          </div>
        </div>
      ))}
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
        const [sr, lr] = await Promise.all([fetch("/api/stats"), fetch("/api/leads")]);
        const [sd, ld] = await Promise.all([sr.json(), lr.json()]);
        if (sd.stats) setStats(sd.stats);
        if (ld.leads) {
          const found = ld.leads.find((l: Record<string,string>) => {
            const s = (l["Call Status"]||"").toLowerCase();
            return s.includes("in progress") || s==="calling...";
          });
          if (found) {
            setName(found["Full Name"] || found["Name"] || "Ashutosh Singh");
            setActive(true);
          }
        }
      } catch { /* ignore */ }
    };
    load();
    const t = setInterval(load, 30_000);
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
          label="ACTIVE LEADS"  value="247"
          sub="↑24 today"       subColor="#22c55e" trendUp={true} />
        <StatCard icon={Phone}       ic="#8b5cf6" ibg="rgba(139,92,246,0.15)"
          label="CALL QUEUE"    value={`${stats?.inProgress??14}/38`}
          sub="Live / Total" />
        <StatCard icon={Megaphone}   ic="#f59e0b" ibg="rgba(245,158,11,0.15)"
          label="CAMPAIGNS"     value="3"
          sub="Running" />
        <StatCard icon={RotateCcw}   ic="#22c55e" ibg="rgba(34,197,94,0.15)"
          label="CRM SYNC"      value="Healthy"
          sub="Last synced 12 sec ago" subColor="#22c55e" />
        <StatCard icon={Plug}        ic="#3b82f6" ibg="rgba(59,130,246,0.15)"
          label="INTEGRATIONS"  value="5"
          sub="Connected" />
        <StatCard icon={IndianRupee} ic="#f59e0b" ibg="rgba(245,158,11,0.15)"
          label="COST TRACKER"  value="4,820"
          sub="June spend" />
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
          <CallsConvChart />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            {["1 Jun","8 Jun","15 Jun","22 Jun","29 Jun"].map(d => (
              <span key={d} style={{ color:"#374151", fontSize:9 }}>{d}</span>
            ))}
          </div>
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
