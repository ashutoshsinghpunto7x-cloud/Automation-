"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Search, Bell, RefreshCw, Megaphone, Play, Pause, Calendar, Plus,
  Users, Phone, Target, TrendingUp, IndianRupee, BarChart2,
} from "lucide-react";
import ProfileMenu from "../components/ProfileMenu";

interface Stats { totalLeads:number; answered:number; inProgress:number; visitsBooked:number; interested:number; convRate:string; apiErrors:number; callsToday?:number }

const BG = "#1E1F25"; const CARD = "linear-gradient(135deg,#2C2F3A 0%,#252831 100%)";
const C2 = "#2A2D38"; const BD = "rgba(255,255,255,0.07)";
const R24 = 24; const R18 = 18;
const SH = "8px 8px 20px rgba(0,0,0,0.25),-8px -8px 20px rgba(255,255,255,0.03)";
const BL = "#3B82F6";

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

function MiniArea({ color, data }:{color:string;data:number[]}) {
  const max = Math.max(...data,1); const w=240; const h=70;
  const pts = data.map((v,i)=>[i*(w/(data.length-1)), h-(v/max)*(h-6)]);
  const d = pts.reduce((a,[x,y],i)=>i===0?`M${x},${y}`:`${a} L${x},${y}`,"");
  const cid = color.replace(/[^a-z0-9]/gi,"");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}}>
      <defs><linearGradient id={`ma${cid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#ma${cid})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const CAMPAIGNS = [
  { id:1, name:"Shalimar City Q2", type:"Residential Plots", status:"active",  color:"#3B82F6", leads:49, startDate:"01 Jun 2026", endDate:"30 Jun 2026" },
  { id:2, name:"Premium Villas",   type:"Luxury Villas",     status:"paused",  color:"#8B5CF6", leads:0,  startDate:"15 Jul 2026", endDate:"31 Aug 2026" },
  { id:3, name:"Township Phase 2", type:"Plots + Flats",     status:"planned", color:"#F5B73A", leads:0,  startDate:"01 Sep 2026", endDate:"30 Nov 2026" },
];

function CampaignCard({ c, active, onClick, idx }: { c: typeof CAMPAIGNS[0]; active:boolean; onClick:()=>void; idx:number }) {
  const statusCfg = c.status==="active" ? {bg:"rgba(53,208,127,0.18)",color:"#35D07F",icon:Play}
    : c.status==="paused" ? {bg:"rgba(245,183,58,0.18)",color:"#F5B73A",icon:Pause}
    : {bg:"rgba(139,92,246,0.15)",color:"#8B5CF6",icon:Calendar};
  const SIcon = statusCfg.icon;
  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
      transition={{type:"spring",stiffness:300,damping:25,delay:idx*0.07}}
      whileHover={{y:-4,boxShadow:`12px 12px 30px rgba(0,0,0,0.35),0 0 30px ${c.color}28`}}
      onClick={onClick}
      style={{background:CARD,border:`1px solid ${active?c.color+"66":BD}`,borderRadius:R24,padding:"18px 20px",
        cursor:"pointer",boxShadow:active?`8px 8px 20px rgba(0,0,0,0.25),0 0 24px ${c.color}22`:SH,transition:"all 0.25s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:14,background:`${c.color}20`,border:`1.5px solid ${c.color}44`,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Megaphone size={20} color={c.color}/>
        </div>
        <span style={{display:"inline-flex",alignItems:"center",gap:5,background:statusCfg.bg,color:statusCfg.color,
          padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:600,textTransform:"capitalize"}}>
          <SIcon size={9}/>{c.status}
        </span>
      </div>
      <p style={{color:"#fff",fontSize:15,fontWeight:700,marginBottom:3}}>{c.name}</p>
      <p style={{color:"#8F8F8F",fontSize:11,marginBottom:14}}>{c.type}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <p style={{color:c.color,fontSize:26,fontWeight:800,lineHeight:1}}>{c.leads}</p>
          <p style={{color:"#8F8F8F",fontSize:10,marginTop:3}}>Leads assigned</p>
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{color:"#C5C5C5",fontSize:11}}>{c.startDate}</p>
          <p style={{color:"#8F8F8F",fontSize:10,marginTop:1}}>to {c.endDate}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CampaignSidebar({ stats }:{stats:Stats|null}) {
  const total = stats?.totalLeads||1;
  return (
    <div style={{width:268,flexShrink:0,display:"flex",flexDirection:"column",gap:12,overflowY:"auto",paddingRight:2}}>
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
        style={{background:"linear-gradient(135deg,#29A8FF22,#8B5CF618)",border:"1px solid rgba(41,168,255,0.2)",
          borderRadius:R24,padding:"20px",boxShadow:`${SH},0 0 20px rgba(41,168,255,0.08)`}}>
        <p style={{color:"#8F8F8F",fontSize:11,marginBottom:4}}>Active Campaigns</p>
        <p style={{color:"#FFFFFF",fontSize:18,fontWeight:700,marginBottom:2}}>1 of 3</p>
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

      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.18}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R24,padding:"18px 20px",boxShadow:SH}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em"}}>BUDGET</p>
          <IndianRupee size={13} color="#F5B73A"/>
        </div>
        {[
          { label:"AI Calling",  spent:4820,  total:8000,  color:"#3B82F6" },
          { label:"Lead Gen",    spent:12000, total:20000, color:"#8B5CF6" },
          { label:"Operations",  spent:3200,  total:5000,  color:"#35D07F" },
        ].map(row=>{
          const pct = Math.round((row.spent/row.total)*100);
          return (
            <div key={row.label} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{color:"#C5C5C5",fontSize:11}}>{row.label}</span>
                <span style={{color:"#fff",fontSize:11,fontWeight:600}}>₹{row.spent.toLocaleString()}</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden"}}>
                <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                  transition={{delay:0.3,duration:0.7,ease:"easeOut"}}
                  style={{height:"100%",background:row.color,borderRadius:2}}/>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.25}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 18px",boxShadow:SH}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:14}}>PIPELINE</p>
        {[
          { label:"Leads",      value:stats?.totalLeads||0,  color:"#3B82F6" },
          { label:"Answered",   value:stats?.answered||0,    color:"#8B5CF6" },
          { label:"Interested", value:stats?.interested||0,  color:"#F5B73A" },
          { label:"Visits",     value:stats?.visitsBooked||0,color:"#35D07F" },
        ].map(row=>{
          const pct = total>0 ? Math.round((row.value/total)*100) : 0;
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

export default function CampaignsPage() {
  const [stats, setStats] = useState<Stats|null>(null);
  const [activeId, setActiveId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAll = async (manual=false) => {
    if (manual) setSpinning(true);
    try {
      const sr = await fetch("/api/stats");
      const sd = await sr.json();
      if (sd.stats) setStats(sd.stats);
    } finally { setLoading(false); if (manual) setSpinning(false); }
  };
  useEffect(() => { fetchAll(); const t = setInterval(()=>fetchAll(),30_000); return ()=>clearInterval(t); }, []);

  const filteredCampaigns = CAMPAIGNS.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const s = stats;
  const sp1 = [38,42,46,49,49,49,s?.totalLeads||0];
  const sp2 = [2,5,7,12,18,22,s?.answered||0];
  const sp3 = [0,1,1,2,2,2,s?.visitsBooked||0];
  const sp4 = [10,18,28,40,45,50,Number(s?.convRate)||0];

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
              placeholder="Search campaigns…"
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
            style={{display:"flex",alignItems:"center",gap:7,borderRadius:50,
              background:"linear-gradient(135deg,#29A8FF,#3B82F6)",border:"none",
              padding:"0 18px",height:44,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            <Plus size={14}/>New
          </motion.button>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}><Bell size={15}/></motion.button>
          <ProfileMenu/>
        </motion.div>

        <div style={{flex:1,display:"flex",gap:16,padding:"16px 24px 20px",overflow:"hidden",minHeight:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:14,overflow:"hidden",minWidth:0,overflowY:"auto"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flexShrink:0}}>
              <KPICard label="TOTAL LEADS"   value={s?.totalLeads||0}    color={BL}       spark={sp1} icon={<Users size={16}/>}      delay={0}/>
              <KPICard label="CALLS MADE"    value={s?.answered||0}      color="#8B5CF6"  spark={sp2} icon={<Phone size={16}/>}      delay={0.07}/>
              <KPICard label="VISITS BOOKED" value={s?.visitsBooked||0}  color="#35D07F"  spark={sp3} icon={<Target size={16}/>}     delay={0.14}/>
              <KPICard label="CONV RATE %"   value={Number(s?.convRate)||0} color="#F5B73A" spark={sp4} icon={<TrendingUp size={16}/>} delay={0.21}/>
            </div>

            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
              <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:12}}>ALL CAMPAIGNS</p>
              <LayoutGroup id="campaigns">
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  <AnimatePresence>
                    {filteredCampaigns.map((c,i)=>(
                      <CampaignCard key={c.id} c={c} active={activeId===c.id} onClick={()=>setActiveId(c.id)} idx={i}/>
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
            </motion.div>

            {activeId===1 && (
              <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
                style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R24,padding:"22px",boxShadow:SH,flexShrink:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div>
                    <p style={{color:"#fff",fontSize:14,fontWeight:700}}>Call Performance</p>
                    <p style={{color:"#8F8F8F",fontSize:11,marginTop:2}}>Shalimar City Q2 · June 2026</p>
                  </div>
                  <BarChart2 size={16} color="#8F8F8F"/>
                </div>
                <MiniArea color={BL} data={sp1}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:14}}>
                  {[
                    { label:"Total",      value:s?.totalLeads||0,   color:"#C5C5C5" },
                    { label:"Reached",    value:s?.answered||0,     color:"#35D07F" },
                    { label:"Interested", value:s?.interested||0,   color:"#3B82F6" },
                    { label:"Booked",     value:s?.visitsBooked||0, color:"#8B5CF6" },
                  ].map(({label,value,color})=>(
                    <div key={label} style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"10px 14px"}}>
                      <p style={{color,fontSize:20,fontWeight:700,lineHeight:1}}>{loading?"--":value}</p>
                      <p style={{color:"#8F8F8F",fontSize:10,marginTop:4}}>{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeId!==1 && (
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R24,padding:"56px 40px",textAlign:"center",boxShadow:SH}}>
                <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2.8,ease:"easeInOut"}} style={{marginBottom:14}}>
                  <Megaphone size={42} color="rgba(255,255,255,0.12)" style={{margin:"0 auto"}}/>
                </motion.div>
                <p style={{color:"#fff",fontSize:15,fontWeight:600,marginBottom:6}}>
                  {CAMPAIGNS.find(c=>c.id===activeId)?.name}
                </p>
                <p style={{color:"#8F8F8F",fontSize:12}}>
                  {CAMPAIGNS.find(c=>c.id===activeId)?.status==="paused" ? "Campaign is paused · Resumes " : "Campaign planned for "}
                  {CAMPAIGNS.find(c=>c.id===activeId)?.startDate}
                </p>
              </motion.div>
            )}
          </div>

          <CampaignSidebar stats={stats}/>
        </div>
      </div>
    </>
  );
}
