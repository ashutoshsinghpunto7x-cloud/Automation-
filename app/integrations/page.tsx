"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, RefreshCw, CheckCircle, XCircle, Clock, ExternalLink,
  Plug, Zap, Phone, FileSpreadsheet, Bot, Webhook, Shield, Copy, Check,
} from "lucide-react";
import ProfileMenu from "../components/ProfileMenu";

interface Integration {
  id: string; name: string; desc: string;
  icon: React.ComponentType<{size?:number;color?:string}>;
  color: string; status: "connected"|"disconnected"|"pending";
  detail: string; lastSync?: string;
}

const BG = "#1E1F25"; const CARD = "linear-gradient(135deg,#2C2F3A 0%,#252831 100%)";
const C2 = "#2A2D38"; const BD = "rgba(255,255,255,0.07)";
const R24 = 24; const R18 = 18;
const SH = "8px 8px 20px rgba(0,0,0,0.25),-8px -8px 20px rgba(255,255,255,0.03)";
const BL = "#3B82F6";

const INTEGRATIONS: Integration[] = [
  { id:"vapi",    name:"Vapi",            desc:"AI Voice Calling Platform", icon:Phone,           color:"#3B82F6", status:"connected",    detail:"Webhook active · Receiving live transcripts", lastSync:"Live"     },
  { id:"sheets",  name:"Google Sheets",   desc:"Lead Data Source (CRM)",    icon:FileSpreadsheet, color:"#35D07F", status:"connected",    detail:"Form responses 5 · 49 leads",                  lastSync:"30s ago"  },
  { id:"n8n",     name:"n8n Automation",  desc:"Workflow Automation Engine",icon:Zap,             color:"#F5B73A", status:"pending",      detail:"Webhook URL configured · Awaiting trigger",    lastSync:"--"       },
  { id:"openai",  name:"OpenAI / LLM",    desc:"AI Transcript Analysis",    icon:Bot,             color:"#8B5CF6", status:"disconnected", detail:"Not configured · Add OPENAI_API_KEY",          lastSync:"--"       },
  { id:"webhook", name:"Custom Webhook",  desc:"Push notifications anywhere",icon:Webhook,        color:"#29A8FF", status:"disconnected", detail:"No webhook URL set",                            lastSync:"--"       },
  { id:"slack",   name:"Slack",           desc:"Team notifications",        icon:Plug,            color:"#FF6B6B", status:"disconnected", detail:"Not connected · Notify on events",             lastSync:"--"       },
];

const STATUS_ICON = {
  connected:    { icon:CheckCircle, color:"#35D07F", label:"Connected",    bg:"rgba(53,208,127,0.18)" },
  pending:      { icon:Clock,       color:"#F5B73A", label:"Pending",      bg:"rgba(245,183,58,0.18)" },
  disconnected: { icon:XCircle,     color:"#FF6B6B", label:"Disconnected", bg:"rgba(255,107,107,0.15)" },
};

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

function IntegrationCard({ intg, idx }: { intg: Integration; idx: number }) {
  const Icon = intg.icon;
  const st = STATUS_ICON[intg.status];
  const SIcon = st.icon;
  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
      transition={{type:"spring",stiffness:300,damping:25,delay:idx*0.05}}
      whileHover={{y:-3,boxShadow:`12px 12px 30px rgba(0,0,0,0.35),0 0 24px ${intg.color}22`}}
      style={{background:CARD,border:`1px solid ${intg.status==="connected"?intg.color+"33":BD}`,borderRadius:R24,padding:"20px 22px",boxShadow:SH,transition:"box-shadow 0.25s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:14,background:`${intg.color}20`,border:`1.5px solid ${intg.color}44`,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon size={20} color={intg.color}/>
        </div>
        <span style={{display:"inline-flex",alignItems:"center",gap:5,background:st.bg,color:st.color,
          padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:600}}>
          <SIcon size={9}/>{st.label}
        </span>
      </div>
      <p style={{color:"#fff",fontSize:14,fontWeight:700,marginBottom:3}}>{intg.name}</p>
      <p style={{color:"#8F8F8F",fontSize:11,marginBottom:12}}>{intg.desc}</p>
      <p style={{color:"#C5C5C5",fontSize:11,lineHeight:1.5,marginBottom:14}}>{intg.detail}</p>
      {intg.lastSync && intg.status!=="disconnected" && (
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:14}}>
          <RefreshCw size={10} color="#8F8F8F"/>
          <span style={{color:"#8F8F8F",fontSize:10}}>Last sync: {intg.lastSync}</span>
        </div>
      )}
      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
        style={{width:"100%",padding:"10px 0",borderRadius:12,
          background:intg.status==="connected"?"rgba(255,255,255,0.05)":`${intg.color}18`,
          border:intg.status==="connected"?`1px solid ${BD}`:`1px solid ${intg.color}40`,
          color:intg.status==="connected"?"#8F8F8F":intg.color,
          fontSize:11,fontWeight:600,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        {intg.status==="connected"?<><RefreshCw size={11}/>Manage</>:<><ExternalLink size={11}/>Connect</>}
      </motion.button>
    </motion.div>
  );
}

function IntegrationsSidebar({ stats }:{stats:{connected:number;pending:number;disconnected:number}}) {
  return (
    <div style={{width:268,flexShrink:0,display:"flex",flexDirection:"column",gap:12,overflowY:"auto",paddingRight:2}}>
      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
        style={{background:"linear-gradient(135deg,#29A8FF22,#8B5CF618)",border:"1px solid rgba(41,168,255,0.2)",
          borderRadius:R24,padding:"20px",boxShadow:`${SH},0 0 20px rgba(41,168,255,0.08)`}}>
        <p style={{color:"#8F8F8F",fontSize:11,marginBottom:4}}>System Status</p>
        <p style={{color:"#FFFFFF",fontSize:18,fontWeight:700,marginBottom:2}}>All systems normal</p>
        <p style={{color:"#8F8F8F",fontSize:11}}>{stats.connected} of {stats.connected+stats.pending+stats.disconnected} services online</p>
        <div style={{marginTop:14,display:"flex",gap:8}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
            <p style={{color:"#35D07F",fontSize:18,fontWeight:700}}>{stats.connected}</p>
            <p style={{color:"#8F8F8F",fontSize:9,marginTop:2}}>ACTIVE</p>
          </div>
          <div style={{flex:1,background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
            <p style={{color:"#F5B73A",fontSize:18,fontWeight:700}}>{stats.pending}</p>
            <p style={{color:"#8F8F8F",fontSize:9,marginTop:2}}>PENDING</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.18}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R24,padding:"18px 20px",boxShadow:SH}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:14}}>SETUP CHECKLIST</p>
        {[
          { label:"Vapi webhook configured",   done:true  },
          { label:"Google Sheets API key set", done:true  },
          { label:"n8n workflow active",       done:true  },
          { label:"OpenAI key (optional)",     done:false },
          { label:"Slack webhook (optional)",  done:false },
        ].map((row,i)=>(
          <motion.div key={row.label} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.25+i*0.05}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0"}}>
            <div style={{width:18,height:18,borderRadius:6,background:row.done?"rgba(53,208,127,0.18)":"rgba(255,255,255,0.05)",
              border:`1px solid ${row.done?"#35D07F66":BD}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {row.done && <Check size={11} color="#35D07F"/>}
            </div>
            <span style={{color:row.done?"#C5C5C5":"#8F8F8F",fontSize:12,textDecoration:row.done?"none":"none"}}>{row.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.3}}
        style={{background:C2,border:`1px solid ${BD}`,borderRadius:R18,padding:"16px 18px",boxShadow:SH}}>
        <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:10}}>RECENT EVENTS</p>
        {[
          { label:"Vapi webhook ping",     time:"just now",  color:"#3B82F6" },
          { label:"Sheets data refreshed", time:"30s ago",   color:"#35D07F" },
          { label:"n8n workflow waiting",  time:"5 min ago", color:"#F5B73A" },
        ].map(e=>(
          <div key={e.label} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:e.color,flexShrink:0}}/>
            <span style={{color:"#C5C5C5",fontSize:11,flex:1}}>{e.label}</span>
            <span style={{color:"#8F8F8F",fontSize:10}}>{e.time}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [copied, setCopied] = useState("");
  const [spinning, setSpinning] = useState(false);

  const webhookUrl = typeof window!=="undefined" ? `${window.location.origin}/api/vapi/webhook` : "/api/vapi/webhook";

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(()=>setCopied(""), 2000);
  };

  const connected    = INTEGRATIONS.filter(i=>i.status==="connected").length;
  const disconnected = INTEGRATIONS.filter(i=>i.status==="disconnected").length;
  const pending      = INTEGRATIONS.filter(i=>i.status==="pending").length;

  return (
    <>
      <style>{`@keyframes ping2{75%,100%{transform:scale(2.2);opacity:0}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}`}</style>
      <div style={{height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
          style={{padding:"16px 24px 0",flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:C2,border:`1px solid ${BD}`,
            borderRadius:50,padding:"0 18px",height:44}}>
            <Search size={14} color="#8F8F8F"/>
            <input placeholder="Search integrations…"
              style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,flex:1}}/>
          </div>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
            onClick={()=>{setSpinning(true); setTimeout(()=>setSpinning(false),700);}}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}>
            <motion.span animate={{rotate:spinning?360:0}} transition={{duration:0.7,ease:"linear",repeat:spinning?Infinity:0}}>
              <RefreshCw size={15}/>
            </motion.span>
          </motion.button>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}><Bell size={15}/></motion.button>
          <ProfileMenu/>
        </motion.div>

        <div style={{flex:1,display:"flex",gap:16,padding:"16px 24px 20px",overflow:"hidden",minHeight:0}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:14,overflow:"hidden",minWidth:0,overflowY:"auto"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flexShrink:0}}>
              <KPICard label="CONNECTED"    value={connected}                    color="#35D07F" spark={[1,1,2,2,2,2,connected]} icon={<CheckCircle size={16}/>} delay={0}/>
              <KPICard label="PENDING"      value={pending}                      color="#F5B73A" spark={[0,0,1,1,1,1,pending]}   icon={<Clock size={16}/>}      delay={0.07}/>
              <KPICard label="DISCONNECTED" value={disconnected}                 color="#FF6B6B" spark={[3,3,3,3,3,3,disconnected]} icon={<XCircle size={16}/>}  delay={0.14}/>
              <KPICard label="TOTAL"        value={INTEGRATIONS.length}          color={BL}      spark={[3,4,5,5,6,6,INTEGRATIONS.length]} icon={<Plug size={16}/>} delay={0.21}/>
            </div>

            {/* Webhook URL highlight card */}
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
              style={{background:"linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.12))",
                border:"1px solid rgba(59,130,246,0.35)",borderRadius:R24,padding:"20px 22px",boxShadow:`${SH},0 0 30px rgba(59,130,246,0.12)`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:10,background:"rgba(59,130,246,0.2)",border:"1px solid rgba(59,130,246,0.4)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Shield size={16} color="#3B82F6"/>
                </div>
                <div style={{flex:1}}>
                  <p style={{color:"#fff",fontSize:14,fontWeight:700}}>Your Vapi Webhook URL</p>
                  <p style={{color:"#8F8F8F",fontSize:11,marginTop:2}}>Paste this into Vapi → Assistant → Server URL</p>
                </div>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(53,208,127,0.18)",color:"#35D07F",
                  padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:600}}>
                  <span style={{position:"relative",display:"inline-flex",width:6,height:6}}>
                    <span style={{position:"absolute",inset:0,borderRadius:"50%",background:"#35D07F",opacity:0.35,animation:"ping2 1.4s ease infinite"}}/>
                    <span style={{position:"relative",borderRadius:"50%",background:"#35D07F",width:"100%",height:"100%"}}/>
                  </span>
                  Active
                </span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:14}}>
                <div style={{flex:1,background:"rgba(0,0,0,0.3)",border:`1px solid ${BD}`,borderRadius:12,padding:"11px 14px",overflow:"hidden"}}>
                  <code style={{color:"#4CC3FF",fontSize:12,fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"block"}}>{webhookUrl}</code>
                </div>
                <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                  onClick={()=>copy(webhookUrl,"webhook")}
                  style={{display:"flex",alignItems:"center",gap:6,background:"rgba(59,130,246,0.25)",border:"1px solid rgba(59,130,246,0.5)",
                    borderRadius:12,padding:"11px 18px",color:"#4CC3FF",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {copied==="webhook" ? <><Check size={12}/>Copied</> : <><Copy size={12}/>Copy</>}
                </motion.button>
              </div>
              <p style={{color:"#8F8F8F",fontSize:10,marginTop:10}}>
                Events to enable: <span style={{color:"#C5C5C5"}}>call-started · transcript · end-of-call-report</span>
              </p>
            </motion.div>

            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
              <p style={{color:"#8F8F8F",fontSize:11,fontWeight:600,letterSpacing:"0.05em",marginBottom:12}}>ALL INTEGRATIONS</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                <AnimatePresence>
                  {INTEGRATIONS.map((intg,i)=>(<IntegrationCard key={intg.id} intg={intg} idx={i}/>))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <IntegrationsSidebar stats={{connected,pending,disconnected}}/>
        </div>
      </div>
    </>
  );
}
