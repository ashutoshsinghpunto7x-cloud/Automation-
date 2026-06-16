"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Search, Bell, RefreshCw, X, Phone, PhoneOff, PhoneIncoming, PhoneMissed,
  Clock, MapPin, Home, ChevronRight, Activity,
} from "lucide-react";

interface Lead { [k: string]: string }

const BG = "#1E1F25"; const CARD = "linear-gradient(135deg,#2C2F3A 0%,#252831 100%)";
const C2 = "#2A2D38"; const BD = "rgba(255,255,255,0.07)";
const R24 = 24; const R18 = 18; const R12 = 12;
const SH = "8px 8px 20px rgba(0,0,0,0.25),-8px -8px 20px rgba(255,255,255,0.03)";
const SH2 = "12px 12px 30px rgba(0,0,0,0.35),-4px -4px 15px rgba(255,255,255,0.04),0 0 30px rgba(59,130,246,0.12)";
const BL = "#3B82F6";

const AVC = ["#3B82F6","#8B5CF6","#F5B73A","#35D07F","#FF6B6B","#29A8FF","#8B5CF6","#4CC3FF"];
const avc = (n: string) => AVC[(n.charCodeAt(0)||65) % AVC.length];
const ini = (n: string) => (n||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

function Counter({ value }: { value: number }) {
  const [d, setD] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current; prev.current = value; let i = 0;
    const t = setInterval(() => { i++; setD(Math.round(from + (value - from) * (i / 32)));
      if (i >= 32) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [value]);
  return <>{d}</>;
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

type CSK = "in-progress"|"completed"|"no-answer"|"pending"|"default";
const CSC: Record<CSK,{label:string;bg:string;color:string;dot:string;pulse:boolean;icon:React.ComponentType<{size?:number;color?:string}>}> = {
  "in-progress": {label:"In Progress",bg:"rgba(59,130,246,0.18)",color:"#4CC3FF",dot:"#3B82F6",pulse:true, icon:PhoneIncoming},
  "completed":   {label:"Completed",  bg:"rgba(53,208,127,0.18)",color:"#35D07F",dot:"#35D07F",pulse:false,icon:PhoneOff},
  "no-answer":   {label:"No Answer",  bg:"rgba(245,183,58,0.18)",color:"#F5B73A",dot:"#F5B73A",pulse:false,icon:PhoneMissed},
  "pending":     {label:"Pending",    bg:"rgba(245,183,58,0.14)",color:"#F5B73A",dot:"#F5B73A",pulse:false,icon:Clock},
  "default":     {label:"Pending",    bg:"rgba(245,183,58,0.15)",color:"#F5B73A",dot:"#F5B73A",pulse:false,icon:Clock},
};
function cskKey(s: string): CSK {
  const l = (s||"").toLowerCase();
  if (l.includes("in progress")||l.includes("calling")) return "in-progress";
  if (l.includes("customer-ended")) return "completed";
  if (l.includes("silence")) return "no-answer";
  if (l.includes("api error")) return "pending";
  return "default";
}
function Pill({ s }: { s: typeof CSC[CSK] }) {
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

function KPICard({ label, value, color, spark, icon, delay }:
  { label:string; value:number; color:string; spark:number[]; icon:React.ReactNode; delay:number }) {
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

function CallCard({ lead, index }: { lead:Lead; index:number }) {
  const name = lead["Full Name"]||lead["Name"]||"Unknown";
  const phone = lead["Phone Number"]||lead["Phone"]||"—";
  const property = lead["Property Type"]||lead["Property"]||"—";
  const location = lead["Location"]||lead["Preferred Location"]||lead["City"]||"—";
  const ts = lead["Timestamp"]||lead["Date"]||"—";
  const interested = (lead["Intrested"]||lead["Interested"]||"").toUpperCase()==="TRUE";
  const col = avc(name);
  const sk = cskKey(lead["Call Status"]||"");
  const s = CSC[sk];
  const Icon = s.icon;
  return (
    <motion.div
      initial={{opacity:0,y:18,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,x:-24,scale:0.97}}
      transition={{type:"spring",stiffness:340,damping:28,delay:index*0.04}}
      layout whileHover={{y:-2,boxShadow:SH2}}
      style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 20px",
        boxShadow:SH,transition:"box-shadow 0.2s,border-color 0.2s",marginBottom:10}}
      onMouseEnter={e=>(e.currentTarget.style.borderColor=`${BL}40`)}
      onMouseLeave={e=>(e.currentTarget.style.borderColor=BD)}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <motion.div whileHover={{scale:1.08}}
          style={{width:44,height:44,borderRadius:14,background:`${col}22`,border:`2px solid ${col}55`,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            fontSize:15,fontWeight:700,color:col}}>{ini(name)}</motion.div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <p style={{color:"#fff",fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</p>
            <Pill s={s}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,color:"#8F8F8F",fontSize:11}}>
            <Phone size={10}/><span>{phone}</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
          {interested && (
            <span style={{background:"rgba(53,208,127,0.18)",color:"#35D07F",
              padding:"2px 10px",borderRadius:20,fontSize:10,fontWeight:600}}>✓ Interested</span>
          )}
          <span style={{color:"#8F8F8F",fontSize:11}}>{(ts||"").split(" ")[0]||"—"}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:16,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        {([
          {icon:<MapPin size={10}/>,val:location},
          {icon:<Home size={10}/>,val:property},
          {icon:<Icon size={10} color={s.color}/>,val:s.label},
        ] as {icon:React.ReactNode;val:string}[]).filter(r=>r.val&&r.val!=="—").map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4,color:"#8F8F8F",fontSize:11,overflow:"hidden"}}>
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

function CallSidebar({ stats, leads }:{stats:{totalLeads?:number;answered?:number;inProgress?:number;visitsBooked?:number;apiErrors?:number;callsToday?:number}|null;leads:Lead[]}) {
  const total = stats?.totalLeads||1;
  const callDone = (stats?.answered||0)+(stats?.inProgress||0);
  const succRate = Math.round((callDone/total)*100);
  const convRate = callDone>0?Math.round(((stats?.visitsBooked||0)/callDone)*100):0;
  const weekData = [14,22,18,31,27,19,leads.length||0];
  return (
    <div style={{width:268,flexShrink:0,display:"flex",flexDirection:"column",gap:12,overflowY:"auto",paddingRight:2}}>
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
        style={{background:"linear-gradient(135deg,#29A8FF22,#8B5CF618)",border:"1px solid rgba(41,168,255,0.2)",
          borderRadius:R24,padding:"20px",boxShadow:`${SH},0 0 20px rgba(41,168,255,0.08)`}}>
        <p style={{color:"#8F8F8F",fontSize:11,marginBottom:4}}>Call Activity</p>
        <p style={{color:"#FFFFFF",fontSize:18,fontWeight:700,marginBottom:2}}>Real-time</p>
        <p style={{color:"#8F8F8F",fontSize:11}}>Auto-refreshes every 30s</p>
        <div style={{marginTop:14,display:"flex",gap:8}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
            <p style={{color:"#29A8FF",fontSize:18,fontWeight:700}}>{leads.length}</p>
            <p style={{color:"#8F8F8F",fontSize:9,marginTop:2}}>TOTAL</p>
          </div>
          <div style={{flex:1,background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
            <p style={{color:"#35D07F",fontSize:18,fontWeight:700}}>{stats?.inProgress||0}</p>
            <p style={{color:"#8F8F8F",fontSize:9,marginTop:2}}>LIVE</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.15}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R24,padding:"18px 20px",boxShadow:SH}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:16}}>CALL OUTCOMES</p>
        <div style={{display:"flex",gap:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <Ring pct={succRate} color={BL}/>
            <div style={{textAlign:"center"}}>
              <p style={{color:"#fff",fontSize:12,fontWeight:600}}>Reached</p>
              <p style={{color:"#8F8F8F",fontSize:10}}>of total</p>
            </div>
          </div>
          <div style={{width:1,background:BD,margin:"0 6px"}}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <Ring pct={convRate} color="#35D07F"/>
            <div style={{textAlign:"center"}}>
              <p style={{color:"#fff",fontSize:12,fontWeight:600}}>Visits</p>
              <p style={{color:"#8F8F8F",fontSize:10}}>per call</p>
            </div>
          </div>
        </div>
      </motion.div>

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
                    background:BL,color:"#fff",fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:6,whiteSpace:"nowrap"}}>{v}</div>}
                  <div style={{width:"100%",height:h,background:isT?"#29A8FF":"rgba(255,255,255,0.1)",
                    borderRadius:"5px 5px 0 0",transition:"height 0.5s ease"}}/>
                </div>
                <span style={{fontSize:9,color:isT?"#fff":"#8F8F8F"}}>{day}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.25}}
          style={{background:C2,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 14px",boxShadow:SH}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#35D07F",animation:"ping2 1.4s ease infinite"}}/>
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
    </div>
  );
}

const STATUS_FILTERS = ["All","In Progress","Completed","No Answer","Pending"];

export default function CallsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<{totalLeads?:number;answered?:number;inProgress?:number;visitsBooked?:number;apiErrors?:number;callsToday?:number}|null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [lastUp, setLastUp] = useState("");

  const fetchAll = async (manual=false) => {
    if (manual) setSpinning(true);
    try {
      const [lr, sr] = await Promise.all([fetch("/api/leads"), fetch("/api/stats")]);
      const [ld, sd] = await Promise.all([lr.json(), sr.json()]);
      if (ld.leads) setLeads([...ld.leads].reverse());
      if (sd.stats) setStats(sd.stats);
      setLastUp(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
    } finally { setLoading(false); if (manual) setSpinning(false); }
  };

  useEffect(() => { fetchAll(); const t = setInterval(() => fetchAll(), 30_000); return () => clearInterval(t); }, []);

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const mQ = !q||(l["Full Name"]||l["Name"]||"").toLowerCase().includes(q)||(l["Phone Number"]||l["Phone"]||"").toLowerCase().includes(q);
    const sk = cskKey(l["Call Status"]||"");
    const mF = filter==="All"||CSC[sk].label===filter;
    return mQ&&mF;
  }), [leads,search,filter]);

  const total = leads.length;
  const inProgress = leads.filter(l=>cskKey(l["Call Status"]||"")==="in-progress").length;
  const completed = leads.filter(l=>cskKey(l["Call Status"]||"")==="completed").length;
  const pending = leads.filter(l=>cskKey(l["Call Status"]||"")==="pending"||cskKey(l["Call Status"]||"")==="default").length;

  const sp1=[8,12,18,24,21,28,total];
  const sp2=[2,4,3,6,5,8,inProgress];
  const sp3=[5,6,8,12,10,14,completed];
  const sp4=[3,4,2,5,4,6,pending];

  return (
    <>
      <style>{`@keyframes ping2{75%,100%{transform:scale(2.2);opacity:0}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}`}</style>
      <div style={{height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
          style={{padding:"16px 24px 0",flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:C2,border:`1px solid ${BD}`,
            borderRadius:50,padding:"0 18px",height:44}}>
            <Search size={14} color="#8F8F8F"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search calls by name or phone…"
              style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,flex:1}}/>
            <AnimatePresence>
              {search&&(<motion.button initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                whileHover={{scale:1.2}} onClick={()=>setSearch("")}
                style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:0}}>
                <X size={13} color="#8F8F8F"/>
              </motion.button>)}
            </AnimatePresence>
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

        <div style={{flex:1,display:"flex",gap:16,padding:"16px 24px 20px",overflow:"hidden",minHeight:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:14,overflow:"hidden",minWidth:0}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flexShrink:0}}>
              <KPICard label="TOTAL CALLS"  value={total}      color={BL}      spark={sp1} icon={<Phone size={16}/>}         delay={0}/>
              <KPICard label="IN PROGRESS"  value={inProgress} color="#4CC3FF" spark={sp2} icon={<PhoneIncoming size={16}/>} delay={0.07}/>
              <KPICard label="COMPLETED"    value={completed}  color="#35D07F" spark={sp3} icon={<PhoneOff size={16}/>}      delay={0.14}/>
              <KPICard label="PENDING"      value={pending}    color="#F5B73A" spark={sp4} icon={<Clock size={16}/>}         delay={0.21}/>
            </div>

            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
              style={{display:"flex",gap:10,flexShrink:0,flexWrap:"wrap",alignItems:"center"}}>
              <LayoutGroup id="cf">
                <div style={{display:"flex",gap:5,background:C2,border:`1px solid ${BD}`,borderRadius:50,padding:"4px 6px"}}>
                  {STATUS_FILTERS.map(f=>(
                    <motion.button key={f} onClick={()=>setFilter(f)} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                      style={{position:"relative",padding:"5px 14px",borderRadius:50,fontSize:11,fontWeight:500,
                        border:"none",background:"transparent",color:filter===f?"#fff":"#8F8F8F",
                        transition:"color 0.15s",cursor:"pointer",zIndex:0}}>
                      {filter===f&&(<motion.span layoutId="cf-pill"
                        style={{position:"absolute",inset:0,background:BL,borderRadius:50,zIndex:-1}}
                        transition={{type:"spring",bounce:0.18,duration:0.38}}/>)}
                      {f}
                    </motion.button>
                  ))}
                </div>
              </LayoutGroup>
              <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:"auto",color:"#8F8F8F",fontSize:11}}>
                <Activity size={12}/><span>{filtered.length} of {leads.length}</span>
                {lastUp&&<span style={{marginLeft:10}}>Updated {lastUp}</span>}
              </div>
            </motion.div>

            <div style={{flex:1,overflowY:"auto",minHeight:0}}>
              {loading&&Array.from({length:5}).map((_,i)=>(
                <div key={i} style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R18,
                  padding:"18px 20px",marginBottom:10,height:100,opacity:0.5}}/>
              ))}
              {!loading&&filtered.length===0&&(
                <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:260,gap:14}}>
                  <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2.8,ease:"easeInOut"}}>
                    <PhoneMissed size={44} color="rgba(255,255,255,0.1)"/>
                  </motion.div>
                  <p style={{color:"#8F8F8F",fontSize:14}}>No calls match this filter</p>
                  <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                    onClick={()=>{setSearch("");setFilter("All");}}
                    style={{background:C2,border:`1px solid ${BD}`,borderRadius:50,
                      padding:"9px 22px",color:"#C5C5C5",fontSize:12,cursor:"pointer"}}>Clear filters</motion.button>
                </motion.div>
              )}
              <motion.div variants={{show:{transition:{staggerChildren:0.04}}}} initial="hidden" animate="show">
                <AnimatePresence mode="popLayout">
                  {!loading&&filtered.map((lead,i)=>(
                    <CallCard key={lead._rowIndex||i} lead={lead} index={i}/>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <CallSidebar stats={stats} leads={leads}/>
        </div>
      </div>
    </>
  );
}
