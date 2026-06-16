"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Bell, CheckCircle, AlertCircle, ExternalLink, Copy, Check,
  Database, Zap, BellRing, Info, Sparkles,
} from "lucide-react";
import ProfileMenu from "../components/ProfileMenu";

const BG = "#1E1F25"; const CARD = "linear-gradient(135deg,#2C2F3A 0%,#252831 100%)";
const C2 = "#2A2D38"; const BD = "rgba(255,255,255,0.07)";
const R24 = 24; const R18 = 18;
const SH = "8px 8px 20px rgba(0,0,0,0.25),-8px -8px 20px rgba(255,255,255,0.03)";
const BL = "#3B82F6";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,
      background:ok?"rgba(53,208,127,0.18)":"rgba(255,107,107,0.15)",
      color:ok?"#35D07F":"#FF6B6B",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
      {ok ? <CheckCircle size={11}/> : <AlertCircle size={11}/>}
      {label}
    </span>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button onClick={()=>onChange(!value)} whileTap={{scale:0.95}}
      style={{width:44,height:24,borderRadius:12,border:"none",position:"relative",
        background:value?BL:"#3a3d48",cursor:"pointer",transition:"background 0.2s"}}>
      <motion.div initial={false} animate={{left:value?22:2}} transition={{type:"spring",stiffness:500,damping:30}}
        style={{position:"absolute",top:2,width:20,height:20,borderRadius:"50%",background:"#fff",
          boxShadow:"0 2px 4px rgba(0,0,0,0.2)"}}/>
    </motion.button>
  );
}

function Row({ label, sub, right, delay=0 }: { label:string; sub?:string; right:React.ReactNode; delay?:number }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay,duration:0.3}}
      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${BD}`}}>
      <div style={{flex:1,minWidth:0,marginRight:14}}>
        <p style={{color:"#fff",fontSize:13,fontWeight:500}}>{label}</p>
        {sub && <p style={{color:"#8F8F8F",fontSize:11,marginTop:3}}>{sub}</p>}
      </div>
      <div style={{flexShrink:0}}>{right}</div>
    </motion.div>
  );
}

function Section({ title, icon: Icon, color, children, delay }:
  { title:string; icon:React.ComponentType<{size?:number;color?:string}>; color:string; children:React.ReactNode; delay:number }) {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay,duration:0.4}}
      style={{background:CARD,border:`1px solid ${BD}`,borderRadius:R24,overflow:"hidden",marginBottom:14,boxShadow:SH}}>
      <div style={{padding:"18px 20px",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:34,height:34,borderRadius:10,background:`${color}20`,border:`1px solid ${color}44`,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon size={16} color={color}/>
        </div>
        <p style={{color:"#fff",fontSize:14,fontWeight:700}}>{title}</p>
      </div>
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const [notifVisit, setNotifVisit] = useState(true);
  const [notifCall, setNotifCall] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);

  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID ?? "";
  const sheetName = process.env.NEXT_PUBLIC_SHEET_NAME ?? "Form responses 5";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <>
      <style>{`@keyframes ping2{75%,100%{transform:scale(2.2);opacity:0}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}`}</style>
      <div style={{height:"100%",background:BG,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
          style={{padding:"16px 24px 0",flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:C2,border:`1px solid ${BD}`,
            borderRadius:50,padding:"0 18px",height:44}}>
            <Search size={14} color="#8F8F8F"/>
            <input placeholder="Search settings…"
              style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,flex:1}}/>
          </div>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
            style={{width:44,height:44,borderRadius:50,background:C2,border:`1px solid ${BD}`,
              display:"flex",alignItems:"center",justifyContent:"center",color:"#8F8F8F"}}><Bell size={15}/></motion.button>
          <ProfileMenu/>
        </motion.div>

        <div style={{flex:1,padding:"16px 24px 20px",overflow:"hidden",minHeight:0,overflowY:"auto"}}>
          <div style={{maxWidth:820,margin:"0 auto"}}>
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
              style={{marginBottom:18}}>
              <h1 style={{color:"#fff",fontSize:24,fontWeight:800,marginBottom:4}}>Settings</h1>
              <p style={{color:"#8F8F8F",fontSize:12}}>Dashboard configuration for Shalimar Developers</p>
            </motion.div>

            <Section title="Data Source — Google Sheets" icon={Database} color="#35D07F" delay={0.1}>
              <Row delay={0.15} label="Connection Status" sub="Live data from n8n automation"
                right={<StatusPill ok={true} label="Connected"/>}/>
              <Row delay={0.18} label="Sheet Name" sub={sheetName}
                right={<span style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${BD}`,
                  borderRadius:10,padding:"6px 12px",color:"#C5C5C5",fontSize:11,fontFamily:"monospace"}}>{sheetName}</span>}/>
              <Row delay={0.21} label="Spreadsheet ID" sub="Used by API routes to fetch data"
                right={
                  <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=>handleCopy(sheetId)}
                    style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.06)",
                      border:`1px solid ${BD}`,borderRadius:10,padding:"7px 12px",
                      color:copied?"#35D07F":"#C5C5C5",fontSize:11,cursor:"pointer"}}>
                    {copied ? <><Check size={11}/>Copied</> : <><Copy size={11}/>Copy ID</>}
                  </motion.button>
                }/>
              <Row delay={0.24} label="Auto-refresh Interval" sub="Dashboard polls for new data automatically"
                right={<span style={{color:"#C5C5C5",fontSize:12}}>Every 30 seconds</span>}/>
              <div style={{padding:"14px 20px"}}>
                <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:6,color:"#4CC3FF",fontSize:12,textDecoration:"none",fontWeight:600}}>
                  <ExternalLink size={12}/> Open Google Sheet
                </a>
              </div>
            </Section>

            <Section title="n8n Automation" icon={Zap} color="#F5B73A" delay={0.18}>
              <Row delay={0.22} label="Automation Status" sub="Google Form → Vapi call → Sheet → Dashboard"
                right={<StatusPill ok={true} label="Active"/>}/>
              <Row delay={0.25} label="Trigger" sub="New Google Form submission"
                right={<span style={{color:"#C5C5C5",fontSize:12}}>Google Sheets Trigger</span>}/>
              <Row delay={0.28} label="AI Calling" sub="Vapi voice agent makes outbound calls"
                right={<StatusPill ok={true} label="Enabled"/>}/>
              <Row delay={0.31} label="AI Scoring" sub="OpenAI scores leads after each call"
                right={<StatusPill ok={true} label="Enabled"/>}/>
              <div style={{padding:"14px 20px"}}>
                <p style={{color:"#8F8F8F",fontSize:11,lineHeight:1.6}}>
                  To modify the automation workflow, log in to your n8n instance and open the
                  {" "}<strong style={{color:"#C5C5C5"}}>Shalimar Real Estate AI Caller</strong> workflow.
                </p>
              </div>
            </Section>

            <Section title="Notifications" icon={BellRing} color="#8B5CF6" delay={0.26}>
              <Row delay={0.3} label="Visit Booked Alert" sub="Show notification when a lead books a site visit"
                right={<Toggle value={notifVisit} onChange={setNotifVisit}/>}/>
              <Row delay={0.33} label="Call Completed Alert" sub="Notify when AI agent finishes a call"
                right={<Toggle value={notifCall} onChange={setNotifCall}/>}/>
              <Row delay={0.36} label="Auto-refresh" sub="Automatically update dashboard data every 30s"
                right={<Toggle value={autoRefresh} onChange={setAutoRefresh}/>}/>
            </Section>

            <Section title="About" icon={Info} color="#3B82F6" delay={0.34}>
              <Row delay={0.38} label="Dashboard" sub="Shalimar Developers · AI Calling Dashboard"
                right={<span style={{color:"#8F8F8F",fontSize:12}}>v1.0.0</span>}/>
              <Row delay={0.41} label="Client" sub="Lucknow, Uttar Pradesh"
                right={<span style={{color:"#C5C5C5",fontSize:12}}>Shalimar Developers</span>}/>
              <Row delay={0.44} label="Built by" sub="Powered by Next.js · Vapi · n8n · Google Sheets"
                right={<span style={{color:"#8F8F8F",fontSize:12,display:"inline-flex",alignItems:"center",gap:5}}>
                  <Sparkles size={11} color="#F5B73A"/>Varun Shukla
                </span>}/>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
