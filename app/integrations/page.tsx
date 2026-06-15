"use client";
import { useState } from "react";
import { CheckCircle, XCircle, RefreshCw, ExternalLink, Plug, Zap, Phone, FileSpreadsheet, Bot, Webhook, Clock, Shield } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{size?:number;color?:string}>;
  color: string;
  bg: string;
  status: "connected" | "disconnected" | "pending";
  detail: string;
  lastSync?: string;
  docsUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id:"vapi", name:"Vapi", desc:"AI Voice Calling Platform",
    icon:Phone, color:"#3b82f6", bg:"rgba(59,130,246,0.15)",
    status:"connected", detail:"Webhook active · Receiving live transcripts",
    lastSync:"Live", docsUrl:"https://vapi.ai",
  },
  {
    id:"sheets", name:"Google Sheets", desc:"Lead Data Source (CRM)",
    icon:FileSpreadsheet, color:"#22c55e", bg:"rgba(34,197,94,0.15)",
    status:"connected", detail:"Form responses 5 · 49 leads · Auto-refreshes every 30s",
    lastSync:"30s ago",
  },
  {
    id:"n8n", name:"n8n Automation", desc:"Workflow Automation Engine",
    icon:Zap, color:"#f59e0b", bg:"rgba(245,158,11,0.15)",
    status:"pending", detail:"Webhook URL configured · Awaiting first trigger",
    lastSync:"--",
  },
  {
    id:"openai", name:"OpenAI / LLM", desc:"AI Transcript Analysis",
    icon:Bot, color:"#8b5cf6", bg:"rgba(139,92,246,0.15)",
    status:"disconnected", detail:"Not configured · Add OPENAI_API_KEY to enable",
    lastSync:"--",
  },
  {
    id:"webhook", name:"Custom Webhook", desc:"Push notifications to any URL",
    icon:Webhook, color:"#06b6d4", bg:"rgba(6,182,212,0.15)",
    status:"disconnected", detail:"No webhook URL set",
    lastSync:"--",
  },
  {
    id:"slack", name:"Slack", desc:"Team notifications",
    icon:Plug, color:"#ec4899", bg:"rgba(236,72,153,0.15)",
    status:"disconnected", detail:"Not connected · Notify team on call events",
    lastSync:"--",
  },
];

const STATUS_ICON = {
  connected:    { icon:CheckCircle, color:"#22c55e", label:"Connected"    },
  disconnected: { icon:XCircle,     color:"#ef4444", label:"Disconnected" },
  pending:      { icon:Clock,       color:"#f59e0b", label:"Pending"      },
};

export default function IntegrationsPage() {
  const [copied, setCopied] = useState("");

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(()=>setCopied(""), 2000);
  };

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/vapi/webhook`
    : "/api/vapi/webhook";

  const connected    = INTEGRATIONS.filter(i=>i.status==="connected").length;
  const disconnected = INTEGRATIONS.filter(i=>i.status==="disconnected").length;
  const pending      = INTEGRATIONS.filter(i=>i.status==="pending").length;

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"16px 20px", background:"var(--bg-base)", display:"flex", flexDirection:"column", gap:16 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ color:"#fff", fontSize:20, fontWeight:700, marginBottom:2 }}>Integrations</h1>
          <p style={{ color:"#6b7280", fontSize:12 }}>Connect VoxCall with your tools and services</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,197,94,0.10)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:20, padding:"5px 12px" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" }} />
            <span style={{ color:"#22c55e", fontSize:11, fontWeight:600 }}>{connected} Connected</span>
          </div>
          <div style={{ background:"rgba(245,158,11,0.10)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:20, padding:"5px 12px" }}>
            <span style={{ color:"#f59e0b", fontSize:11, fontWeight:600 }}>{pending} Pending</span>
          </div>
          <div style={{ background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:20, padding:"5px 12px" }}>
            <span style={{ color:"#ef4444", fontSize:11, fontWeight:600 }}>{disconnected} Disconnected</span>
          </div>
        </div>
      </div>

      {/* Vapi webhook URL — highlighted card */}
      <div style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.12),rgba(99,102,241,0.08))", border:"1px solid rgba(59,130,246,0.30)", borderRadius:16, padding:"18px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <Shield size={16} color="#3b82f6" />
          <p style={{ color:"#fff", fontSize:13, fontWeight:700 }}>Your Vapi Webhook URL</p>
          <div style={{ background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.30)", borderRadius:20, padding:"2px 10px" }}>
            <span style={{ color:"#22c55e", fontSize:10, fontWeight:600 }}>Active</span>
          </div>
        </div>
        <p style={{ color:"#6b7280", fontSize:11, marginBottom:12 }}>
          Set this URL in your Vapi Dashboard → Assistant → Server URL to receive live transcripts and call events.
        </p>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ flex:1, background:"var(--bg-inner)", border:"1px solid var(--border-md)", borderRadius:10, padding:"10px 14px" }}>
            <code style={{ color:"#60a5fa", fontSize:12 }}>{webhookUrl}</code>
          </div>
          <button
            onClick={()=>copy(webhookUrl,"webhook")}
            style={{ background:"rgba(59,130,246,0.20)", border:"1px solid rgba(59,130,246,0.40)", borderRadius:10, padding:"10px 16px", color:"#60a5fa", fontSize:11, fontWeight:600, flexShrink:0 }}
          >
            {copied==="webhook" ? "Copied!" : "Copy"}
          </button>
        </div>
        <p style={{ color:"#374151", fontSize:10, marginTop:8 }}>
          Events to enable in Vapi: <span style={{ color:"#6b7280" }}>call-started · transcript · end-of-call-report</span>
        </p>
      </div>

      {/* Integration cards grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {INTEGRATIONS.map(intg => {
          const Icon   = intg.icon;
          const StIcon = STATUS_ICON[intg.status].icon;
          const stColor = STATUS_ICON[intg.status].color;
          const stLabel = STATUS_ICON[intg.status].label;
          return (
            <div key={intg.id} style={{ background:"var(--bg-card)", border:`1px solid ${intg.status==="connected"?"rgba(34,197,94,0.18)":"var(--border)"}`, borderRadius:16, padding:"18px" }}>
              {/* Top row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:13, background:intg.bg, border:`1px solid ${intg.color}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={20} color={intg.color} />
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5, background:`${stColor}15`, border:`1px solid ${stColor}35`, borderRadius:20, padding:"4px 10px" }}>
                  <StIcon size={10} color={stColor} />
                  <span style={{ color:stColor, fontSize:10, fontWeight:600 }}>{stLabel}</span>
                </div>
              </div>

              {/* Name + desc */}
              <p style={{ color:"#fff", fontSize:14, fontWeight:700, marginBottom:3 }}>{intg.name}</p>
              <p style={{ color:"#6b7280", fontSize:11, marginBottom:10 }}>{intg.desc}</p>

              {/* Detail */}
              <p style={{ color:"#4b5563", fontSize:11, lineHeight:1.5, marginBottom:12 }}>{intg.detail}</p>

              {/* Last sync */}
              {intg.lastSync && intg.status !== "disconnected" && (
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                  <RefreshCw size={10} color="#4b5563" />
                  <span style={{ color:"#4b5563", fontSize:10 }}>Last sync: {intg.lastSync}</span>
                </div>
              )}

              {/* Action button */}
              <button style={{
                width:"100%", padding:"9px 0", borderRadius:10,
                background: intg.status==="connected" ? "rgba(255,255,255,0.04)" : `${intg.color}18`,
                border: intg.status==="connected" ? "1px solid var(--border)" : `1px solid ${intg.color}40`,
                color: intg.status==="connected" ? "#6b7280" : intg.color,
                fontSize:11, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              }}>
                {intg.status==="connected" ? (
                  <><RefreshCw size={11} color="#6b7280" /> Manage</>
                ) : (
                  <><ExternalLink size={11} color={intg.color} /> Connect</>
                )}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
