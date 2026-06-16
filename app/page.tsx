"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LiveCallCard     from "./components/LiveCallCard";
import LiveConversation from "./components/LiveConversation";
import StatsSidebar     from "./components/StatsSidebar";
import {
  Users, Phone, Megaphone, RotateCcw, Plug,
  TrendingUp, Target,
} from "lucide-react";

interface Stats {
  totalLeads:number; callsToday:number; answered:number; inProgress:number;
  apiErrors:number; visitsBooked:number; interested:number; convRate:string;
}

const BG = "#1E1F25"; const CARD = "linear-gradient(135deg,#2C2F3A 0%,#252831 100%)";
const C2 = "#2A2D38"; const BD = "rgba(255,255,255,0.07)";
const R24 = 24; const R18 = 18;
const SH = "8px 8px 20px rgba(0,0,0,0.25),-8px -8px 20px rgba(255,255,255,0.03)";
const BL = "#3B82F6";

function Counter({ value }: { value: number | string }) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const [d, setD] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (isNaN(num)) return;
    const from = prev.current; prev.current = num; let i = 0;
    const t = setInterval(() => { i++; setD(Math.round(from + (num - from) * (i / 32)));
      if (i >= 32) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [num]);
  return <>{isNaN(num) ? value : d}</>;
}

function Spark({ color, data }: { color: string; data: number[] }) {
  const max = Math.max(...data, 1); const w = 80; const h = 34;
  const pts = data.map((v, i) => [i * (w / (data.length - 1)), h - (v / max) * (h - 4)]);
  const d = pts.reduce((a, [x, y], i) => i === 0 ? `M${x},${y}` : `${a} L${x},${y}`, "");
  const cid = color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={`sg${cid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#sg${cid})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

function KPICard({ label, value, color, spark, icon, delay, sub }:
  { label:string; value:number|string; color:string; spark:number[]; icon:React.ReactNode; delay:number; sub?:string }) {
  return (
    <motion.div initial={{opacity:0,y:-16,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
      transition={{type:"spring",stiffness:260,damping:22,delay}}
      whileHover={{y:-3,boxShadow:`12px 12px 30px rgba(0,0,0,0.35),-4px -4px 15px rgba(255,255,255,0.04),0 0 20px ${color}28`}}
      style={{background:CARD,border:`1px solid ${color}22`,borderRadius:R24,padding:"18px 20px",boxShadow:SH,transition:"box-shadow 0.25s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{background:`${color}20`,borderRadius:11,padding:"7px 9px",color,display:"flex"}}>{icon}</div>
        <Spark color={color} data={spark}/>
      </div>
      <p style={{color:"#8F8F8F",fontSize:10,letterSpacing:"0.06em",fontWeight:600,marginBottom:5}}>{label}</p>
      <p style={{color,fontSize:28,fontWeight:800,lineHeight:1,marginBottom:4}}><Counter value={value}/></p>
      {sub && <p style={{color:"#8F8F8F",fontSize:10}}>{sub}</p>}
    </motion.div>
  );
}

function CallsConvCard({ s }: { s: Stats|null }) {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.4,duration:0.4}}
      style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R24,padding:"20px 22px",boxShadow:SH}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em"}}>CALLS VS CONVERSIONS</p>
        <span style={{background:`${BL}18`,color:BL,fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20}}>This Month</span>
      </div>
      {s ? (
        <div style={{display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <p style={{color:BL,fontSize:30,fontWeight:800,lineHeight:1}}><Counter value={s.answered}/></p>
            <p style={{color:"#8F8F8F",fontSize:10,marginTop:5}}>Calls Made</p>
          </div>
          <div style={{width:1,height:46,background:BD}}/>
          <div style={{textAlign:"center"}}>
            <p style={{color:"#35D07F",fontSize:30,fontWeight:800,lineHeight:1}}><Counter value={s.visitsBooked}/></p>
            <p style={{color:"#8F8F8F",fontSize:10,marginTop:5}}>Visits Booked</p>
          </div>
          <div style={{width:1,height:46,background:BD}}/>
          <div style={{textAlign:"center"}}>
            <p style={{color:"#F5B73A",fontSize:30,fontWeight:800,lineHeight:1}}>{s.convRate}%</p>
            <p style={{color:"#8F8F8F",fontSize:10,marginTop:5}}>Conv Rate</p>
          </div>
        </div>
      ) : <p style={{color:"#8F8F8F",textAlign:"center",fontSize:11,padding:"18px 0"}}>Loading…</p>}
    </motion.div>
  );
}

function LeadFunnelCard({ s }: { s: Stats|null }) {
  const total = s?.totalLeads || 1;
  const items = [
    { label:"Leads",      value:s?.totalLeads   ||0, color:"#3B82F6" },
    { label:"Contacted",  value:s?.answered     ||0, color:"#8B5CF6" },
    { label:"Interested", value:s?.interested   ||0, color:"#F5B73A" },
    { label:"Booked",     value:s?.visitsBooked ||0, color:"#35D07F" },
  ];
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.46,duration:0.4}}
      style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R24,padding:"20px 22px",boxShadow:SH}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em"}}>LEAD FUNNEL</p>
        <RotateCcw size={13} color="#8F8F8F"/>
      </div>
      {items.map((row,i)=>{
        const pct = total>0 ? Math.round((row.value/total)*100) : 0;
        return (
          <div key={row.label} style={{marginBottom:11}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#C5C5C5",fontSize:11}}>{row.label}</span>
              <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                <span style={{color:row.color,fontSize:12,fontWeight:700}}>{row.value}</span>
                <span style={{color:"#8F8F8F",fontSize:10}}>{pct}%</span>
              </div>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
              <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                transition={{delay:0.5+i*0.06,duration:0.7,ease:"easeOut"}}
                style={{height:"100%",background:row.color,borderRadius:3}}/>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function AgentCard() {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.52,duration:0.4}}
      style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R24,padding:"20px 22px",boxShadow:SH,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:200}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",marginBottom:18}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em"}}>AGENT PERFORMANCE</p>
        <span style={{background:`${BL}18`,color:BL,fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20}}>Coming Soon</span>
      </div>
      <motion.div animate={{y:[0,-6,0]}} transition={{repeat:Infinity,duration:2.8,ease:"easeInOut"}}>
        <Target size={42} color="rgba(255,255,255,0.12)"/>
      </motion.div>
      <p style={{color:"#8F8F8F",fontSize:12,marginTop:14,textAlign:"center"}}>
        Connect agents via Integrations<br/>
        <span style={{fontSize:10,color:"#5E6373"}}>to track agent-level performance</span>
      </p>
    </motion.div>
  );
}

export default function OverviewPage() {
  const [stats,  setStats]  = useState<Stats|null>(null);
  const [name,   setName]   = useState("--");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sr, lr, vr] = await Promise.all([
          fetch("/api/stats"), fetch("/api/leads"), fetch("/api/vapi/live"),
        ]);
        const [sd, ld, vd] = await Promise.all([sr.json(), lr.json(), vr.json()]);
        if (sd.stats) setStats(sd.stats);
        if (vd.active === true) {
          setActive(true);
          const sheetLead = ld.leads?.find((l: Record<string,string>) => {
            const s = (l["Call Status"]||"").toLowerCase();
            return s.includes("in progress") || s==="calling...";
          });
          setName(sheetLead?.["Full Name"] || sheetLead?.["Name"] || vd.callerName || "--");
        } else {
          setActive(false); setName("--");
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 5_000);
    return ()=>clearInterval(t);
  }, []);

  const s = stats;
  const sp1=[10,15,22,30,38,45,s?.totalLeads||0];
  const sp2=[2,3,5,8,12,16,s?.inProgress||0];
  const sp3=[0,2,5,8,12,18,s?.answered||0];
  const sp4=[0,0,1,1,2,2,s?.visitsBooked||0];
  const sp5=[0,1,3,6,10,14,s?.interested||0];
  const sp6=[5,8,12,15,18,22,s?.apiErrors||0];

  return (
    <>
      <style>{`@keyframes ping2{75%,100%{transform:scale(2.2);opacity:0}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}`}</style>

      <div style={{height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"18px 24px 24px",display:"flex",flexDirection:"column",gap:14}}>

          {/* ROW 1: Live call (caller + conv) + Stats sidebar — all aligned to same height */}
          <div style={{display:"flex",gap:14,height:560,flexShrink:0}}>
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.15,duration:0.4}}
              style={{width:280,flexShrink:0,background:CARD,border:`1px solid ${BD}`,
                borderRadius:R24,padding:"18px",boxShadow:SH,overflowY:"auto"}}>
              <LiveCallCard/>
            </motion.div>
            <motion.div initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.2,duration:0.4}}
              style={{flex:1,minWidth:0,background:CARD,border:`1px solid ${BD}`,
                borderRadius:R24,padding:"18px",boxShadow:SH,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <LiveConversation/>
            </motion.div>
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.25,duration:0.4}}
              style={{width:280,flexShrink:0,background:CARD,border:`1px solid ${BD}`,
                borderRadius:R24,padding:"18px",boxShadow:SH,overflowY:"auto"}}>
              <StatsSidebar/>
            </motion.div>
          </div>

          {/* ROW 2: Six KPI cards with sparklines */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
            <KPICard label="TOTAL LEADS"   value={s?.totalLeads??"--"}    color={BL}      spark={sp1} icon={<Users size={14}/>}     delay={0.3}  sub={s?`${s.interested} interested`:""}/>
            <KPICard label="IN PROGRESS"   value={s?.inProgress??"--"}    color="#8B5CF6" spark={sp2} icon={<Phone size={14}/>}     delay={0.32} sub="AI calling"/>
            <KPICard label="CALLS MADE"    value={s?.answered??"--"}      color="#35D07F" spark={sp3} icon={<Megaphone size={14}/>} delay={0.34} sub={s?`${s.apiErrors} pending`:""}/>
            <KPICard label="VISITS BOOKED" value={s?.visitsBooked??"--"}  color="#29A8FF" spark={sp4} icon={<RotateCcw size={14}/>} delay={0.36} sub={s?`${s.convRate}% conv`:""}/>
            <KPICard label="INTERESTED"    value={s?.interested??"--"}    color="#F5B73A" spark={sp5} icon={<TrendingUp size={14}/>} delay={0.38} sub="From calls"/>
            <KPICard label="API ERRORS"    value={s?.apiErrors??"--"}     color="#FF6B6B" spark={sp6} icon={<Plug size={14}/>}      delay={0.4}  sub="Need retry"/>
          </div>

          {/* ROW 3: Three charts */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            <CallsConvCard s={s}/>
            <LeadFunnelCard s={s}/>
            <AgentCard/>
          </div>
        </div>
      </div>
    </>
  );
}
