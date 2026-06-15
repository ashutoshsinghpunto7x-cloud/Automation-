"use client";
import { useState, useEffect } from "react";
import { Megaphone, Users, Phone, TrendingUp, Target, Play, Pause, BarChart2, Calendar, IndianRupee } from "lucide-react";

interface Stats {
  totalLeads:number; answered:number; inProgress:number;
  visitsBooked:number; interested:number; convRate:string; apiErrors:number;
}

function ProgressBar({ value, max, color }: { value:number; max:number; color:string }) {
  const pct = max > 0 ? Math.min((value/max)*100,100) : 0;
  return (
    <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.06)" }}>
      <div style={{ height:"100%", width:`${pct}%`, borderRadius:3, background:color, transition:"width 0.6s ease" }} />
    </div>
  );
}

function MiniLineChart({ color="#3b82f6" }: { color?:string }) {
  const pts: [number,number][] = [[0,70],[30,60],[60,50],[90,35],[120,45],[150,28],[180,35],[210,20],[240,25]];
  const d = pts.reduce((acc,[x,y],i)=>{
    if(i===0) return `M${x} ${y}`;
    const[px,py]=pts[i-1]; const cx=(px+x)/2;
    return `${acc} C${cx} ${py},${cx} ${y},${x} ${y}`;
  },"");
  return (
    <svg viewBox="0 0 240 80" style={{ width:"100%", height:50 }}>
      <defs>
        <linearGradient id={`mg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${d} L240 80 L0 80 Z`} fill={`url(#mg${color.replace("#","")})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const CAMPAIGNS = [
  { id:1, name:"Shalimar City Q2", type:"Residential Plots", status:"active",  color:"#3b82f6", leads:49, startDate:"01 Jun 2026", endDate:"30 Jun 2026" },
  { id:2, name:"Premium Villas",   type:"Luxury Villas",     status:"paused",  color:"#8b5cf6", leads:0,  startDate:"15 Jul 2026", endDate:"31 Aug 2026" },
  { id:3, name:"Township Phase 2", type:"Plots + Flats",     status:"planned", color:"#f59e0b", leads:0,  startDate:"01 Sep 2026", endDate:"30 Nov 2026" },
];

export default function CampaignsPage() {
  const [stats,   setStats]   = useState<Stats|null>(null);
  const [active,  setActive]  = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("/api/stats");
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const s = stats;

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"16px 20px", background:"var(--bg-base)", display:"flex", flexDirection:"column", gap:16 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ color:"#fff", fontSize:20, fontWeight:700, marginBottom:2 }}>Campaigns</h1>
          <p style={{ color:"#6b7280", fontSize:12 }}>AI calling campaigns for Shalimar Developers</p>
        </div>
        <button style={{ background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.35)", borderRadius:10, padding:"8px 16px", display:"flex", alignItems:"center", gap:7, color:"#60a5fa", fontSize:12, fontWeight:600 }}>
          <Megaphone size={13} color="#60a5fa" />
          New Campaign
        </button>
      </div>

      {/* Campaign cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {CAMPAIGNS.map(c => (
          <div
            key={c.id}
            onClick={()=>setActive(c.id)}
            style={{
              background:"var(--bg-card)",
              border:`1px solid ${active===c.id ? c.color+"66" : "var(--border)"}`,
              borderRadius:16, padding:"16px",
              cursor:"pointer", transition:"all 0.15s",
              boxShadow: active===c.id ? `0 0 20px ${c.color}22` : "none",
            }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${c.color}20`, border:`1px solid ${c.color}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Megaphone size={18} color={c.color} />
              </div>
              <div style={{
                background: c.status==="active"?"rgba(34,197,94,0.12)": c.status==="paused"?"rgba(245,158,11,0.12)":"rgba(107,114,128,0.12)",
                border: c.status==="active"?"1px solid rgba(34,197,94,0.30)": c.status==="paused"?"1px solid rgba(245,158,11,0.30)":"1px solid rgba(107,114,128,0.30)",
                borderRadius:20, padding:"3px 10px",
                display:"flex", alignItems:"center", gap:5,
              }}>
                {c.status==="active" ? <Play size={9} color="#22c55e"/> : c.status==="paused" ? <Pause size={9} color="#f59e0b"/> : <Calendar size={9} color="#6b7280"/>}
                <span style={{ color:c.status==="active"?"#22c55e":c.status==="paused"?"#f59e0b":"#6b7280", fontSize:10, fontWeight:600, textTransform:"capitalize" }}>{c.status}</span>
              </div>
            </div>
            <p style={{ color:"#fff", fontSize:14, fontWeight:700, marginBottom:4 }}>{c.name}</p>
            <p style={{ color:"#6b7280", fontSize:11, marginBottom:10 }}>{c.type}</p>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <p style={{ color:c.color, fontSize:20, fontWeight:700, lineHeight:1 }}>{c.leads}</p>
                <p style={{ color:"#4b5563", fontSize:10, marginTop:2 }}>Leads assigned</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#9ca3af", fontSize:11 }}>{c.startDate}</p>
                <p style={{ color:"#4b5563", fontSize:10 }}>to {c.endDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active campaign detail — Shalimar City Q2 */}
      {active === 1 && (
        <>
          {/* KPI row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {[
              { label:"TOTAL LEADS",   value:s?String(s.totalLeads):"49",       icon:Users,       color:"#3b82f6" },
              { label:"CALLS MADE",    value:s?String(s.answered):"--",         icon:Phone,       color:"#22c55e" },
              { label:"IN PROGRESS",   value:s?String(s.inProgress):"--",       icon:Phone,       color:"#3b82f6" },
              { label:"VISITS BOOKED", value:s?String(s.visitsBooked):"--",     icon:Target,      color:"#8b5cf6" },
              { label:"CONV. RATE",    value:s?`${s.convRate}%`:"--",           icon:TrendingUp,  color:"#f59e0b" },
            ].map(({ label, value, icon:Icon, color }) => (
              <div key={label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ color:"#6b7280", fontSize:9, fontWeight:700, letterSpacing:"0.07em" }}>{label}</span>
                  <div style={{ width:24, height:24, borderRadius:7, background:`${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={12} color={color} />
                  </div>
                </div>
                <p style={{ color:"#fff", fontSize:24, fontWeight:700, lineHeight:1 }}>{loading?"--":value}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12 }}>

            {/* Call Performance chart */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div>
                  <p style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Call Performance</p>
                  <p style={{ color:"#4b5563", fontSize:11, marginTop:2 }}>Shalimar City Q2 — June 2026</p>
                </div>
                <BarChart2 size={16} color="#4b5563" />
              </div>
              <MiniLineChart color="#3b82f6" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:10 }}>
                {[
                  { label:"Total",      value:s?.totalLeads??49, color:"#6b7280" },
                  { label:"Reached",    value:s?.answered??0,    color:"#22c55e" },
                  { label:"Interested", value:s?.interested??0,  color:"#3b82f6" },
                  { label:"Booked",     value:s?.visitsBooked??0,color:"#8b5cf6" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background:"var(--bg-inner)", borderRadius:10, padding:"10px 12px" }}>
                    <p style={{ color, fontSize:18, fontWeight:700, lineHeight:1 }}>{loading?"--":value}</p>
                    <p style={{ color:"#4b5563", fontSize:10, marginTop:3 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget + funnel */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Budget */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <p style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Budget</p>
                  <IndianRupee size={14} color="#f59e0b" />
                </div>
                {[
                  { label:"AI Calling",  spent:4820,  total:8000,  color:"#3b82f6" },
                  { label:"Lead Gen",    spent:12000, total:20000, color:"#8b5cf6" },
                  { label:"Operations",  spent:3200,  total:5000,  color:"#22c55e" },
                ].map(({ label, spent, total, color }) => (
                  <div key={label} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:"#9ca3af", fontSize:11 }}>{label}</span>
                      <span style={{ color:"#fff", fontSize:11, fontWeight:600 }}>₹{spent.toLocaleString()} <span style={{ color:"#4b5563" }}>/ ₹{total.toLocaleString()}</span></span>
                    </div>
                    <ProgressBar value={spent} max={total} color={color} />
                  </div>
                ))}
              </div>

              {/* Pipeline funnel mini */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"16px", flex:1 }}>
                <p style={{ color:"#fff", fontSize:13, fontWeight:700, marginBottom:12 }}>Pipeline</p>
                {[
                  { label:"Leads",      value:s?.totalLeads??49,    color:"#3b82f6" },
                  { label:"Contacted",  value:s?.answered??0,       color:"#8b5cf6" },
                  { label:"Interested", value:s?.interested??0,     color:"#f59e0b" },
                  { label:"Visits",     value:s?.visitsBooked??0,   color:"#22c55e" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ color:"#9ca3af", fontSize:11 }}>{label}</span>
                      <span style={{ color, fontSize:11, fontWeight:700 }}>{loading?"--":value}</span>
                    </div>
                    <ProgressBar value={value} max={s?.totalLeads??49} color={color} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Other campaigns — coming soon */}
      {active !== 1 && (
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"60px 40px", textAlign:"center" }}>
          <Megaphone size={40} color="#374151" style={{ margin:"0 auto 12px" }} />
          <p style={{ color:"#4b5563", fontSize:15, fontWeight:600, marginBottom:6 }}>
            {CAMPAIGNS.find(c=>c.id===active)?.name}
          </p>
          <p style={{ color:"#374151", fontSize:12 }}>
            {CAMPAIGNS.find(c=>c.id===active)?.status === "paused" ? "Campaign is paused. Launch date: " : "Campaign planned for "}
            {CAMPAIGNS.find(c=>c.id===active)?.startDate}
          </p>
        </div>
      )}

    </div>
  );
}
