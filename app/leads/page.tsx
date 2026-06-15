"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Search, Bell, RefreshCw, X, Phone, MapPin, Calendar,
  Users, Activity, Clock, Home, ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Lead {
  _rowIndex: string; Timestamp: string; "Full Name": string; "Phone Number": string;
  "Email address": string; "Preferred Location": string; "Budget Range": string;
  "Property Type": string; "Call Status": string; "Call ID": string; Intrested: string;
  "Visit Scheduled": string; "Visit Date": string; "Call Summary": string;
  "Lead Score": string; Sentiment: string; "Buying Intent": string; "Key Insights": string;
}

// ── Design tokens ──────────────────────────────────────────────────────────
const BG   = "#1E1F25";
const CARD = "linear-gradient(135deg,#2C2F3A 0%,#252831 100%)";
const C2   = "#2A2D38";
const BD   = "rgba(255,255,255,0.07)";
const R24  = 24;
const R18  = 18;
const R12  = 12;
const SH   = "8px 8px 20px rgba(0,0,0,0.25),-8px -8px 20px rgba(255,255,255,0.03)";
const SH2  = "12px 12px 30px rgba(0,0,0,0.35),-4px -4px 15px rgba(255,255,255,0.04),0 0 30px rgba(59,130,246,0.12)";
const BL   = "#3B82F6";

// ── Helpers ────────────────────────────────────────────────────────────────
const AVC = ["#3B82F6","#8B5CF6","#F5B73A","#35D07F","#FF6B6B","#29A8FF","#8B5CF6","#4CC3FF"];
const avc = (n: string) => AVC[(n.charCodeAt(0)||65) % AVC.length];
const ini = (n: string) => (n||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

// ── Animated counter ───────────────────────────────────────────────────────
function Counter({ value }: { value: number }) {
  const [d, setD] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current; prev.current = value; let i = 0;
    const t = setInterval(() => {
      i++; setD(Math.round(from + (value - from) * (i / 32)));
      if (i >= 32) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [value]);
  return <>{d}</>;
}

// ── Sparkline ──────────────────────────────────────────────────────────────
function Spark({ color, data }: { color: string; data: number[] }) {
  const max = Math.max(...data, 1);
  const w = 80; const h = 34;
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

// ── Ring chart ─────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 7; const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${pct/100*c} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dasharray 1s ease" }}/>
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={size > 60 ? 14 : 11}
        fontWeight="700" fill="#fff" fontFamily="sans-serif">{pct}%</text>
    </svg>
  );
}

// ── Status ─────────────────────────────────────────────────────────────────
type SK = "in-progress"|"pending"|"no-response"|"call-done"|"default";
const SC: Record<SK,{label:string;bg:string;color:string;dot:string;pulse:boolean}> = {
  "in-progress":  {label:"In Progress", bg:"rgba(59,130,246,0.18)",  color:"#4CC3FF", dot:"#3B82F6", pulse:true },
  "pending":      {label:"Pending",     bg:"rgba(245,183,58,0.18)",  color:"#F5B73A", dot:"#F5B73A", pulse:false},
  "no-response":  {label:"No Response", bg:"rgba(245,183,58,0.14)",  color:"#F5B73A", dot:"#F5B73A", pulse:false},
  "call-done":    {label:"Call Done",   bg:"rgba(53,208,127,0.18)",  color:"#35D07F", dot:"#35D07F", pulse:false},
  "default":      {label:"Pending",     bg:"rgba(245,183,58,0.15)",  color:"#F5B73A", dot:"#F5B73A", pulse:false},
};
function skKey(s: string): SK {
  const l = (s||"").toLowerCase();
  if (l.includes("in progress")||l.includes("calling")) return "in-progress";
  if (l.includes("api error")) return "pending";
  if (l.includes("silence")) return "no-response";
  if (l.includes("customer-ended")) return "call-done";
  return "default";
}
function Pill({ s }: { s: typeof SC[SK] }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.bg,color:s.color,
      padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
      <span style={{position:"relative",display:"inline-flex",width:7,height:7,flexShrink:0}}>
        <span style={{position:"absolute",inset:0,borderRadius:"50%",background:s.dot,
          opacity:s.pulse?0.35:1,animation:s.pulse?"ping2 1.4s ease infinite":"none"}}/>
        <span style={{position:"relative",borderRadius:"50%",background:s.dot,width:"100%",height:"100%"}}/>
      </span>
      {s.label}
    </span>
  );
}

// ── KPI card ───────────────────────────────────────────────────────────────
function KPICard({ label, value, color, spark, icon, delay }:
  { label:string; value:number; color:string; spark:number[]; icon:React.ReactNode; delay:number }) {
  return (
    <motion.div
      initial={{opacity:0,y:-16,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
      transition={{type:"spring",stiffness:260,damping:22,delay}}
      whileHover={{y:-3,boxShadow:`12px 12px 30px rgba(0,0,0,0.35),-4px -4px 15px rgba(255,255,255,0.04),0 0 20px ${color}28`}}
      style={{background:`linear-gradient(135deg,#2C2F3A 0%,#252831 100%)`,border:`1px solid ${color}22`,borderRadius:R24,padding:"20px 22px",
        boxShadow:SH,transition:"box-shadow 0.25s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{background:`${color}20`,borderRadius:12,padding:"8px 10px",color,display:"flex"}}>{icon}</div>
        <Spark color={color} data={spark}/>
      </div>
      <p style={{color:"#8F8F8F",fontSize:11,letterSpacing:"0.06em",fontWeight:600,marginBottom:6}}>{label}</p>
      <p style={{color,fontSize:34,fontWeight:800,lineHeight:1}}><Counter value={value}/></p>
    </motion.div>
  );
}

// ── Lead card ──────────────────────────────────────────────────────────────
function LeadCard({ lead, index, onClick }: { lead:Lead; index:number; onClick:()=>void }) {
  const col = avc(lead["Full Name"]||"?");
  const s   = SC[skKey(lead["Call Status"])];
  const visited = lead["Visit Scheduled"]?.toUpperCase()==="TRUE";
  return (
    <motion.div
      initial={{opacity:0,y:18,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,x:-24,scale:0.97}}
      transition={{type:"spring",stiffness:340,damping:28,delay:index*0.04}}
      layout onClick={onClick}
      whileHover={{y:-2,boxShadow:SH2}}
      style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 20px",
        cursor:"pointer",boxShadow:SH,
        transition:"box-shadow 0.2s,border-color 0.2s",marginBottom:10}}
      onMouseEnter={e=>(e.currentTarget.style.borderColor=`${BL}40`)}
      onMouseLeave={e=>(e.currentTarget.style.borderColor=BD)}
    >
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <motion.div whileHover={{scale:1.08}}
          style={{width:44,height:44,borderRadius:14,background:`${col}22`,border:`2px solid ${col}55`,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            fontSize:15,fontWeight:700,color:col}}>
          {ini(lead["Full Name"]||"?")}
        </motion.div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <p style={{color:"#fff",fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {lead["Full Name"]||"—"}
            </p>
            <Pill s={s}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,color:"#8F8F8F",fontSize:11}}>
            <Phone size={10}/><span>{lead["Phone Number"]||"—"}</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
          {visited && (
            <span style={{background:"rgba(53,208,127,0.18)",color:"#35D07F",
              padding:"2px 10px",borderRadius:20,fontSize:10,fontWeight:600}}>✓ Visit Booked</span>
          )}
          <span style={{color:"#8F8F8F",fontSize:11}}>{lead.Timestamp?.split(" ")[0]||"—"}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:16,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        {([
          {icon:<MapPin size={10}/>, val:lead["Preferred Location"]},
          {icon:<span style={{fontSize:10}}>₹</span>, val:lead["Budget Range"]},
          {icon:<Home size={10}/>,   val:lead["Property Type"]},
        ] as {icon:React.ReactNode;val:string}[]).filter(r=>r.val).map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4,
            color:"#8F8F8F",fontSize:11,overflow:"hidden"}}>
            {r.icon}<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
          </div>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,color:`${BL}90`,fontSize:11}}>
          <span>View</span><ChevronRight size={11}/>
        </div>
      </div>
    </motion.div>
  );
}

// ── Drawer ─────────────────────────────────────────────────────────────────
function Drawer({ lead, onClose }: { lead:Lead; onClose:()=>void }) {
  const col = avc(lead["Full Name"]||"?");
  const s   = SC[skKey(lead["Call Status"])];
  const visited = lead["Visit Scheduled"]?.toUpperCase()==="TRUE";
  const interested = lead.Intrested?.toUpperCase()==="TRUE";
  return (
    <>
      <motion.div key="bd" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        transition={{duration:0.22}} onClick={onClose}
        style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)"}}/>
      <motion.div key="pn"
        initial={{x:"100%",opacity:0}} animate={{x:0,opacity:1}} exit={{x:"100%",opacity:0}}
        transition={{type:"spring",stiffness:320,damping:30}}
        style={{position:"fixed",top:16,right:16,bottom:16,zIndex:201,width:420,
          background:"#252731",border:`1px solid ${BD}`,borderRadius:R24,
          overflowY:"auto",display:"flex",flexDirection:"column",boxShadow:SH2}}>
        <div style={{padding:"22px 22px 18px",borderBottom:`1px solid ${BD}`,
          display:"flex",gap:14,alignItems:"center",flexShrink:0}}>
          <div style={{width:52,height:52,borderRadius:16,background:`${col}20`,border:`2px solid ${col}55`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:18,fontWeight:700,color:col,flexShrink:0}}>
            {ini(lead["Full Name"]||"?")}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:"#fff",fontSize:17,fontWeight:700}}>{lead["Full Name"]||"—"}</p>
            <p style={{color:"#8F8F8F",fontSize:12,marginTop:2}}>{lead["Phone Number"]}</p>
          </div>
          <motion.button whileHover={{scale:1.12}} whileTap={{scale:0.93}} onClick={onClose}
            style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.08)",
              border:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <X size={15} color="#888"/>
          </motion.button>
        </div>
        <div style={{padding:"18px 22px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {([
              {k:"CALL STATUS",  v:<Pill s={s}/>},
              {k:"VISIT BOOKED", v:<span style={{color:visited?"#35D07F":"#8F8F8F",fontSize:13,fontWeight:600}}>{visited?"✓ Yes":"No"}</span>},
              {k:"INTERESTED",   v:<span style={{color:interested?"#35D07F":"#8F8F8F",fontSize:13,fontWeight:600}}>{interested?"✓ Yes":"No"}</span>},
              {k:"PROPERTY",     v:<span style={{color:"#fff",fontSize:13}}>{lead["Property Type"]||"—"}</span>},
            ] as {k:string;v:React.ReactNode}[]).map((item,i)=>(
              <motion.div key={item.k} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                transition={{delay:0.12+i*0.04}}
                style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R12,padding:"11px 14px"}}>
                <p style={{color:"#8F8F8F",fontSize:9,letterSpacing:"0.07em",fontWeight:700,marginBottom:7}}>{item.k}</p>
                {item.v}
              </motion.div>
            ))}
          </div>
          {([
            {title:"Lead Details", rows:[
              {k:"Location",v:lead["Preferred Location"]},{k:"Budget",v:lead["Budget Range"]},
              {k:"Email",v:lead["Email address"]},{k:"Date",v:lead.Timestamp?.split(" ")[0]},
              ...(lead["Visit Date"]?[{k:"Visit Date",v:lead["Visit Date"]}]:[]),
            ]},
            ...(lead["Call Summary"]?[{title:"Call Summary",text:lead["Call Summary"]}]:[]),
            ...(lead["Key Insights"]?[{title:"Key Insights",text:lead["Key Insights"]}]:[]),
            ...(lead.Sentiment?[{title:"AI Analysis",rows:[
              {k:"Sentiment",v:lead.Sentiment},
              ...(lead["Buying Intent"]?[{k:"Buying Intent",v:lead["Buying Intent"]}]:[]),
            ]}]:[]),
          ] as any[]).map((sec,si)=>(
            <motion.div key={sec.title} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              transition={{delay:0.18+si*0.05}}
              style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R18,padding:"14px 16px"}}>
              <p style={{color:"#8F8F8F",fontSize:10,fontWeight:700,letterSpacing:"0.06em",marginBottom:11}}>{sec.title}</p>
              {sec.rows&&sec.rows.map((r:any)=>(
                <div key={r.k} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{color:"#8F8F8F",fontSize:12}}>{r.k}</span>
                  <span style={{color:"#fff",fontSize:12,maxWidth:200,textAlign:"right"}}>{r.v||"—"}</span>
                </div>
              ))}
              {sec.text&&<p style={{color:"#C5C5C5",fontSize:12,lineHeight:1.75}}>{sec.text}</p>}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ── Analytics sidebar ──────────────────────────────────────────────────────
function AnalyticsSidebar({ stats, leads }: { stats:any; leads:Lead[] }) {
  const total    = stats?.totalLeads || 1;
  const callDone = (stats?.answered||0) + (stats?.inProgress||0);
  const succRate = Math.round((callDone / total) * 100);
  const convRate = callDone > 0 ? Math.round(((stats?.visitsBooked||0) / callDone) * 100) : 0;
  const weekData = [14,22,18,31,27,19,leads.length||0];

  return (
    <div style={{width:268,flexShrink:0,display:"flex",flexDirection:"column",gap:12,overflowY:"auto",paddingRight:2}}>

      {/* Welcome */}
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
        style={{background:"linear-gradient(135deg,#29A8FF22,#8B5CF618)",
          border:"1px solid rgba(41,168,255,0.2)",borderRadius:R24,padding:"20px",
          boxShadow:`${SH},0 0 20px rgba(41,168,255,0.08)`}}>
        <p style={{color:"#8F8F8F",fontSize:11,marginBottom:4}}>Welcome back</p>
        <p style={{color:"#FFFFFF",fontSize:18,fontWeight:700,marginBottom:2}}>Ekansh Saxena</p>
        <p style={{color:"#8F8F8F",fontSize:11}}>Shalimar Developers · Lucknow</p>
        <div style={{marginTop:14,display:"flex",gap:8}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
            <p style={{color:"#29A8FF",fontSize:18,fontWeight:700}}>{stats?.totalLeads||0}</p>
            <p style={{color:"#8F8F8F",fontSize:9,marginTop:2}}>TOTAL LEADS</p>
          </div>
          <div style={{flex:1,background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
            <p style={{color:"#35D07F",fontSize:18,fontWeight:700}}>{stats?.visitsBooked||0}</p>
            <p style={{color:"#8F8F8F",fontSize:9,marginTop:2}}>VISITS</p>
          </div>
        </div>
      </motion.div>

      {/* Performance rings */}
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.15}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R24,padding:"18px 20px",boxShadow:SH}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:16}}>PERFORMANCE</p>
        <div style={{display:"flex",gap:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <Ring pct={succRate} color={BL}/>
            <div style={{textAlign:"center"}}>
              <p style={{color:"#fff",fontSize:12,fontWeight:600}}>Call Success</p>
              <p style={{color:"#8F8F8F",fontSize:10}}>calls reached</p>
            </div>
          </div>
          <div style={{width:1,background:BD,margin:"0 6px"}}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <Ring pct={convRate} color="#35D07F"/>
            <div style={{textAlign:"center"}}>
              <p style={{color:"#fff",fontSize:12,fontWeight:600}}>Conversion</p>
              <p style={{color:"#8F8F8F",fontSize:10}}>visits / calls</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly chart */}
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.2}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R24,padding:"18px 20px",boxShadow:SH}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em"}}>WEEKLY CALLS</p>
          <span style={{background:`${BL}18`,color:BL,fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20}}>This Week</span>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:72}}>
          {["M","T","W","T","F","S","S"].map((day,i)=>{
            const v=weekData[i]; const mx=Math.max(...weekData,1);
            const h=Math.round((v/mx)*64); const isT=i===6;
            return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{position:"relative",width:"100%"}}>
                  {isT&&<div style={{position:"absolute",top:-18,left:"50%",transform:"translateX(-50%)",
                    background:BL,color:"#fff",fontSize:9,fontWeight:700,padding:"2px 5px",
                    borderRadius:6,whiteSpace:"nowrap"}}>{v}</div>}
                  <div style={{width:"100%",height:h,background:isT?"#29A8FF":"rgba(255,255,255,0.1)",
                    borderRadius:"5px 5px 0 0",transition:"height 0.5s ease"}}/>
                </div>
                <span style={{fontSize:9,color:isT?"#fff":"#8F8F8F"}}>{day}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Live + Today mini cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.25}}
          style={{background:C2,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 14px",boxShadow:SH}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#35D07F",
              display:"block",animation:"ping2 1.4s ease infinite"}}/>
            <span style={{color:"#8F8F8F",fontSize:9,fontWeight:600,letterSpacing:"0.05em"}}>LIVE</span>
          </div>
          <p style={{color:"#fff",fontSize:28,fontWeight:800,lineHeight:1}}>{stats?.inProgress||0}</p>
          <p style={{color:"#8F8F8F",fontSize:9,marginTop:4}}>AI calling</p>
        </motion.div>
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.28}}
          style={{background:C2,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 14px",boxShadow:SH}}>
          <p style={{color:"#8F8F8F",fontSize:9,fontWeight:600,letterSpacing:"0.05em",marginBottom:10}}>TODAY</p>
          <p style={{color:BL,fontSize:28,fontWeight:800,lineHeight:1}}>{stats?.callsToday||0}</p>
          <p style={{color:"#8F8F8F",fontSize:9,marginTop:4}}>calls made</p>
        </motion.div>
      </div>

      {/* Pipeline bars */}
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.3}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 18px",boxShadow:SH}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:14}}>LEAD PIPELINE</p>
        {([
          {label:"Answered",  value:stats?.answered||0,  color:"#35D07F"},
          {label:"Pending",   value:stats?.apiErrors||0, color:"#F5B73A"},
          {label:"In Progress",value:stats?.inProgress||0,color:BL},
        ] as {label:string;value:number;color:string}[]).map(row=>{
          const pct = total > 0 ? Math.round((row.value/total)*100) : 0;
          return (
            <div key={row.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{color:"#C5C5C5",fontSize:11}}>{row.label}</span>
                <span style={{color:"#fff",fontSize:11,fontWeight:600}}>{row.value}</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden"}}>
                <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                  transition={{delay:0.4,duration:0.7,ease:"easeOut"}}
                  style={{height:"100%",background:row.color,borderRadius:2}}/>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Filters ────────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["All","In Progress","No Response","Call Done","Pending"];
const TYPE_FILTERS   = ["All","Residential","Commercial"];

// ── Main page ──────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [stats, setStats]     = useState<any>(null);
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("All");
  const [typeF, setTypeF]     = useState("All");
  const [selected, setSelected] = useState<Lead|null>(null);
  const [lastUp, setLastUp]   = useState("");

  const fetchAll = async (manual = false) => {
    if (manual) setSpinning(true);
    try {
      const [lr, sr] = await Promise.all([fetch("/api/leads"), fetch("/api/stats")]);
      const [ld, sd] = await Promise.all([lr.json(), sr.json()]);
      if (ld.leads) setLeads([...ld.leads].reverse());
      if (sd.stats) setStats(sd.stats);
      setLastUp(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
    } finally { setLoading(false); if (manual) setSpinning(false); }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => fetchAll(), 30_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => leads.filter(l => {
    const q  = search.toLowerCase();
    const mQ = !q||(l["Full Name"]||"").toLowerCase().includes(q)||(l["Phone Number"]||"").toLowerCase().includes(q)||(l["Preferred Location"]||"").toLowerCase().includes(q);
    const st = (l["Call Status"]||"").toLowerCase();
    const mS = statusF==="All"
      ||(statusF==="In Progress"&&(st.includes("in progress")||st.includes("calling")))
      ||(statusF==="No Response"&&st.includes("silence"))
      ||(statusF==="Call Done"&&st.includes("customer-ended"))
      ||(statusF==="Pending"&&st.includes("api error"));
    const mT = typeF==="All"||(l["Property Type"]||"")===typeF;
    return mQ&&mS&&mT;
  }), [leads,search,statusF,typeF]);

  const sp1 = [18,24,19,28,22,31,leads.length||0];
  const sp2 = [10,14,12,18,16,22,stats?.answered||0];
  const sp3 = [0,1,1,0,2,1,stats?.visitsBooked||0];
  const sp4 = [4,3,5,3,2,4,stats?.apiErrors||0];

  return (
    <>
      <style>{`
        @keyframes ping2{75%,100%{transform:scale(2.2);opacity:0}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
      `}</style>

      <div style={{height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* ── Search header ── */}
        <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
          style={{padding:"16px 24px 0",flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:C2,border:`1px solid ${BD}`,
            borderRadius:50,padding:"0 18px",height:44,backdropFilter:"blur(16px)"}}>
            <Search size={14} color="#8F8F8F"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search leads by name, phone or city…"
              style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,flex:1}}/>
            <AnimatePresence>
              {search&&(
                <motion.button initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                  whileHover={{scale:1.2}} onClick={()=>setSearch("")}
                  style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:0}}>
                  <X size={13} color="#8F8F8F"/>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}} onClick={()=>fetchAll(true)}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}>
            <motion.span animate={{rotate:spinning?360:0}}
              transition={{duration:0.7,ease:"linear",repeat:spinning?Infinity:0}}>
              <RefreshCw size={15}/>
            </motion.span>
          </motion.button>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}>
            <Bell size={15}/>
          </motion.button>
          <motion.div whileHover={{scale:1.05}}
            style={{width:44,height:44,borderRadius:50,
              background:"linear-gradient(135deg,#29A8FF,#3B82F6)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer"}}>
            EK
          </motion.div>
        </motion.div>

        {/* ── Body ── */}
        <div style={{flex:1,display:"flex",gap:16,padding:"16px 24px 20px",overflow:"hidden",minHeight:0}}>

          {/* ── Left column ── */}
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:14,overflow:"hidden",minWidth:0}}>

            {/* KPI row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flexShrink:0}}>
              <KPICard label="TOTAL LEADS"   value={stats?.totalLeads||0}   color={BL}      spark={sp1} icon={<Users size={16}/>}    delay={0}   />
              <KPICard label="CALLS MADE"    value={stats?.answered||0}     color="#8B5CF6" spark={sp2} icon={<Activity size={16}/>} delay={0.07}/>
              <KPICard label="VISITS BOOKED" value={stats?.visitsBooked||0} color="#35D07F" spark={sp3} icon={<Calendar size={16}/>} delay={0.14}/>
              <KPICard label="PENDING CALLS" value={stats?.apiErrors||0}    color="#F5B73A" spark={sp4} icon={<Clock size={16}/>}    delay={0.21}/>
            </div>

            {/* Filter pills */}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
              style={{display:"flex",gap:10,flexShrink:0,flexWrap:"wrap",alignItems:"center"}}>
              <LayoutGroup id="sf">
                <div style={{display:"flex",gap:5,background:C2,border:`1px solid ${BD}`,borderRadius:50,padding:"4px 6px"}}>
                  {STATUS_FILTERS.map(f=>(
                    <motion.button key={f} onClick={()=>setStatusF(f)} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                      style={{position:"relative",padding:"5px 14px",borderRadius:50,fontSize:11,fontWeight:500,
                        border:"none",background:"transparent",color:statusF===f?"#fff":"#8F8F8F",
                        transition:"color 0.15s",cursor:"pointer",zIndex:0}}>
                      {statusF===f&&(
                        <motion.span layoutId="sf-pill"
                          style={{position:"absolute",inset:0,background:BL,borderRadius:50,zIndex:-1}}
                          transition={{type:"spring",bounce:0.18,duration:0.38}}/>
                      )}
                      {f}
                    </motion.button>
                  ))}
                </div>
              </LayoutGroup>
              <LayoutGroup id="tf">
                <div style={{display:"flex",gap:5,background:C2,border:`1px solid ${BD}`,borderRadius:50,padding:"4px 6px"}}>
                  {TYPE_FILTERS.map(f=>(
                    <motion.button key={f} onClick={()=>setTypeF(f)} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                      style={{position:"relative",padding:"5px 14px",borderRadius:50,fontSize:11,fontWeight:500,
                        border:"none",background:"transparent",color:typeF===f?"#fff":"#8F8F8F",
                        transition:"color 0.15s",cursor:"pointer",zIndex:0}}>
                      {typeF===f&&(
                        <motion.span layoutId="tf-pill"
                          style={{position:"absolute",inset:0,background:"#a78bfa",borderRadius:50,zIndex:-1}}
                          transition={{type:"spring",bounce:0.18,duration:0.38}}/>
                      )}
                      {f}
                    </motion.button>
                  ))}
                </div>
              </LayoutGroup>
              {lastUp&&<span style={{color:"#8F8F8F",fontSize:11,marginLeft:"auto"}}>Updated {lastUp}</span>}
            </motion.div>

            {/* Lead cards */}
            <div style={{flex:1,overflowY:"auto",minHeight:0}}>
              {loading&&Array.from({length:5}).map((_,i)=>(
                <div key={i} style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R18,
                  padding:"18px 20px",marginBottom:10,height:100,opacity:0.5}}/>
              ))}
              {!loading&&filtered.length===0&&(
                <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",
                    justifyContent:"center",height:260,gap:14}}>
                  <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2.8,ease:"easeInOut"}}>
                    <Search size={44} color="rgba(255,255,255,0.1)"/>
                  </motion.div>
                  <p style={{color:"#8F8F8F",fontSize:14}}>No leads match this filter</p>
                  <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                    onClick={()=>{setSearch("");setStatusF("All");setTypeF("All");}}
                    style={{background:C2,border:`1px solid ${BD}`,borderRadius:50,
                      padding:"9px 22px",color:"#C5C5C5",fontSize:12,cursor:"pointer"}}>
                    Clear filters
                  </motion.button>
                </motion.div>
              )}
              <motion.div variants={{show:{transition:{staggerChildren:0.04}}}} initial="hidden" animate="show">
                <AnimatePresence mode="popLayout">
                  {!loading&&filtered.map((lead,i)=>(
                    <LeadCard key={lead._rowIndex} lead={lead} index={i} onClick={()=>setSelected(lead)}/>
                  ))}
                </AnimatePresence>
              </motion.div>
              {!loading&&filtered.length>0&&(
                <p style={{color:"#8F8F8F",fontSize:11,textAlign:"center",marginTop:10,paddingBottom:8}}>
                  {filtered.length} of {leads.length} leads
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Analytics ── */}
          <AnalyticsSidebar stats={stats} leads={leads}/>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selected&&<Drawer key="drawer" lead={selected} onClose={()=>setSelected(null)}/>}
      </AnimatePresence>
    </>
  );
}
