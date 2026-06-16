"use client";
import { useState, useEffect, useRef } from "react";

interface TranscriptMsg {
  role: "ai" | "user";
  text: string;
  time: string;
}

interface CallState {
  active: boolean;
  callId: string;
  callerName: string;
  messages: TranscriptMsg[];
  summary: string | null;
  endedAt: string | null;
  sentiment: string;
  intent: string;
  language: string;
  noise: string;
}

function ChatWaveBars({ color="#3b82f6", count=8 }: { color?:string; count?:number }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2 }}>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} className="chat-wave-bar" style={{ background:`linear-gradient(to top,${color}99,${color})` }} />
      ))}
    </div>
  );
}

function AIAvatar() {
  return (
    <div style={{
      width:32, height:32, borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#1d4ed8,#4338ca)",
      display:"flex", alignItems:"center", justifyContent:"center",
      border:"1.5px solid rgba(99,102,241,0.4)",
      boxShadow:"0 0 10px rgba(59,130,246,0.25)",
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="4" width="10" height="8" rx="2" fill="#fff" opacity="0.85"/>
        <rect x="4" y="2" width="6" height="3" rx="1" fill="#fff" opacity="0.7"/>
        <circle cx="5" cy="8" r="1.5" fill="#3b82f6"/>
        <circle cx="9" cy="8" r="1.5" fill="#3b82f6"/>
        <rect x="5.5" y="10.5" width="3" height="1" rx="0.5" fill="#3b82f6"/>
        <rect x="0" y="6" width="2" height="3" rx="1" fill="#fff" opacity="0.5"/>
        <rect x="12" y="6" width="2" height="3" rx="1" fill="#fff" opacity="0.5"/>
      </svg>
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0,2).map((w:string)=>w[0]).join("").toUpperCase() || "?";
  return (
    <div style={{
      width:32, height:32, borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#1e40af,#1d4ed8)",
      display:"flex", alignItems:"center", justifyContent:"center",
      border:"1.5px solid rgba(59,130,246,0.3)",
    }}>
      <span style={{ color:"#fff", fontSize:10, fontWeight:700 }}>{initials}</span>
    </div>
  );
}

/* Idle / no call state */
function IdleState() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
      <div style={{ width:50, height:50, borderRadius:"50%", background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <AIAvatar />
      </div>
      <p style={{ color:"#4b5563", fontSize:13, fontWeight:500 }}>No active call</p>
      <p style={{ color:"#374151", fontSize:11, textAlign:"center" }}>Live transcript will appear here when a Vapi call starts</p>
    </div>
  );
}

/* Call ended — show summary */
function SummaryState({ summary, name, msgs }: { summary:string; name:string; msgs:TranscriptMsg[] }) {
  return (
    <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
      {/* Call ended badge */}
      <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.20)", borderRadius:10, padding:"10px 14px", marginBottom:4 }}>
        <p style={{ color:"#22c55e", fontSize:11, fontWeight:700, marginBottom:4 }}>CALL ENDED — SUMMARY</p>
        <p style={{ color:"#9ca3af", fontSize:12, lineHeight:1.6 }}>{summary || "No summary available."}</p>
      </div>
      {/* Last messages */}
      {msgs.slice(-4).map((msg, i) => (
        <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          {msg.role==="ai" ? <AIAvatar /> : <UserAvatar name={name} />}
          <div style={{ flex:1 }}>
            <span style={{ color:msg.role==="ai"?"#60a5fa":"#9ca3af", fontSize:10, fontWeight:600 }}>
              {msg.role==="ai"?"AI Agent":name}
            </span>
            <span style={{ color:"#374151", fontSize:10, marginLeft:6 }}>{msg.time}</span>
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"8px 12px", marginTop:4 }}>
              <p style={{ color:"#6b7280", fontSize:12, lineHeight:1.6 }}>{msg.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LiveConversation() {
  const [call, setCall]       = useState<CallState|null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("/api/vapi/live");
        const data = await res.json();
        setCall(data);
      } catch { /* keep prev */ }
      finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 2_000); // poll every 2 seconds
    return () => clearInterval(t);
  }, []);

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [call?.messages.length]);

  const isActive  = call?.active === true;
  const hasEnded  = !isActive && !!call?.endedAt;
  const msgs      = call?.messages ?? [];
  const callerName = call?.callerName || "Caller";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ color:"#6b7280", fontSize:10, fontWeight:700, letterSpacing:"0.09em" }}>LIVE CONVERSATION</span>
        <button style={{
          background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)",
          borderRadius:6, padding:"3px 10px",
          color:"#60a5fa", fontSize:10, fontWeight:600,
          display:"flex", alignItems:"center", gap:5,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1h8M1 4h6M1 7h4" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Transcript
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:"#374151", fontSize:12 }}>Loading...</span>
        </div>
      ) : hasEnded && call?.summary ? (
        <SummaryState summary={call.summary} name={callerName} msgs={msgs} />
      ) : msgs.length === 0 ? (
        <IdleState />
      ) : (
        /* Live messages */
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:14 }}>
          {msgs.map((msg, i) => {
            const isAI = msg.role === "ai";
            const isLast = i === msgs.length - 1;
            return (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                {isAI ? <AIAvatar /> : <UserAvatar name={callerName} />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ color:isAI?"#60a5fa":"#9ca3af", fontSize:11, fontWeight:600 }}>
                        {isAI?"AI Agent":callerName}
                      </span>
                      <span style={{ color:"#374151", fontSize:10 }}>{msg.time}</span>
                    </div>
                    {isAI && isLast && isActive && <ChatWaveBars color="#3b82f6" count={12} />}
                  </div>
                  <div style={{
                    background:isAI?"rgba(59,130,246,0.09)":"rgba(255,255,255,0.03)",
                    border:isAI?"1px solid rgba(59,130,246,0.18)":"1px solid rgba(255,255,255,0.06)",
                    borderRadius:isAI?"4px 14px 14px 14px":"14px 4px 14px 14px",
                    padding:"10px 13px",
                  }}>
                    <p style={{ color:"#9ca3af", fontSize:12, lineHeight:1.65 }}>{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* AI speaking bar — only when active */}
      {isActive && (
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          margin:"10px 0 0", padding:"9px 14px",
          background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.14)",
          borderRadius:10,
        }}>
          <AIAvatar />
          <span style={{ color:"#6b7280", fontSize:12 }}>AI is speaking...</span>
          <div style={{ flex:1 }}>
            <ChatWaveBars color="#3b82f6" count={20} />
          </div>
        </div>
      )}

      {/* Footer: Sentiment row */}
      <div style={{ display:"flex", gap:0, marginTop:10, paddingTop:10, borderTop:"1px solid var(--border)" }}>
        {[
          { label:"Sentiment",   value:call?.sentiment||"--",  color: call?.sentiment==="Positive"?"#22c55e":call?.sentiment==="Negative"?"#ef4444":"#9ca3af" },
          { label:"Intent",      value:call?.intent||"--",     color:"#3b82f6" },
          { label:"Language",    value:call?.language||"--",   color:"#9ca3af" },
          { label:"Noise Level", value:call?.noise||"--",      color: call?.noise==="Low"?"#22c55e":"#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex:1 }}>
            <p style={{ color:"#374151", fontSize:9, fontWeight:600, letterSpacing:"0.06em", marginBottom:2 }}>{label}</p>
            <p style={{ color, fontSize:11, fontWeight:600 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
