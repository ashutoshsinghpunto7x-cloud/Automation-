"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search, Bell, RefreshCw, TrendingUp, Users, Phone, Calendar, MapPin, Home, Target,
} from "lucide-react";

interface Stats {
  totalLeads:number; callsToday?:number; answered:number; inProgress:number;
  apiErrors:number; visitsBooked:number; interested:number; convRate:string;
}
interface Lead {
  "Preferred Location"?: string; "Property Type"?: string; "Budget Range"?: string;
  "Call Status"?: string; Sentiment?: string;
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
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
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

function KPICard({ label, value, color, spark, icon, delay }:
  { label:string; value:number|string; color:string; spark:number[]; icon:React.ReactNode; delay:number }) {
  return (
    <motion.div initial={{opacity:0,y:-16,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
      transition={{type:"spring",stiffness:260,damping:22,delay}}
      whileHover={{y:-3,boxShadow:`12px 12px 30px rgba(0,0,0,0.35),-4px -4px 15px rgba(255,255,255,0.04),0 0 20px ${color}28`}}
      style={{background:CARD,border:`1px solid ${color}22`,borderRadius:R24,padding:"20px 22px",boxShadow:SH,transition:"box-shadow 0.25s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{background:`${color}20`,borderRadius:12,padding:"8px 10px",color,display:"flex"}}>{icon}</div>
        <Spark color={color} data={spark}/>
      </div>
      <p style={{color:"#8F8F8F",fontSize:11,letterSpacing:"0.06em",fontWeight:600,marginBottom:6}}>{label}</p>
      <p style={{color,fontSize:34,fontWeight:800,lineHeight:1}}><Counter value={value}/></p>
    </motion.div>
  );
}

function Funnel({ steps }: { steps: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...steps.map(s => s.value), 1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {steps.map((s,i)=>{
        const pct = (s.value/max)*100;
        return (
          <div key={s.label}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#C5C5C5",fontSize:12}}>{s.label}</span>
              <span style={{color:"#fff",fontSize:12,fontWeight:700}}>{s.value}</span>
            </div>
            <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
              <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{delay:0.3+i*0.06,duration:0.7,ease:"easeOut"}}
                style={{height:"100%",background:s.color,borderRadius:4}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ segments }: { segments: { label:string; value:number; color:string }[] }) {
  const total = segments.reduce((a,s)=>a+s.value,0);
  if (total === 0) return <p style={{color:"#8F8F8F",fontSize:12,textAlign:"center",padding:"20px 0"}}>No data yet</p>;
  const r=46; const cx=60; const cy=60; const stroke=14; const circ=2*Math.PI*r;
  let offset=0;
  const arcs = segments.map(s=>{ const pct=s.value/total; const dash=pct*circ; const a={...s,dash,gap:circ-dash,offset}; offset+=dash; return a; });
  return (
    <div style={{display:"flex",alignItems:"center",gap:18}}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        {arcs.map((a,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth={stroke}
            strokeDasharray={`${a.dash} ${a.gap}`} strokeDashoffset={-a.offset+circ*0.25}
            transform="rotate(-90 60 60)" style={{transition:"stroke-dasharray 0.7s ease"}}/>
        ))}
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">{total}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill="#8F8F8F">TOTAL</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
        {segments.map(s=>(
          <div key={s.label} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:s.color,flexShrink:0}}/>
            <span style={{color:"#C5C5C5",fontSize:11,flex:1}}>{s.label}</span>
            <span style={{color:"#fff",fontSize:11,fontWeight:700}}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ data, color }:{ data:{label:string;value:number}[]; color:string }) {
  const max = Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {data.map((d,i)=>(
        <div key={d.label} style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#8F8F8F",fontSize:11,width:110,flexShrink:0,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span>
          <div style={{flex:1,height:18,background:"rgba(255,255,255,0.05)",borderRadius:5,overflow:"hidden"}}>
            <motion.div initial={{width:0}} animate={{width:`${(d.value/max)*100}%`}}
              transition={{delay:0.3+i*0.04,duration:0.6,ease:"easeOut"}}
              style={{height:"100%",background:color,borderRadius:5,minWidth:d.value>0?6:0}}/>
          </div>
          <span style={{color:"#fff",fontSize:12,fontWeight:700,width:28,textAlign:"right"}}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children, delay }:{title:string;children:React.ReactNode;delay:number}) {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay,duration:0.4}}
      style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R24,padding:"20px 22px",boxShadow:SH}}>
      <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:18}}>{title}</p>
      {children}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats|null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [lastUp, setLastUp] = useState("");

  const fetchAll = async (manual=false) => {
    if (manual) setSpinning(true);
    try {
      const [sr, lr] = await Promise.all([fetch("/api/stats"), fetch("/api/leads")]);
      const [sd, ld] = await Promise.all([sr.json(), lr.json()]);
      if (sd.stats) setStats(sd.stats);
      if (ld.leads) setLeads(ld.leads);
      setLastUp(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
    } finally { setLoading(false); if (manual) setSpinning(false); }
  };
  useEffect(() => { fetchAll(); const t=setInterval(()=>fetchAll(),30_000); return ()=>clearInterval(t); },[]);

  const locationData = useMemo(()=>{
    const m: Record<string,number> = {};
    leads.forEach(l=>{ const k=l["Preferred Location"]||"Unknown"; m[k]=(m[k]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label,value}));
  },[leads]);
  const propertyData = useMemo(()=>{
    const m: Record<string,number> = {};
    leads.forEach(l=>{ const k=l["Property Type"]||"Unknown"; m[k]=(m[k]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value}));
  },[leads]);
  const budgetData = useMemo(()=>{
    const m: Record<string,number> = {};
    leads.forEach(l=>{ const k=l["Budget Range"]||"N/A"; m[k]=(m[k]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label,value}));
  },[leads]);
  const sentimentData = useMemo(()=>{
    const m: Record<string,number> = {};
    leads.forEach(l=>{ if (l.Sentiment) { const k=l.Sentiment; m[k]=(m[k]||0)+1; }});
    const colors = ["#35D07F","#3B82F6","#F5B73A","#FF6B6B","#8B5CF6","#29A8FF"];
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([label,value],i)=>({label,value,color:colors[i%colors.length]}));
  },[leads]);

  const s = stats;
  const funnelSteps = [
    { label:"Total Leads",     value:s?.totalLeads??0,                       color:"#3B82F6" },
    { label:"Calls Attempted", value:(s?.answered??0)+(s?.inProgress??0),    color:"#29A8FF" },
    { label:"Calls Answered",  value:s?.answered??0,                         color:"#35D07F" },
    { label:"Interested",      value:s?.interested??0,                       color:"#F5B73A" },
    { label:"Visits Booked",   value:s?.visitsBooked??0,                     color:"#8B5CF6" },
  ];
  const callStatusSegs = [
    { label:"Answered",    value:s?.answered??0,    color:"#35D07F" },
    { label:"In Progress", value:s?.inProgress??0,  color:"#3B82F6" },
    { label:"Pending",     value:s?.apiErrors??0,   color:"#F5B73A" },
  ];

  const sp1=[5,10,18,28,38,45,s?.totalLeads||0];
  const sp2=[1,2,5,12,22,38,Number(s?.convRate)||0];
  const sp3=[0,1,4,8,12,16,s?.interested||0];
  const sp4=[0,0,1,1,2,2,s?.visitsBooked||0];

  return (
    <>
      <style>{`@keyframes ping2{75%,100%{transform:scale(2.2);opacity:0}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}`}</style>
      <div style={{height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
          style={{padding:"16px 24px 0",flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:C2,border:`1px solid ${BD}`,
            borderRadius:50,padding:"0 18px",height:44}}>
            <Search size={14} color="#8F8F8F"/>
            <input placeholder="Search analytics…"
              style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,flex:1}}/>
          </div>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}} onClick={()=>fetchAll(true)}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}>
            <motion.span animate={{rotate:spinning?360:0}} transition={{duration:0.7,ease:"linear",repeat:spinning?Infinity:0}}>
              <RefreshCw size={15}/>
            </motion.span>
          </motion.button>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}><Bell size={15}/></motion.button>
          <motion.div whileHover={{scale:1.05}}
            style={{width:44,height:44,borderRadius:50,background:"linear-gradient(135deg,#29A8FF,#3B82F6)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer"}}>EK</motion.div>
        </motion.div>

        <div style={{flex:1,padding:"16px 24px 20px",overflow:"hidden",minHeight:0,overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em"}}>KEY METRICS</p>
            {lastUp && <span style={{color:"#8F8F8F",fontSize:11}}>Updated {lastUp}</span>}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
            <KPICard label="TOTAL LEADS"   value={s?.totalLeads||0}                    color={BL}       spark={sp1} icon={<Users size={16}/>}      delay={0}/>
            <KPICard label="CONV RATE"     value={s?`${s.convRate}%`:"0%"}             color="#35D07F"  spark={sp2} icon={<TrendingUp size={16}/>} delay={0.07}/>
            <KPICard label="INTERESTED"    value={s?.interested||0}                    color="#F5B73A"  spark={sp3} icon={<Phone size={16}/>}      delay={0.14}/>
            <KPICard label="VISITS BOOKED" value={s?.visitsBooked||0}                  color="#8B5CF6"  spark={sp4} icon={<Calendar size={16}/>}   delay={0.21}/>
          </div>

          {loading ? (
            <p style={{color:"#8F8F8F",textAlign:"center",marginTop:80,fontSize:13}}>Loading analytics…</p>
          ) : (
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <ChartCard title="LEAD CONVERSION FUNNEL" delay={0.3}><Funnel steps={funnelSteps}/></ChartCard>
                <ChartCard title="CALL STATUS BREAKDOWN"  delay={0.36}><Donut segments={callStatusSegs}/></ChartCard>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <ChartCard title="TOP PREFERRED LOCATIONS" delay={0.42}>
                  {locationData.length>0 ? <Bar data={locationData} color="#3B82F6"/>
                    : <p style={{color:"#8F8F8F",fontSize:12,padding:"14px 0"}}>No location data yet</p>}
                </ChartCard>
                <ChartCard title="BUDGET RANGE DISTRIBUTION" delay={0.48}>
                  {budgetData.length>0 ? <Bar data={budgetData} color="#8B5CF6"/>
                    : <p style={{color:"#8F8F8F",fontSize:12,padding:"14px 0"}}>No budget data yet</p>}
                </ChartCard>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <ChartCard title="PROPERTY TYPE ENQUIRIES" delay={0.54}>
                  {propertyData.length>0 ? <Bar data={propertyData} color="#35D07F"/>
                    : <p style={{color:"#8F8F8F",fontSize:12,padding:"14px 0"}}>No property data yet</p>}
                </ChartCard>
                <ChartCard title="CALLER SENTIMENT" delay={0.6}>
                  {sentimentData.length>0 ? <Donut segments={sentimentData}/>
                    : <p style={{color:"#8F8F8F",fontSize:12,textAlign:"center",padding:"20px 0"}}>Sentiment data will appear after calls</p>}
                </ChartCard>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
