"use client";
import { Bell, HelpCircle, ChevronDown, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [inProgress, setInProgress] = useState<number|null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.stats) setInProgress(data.stats.inProgress);
      } catch { /* keep prev */ }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav style={{
      background:"var(--bg-nav)",
      borderBottom:"1px solid var(--border)",
      height:52,
      display:"flex", alignItems:"center",
      padding:"0 16px",
      gap:10,
      flexShrink:0,
    }}>
      {/* ── Logo ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:8, flexShrink:0 }}>
        <div style={{
          width:28, height:28, borderRadius:8,
          background:"linear-gradient(135deg,#2563eb,#4f46e5)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {/* 2x2 grid logo */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#fff"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#fff" opacity="0.6"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#fff" opacity="0.6"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#fff" opacity="0.3"/>
          </svg>
        </div>
        <span style={{ fontWeight:700, fontSize:15, color:"#fff", letterSpacing:"-0.01em" }}>VoxCall™</span>
      </div>

      {/* ── Search ── */}
      <div style={{
        width:210,
        background:"var(--bg-inner)",
        border:"1px solid var(--border-md)",
        borderRadius:22, display:"flex", alignItems:"center",
        gap:8, padding:"0 12px", height:32, flexShrink:0,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="#6b7280" strokeWidth="1.4"/>
          <path d="M8.2 8.2L10.5 10.5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span style={{ color:"#4b5563", fontSize:11, flex:1 }}>Search anything...</span>
        <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:4, padding:"1px 5px" }}>
          <span style={{ color:"#374151", fontSize:10 }}>⌘ K</span>
        </div>
      </div>

      <div style={{ flex:1 }} />

      {/* ── Active Calls chip ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--bg-inner)", border:"1px solid var(--border-md)", borderRadius:22, padding:"0 12px", height:30, flexShrink:0 }}>
        <div style={{ width:22, height:22, borderRadius:7, background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.30)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 2C2 2 2.5 5.5 5.5 8.5C8.5 11.5 12 9 12 9L10 7L8.5 7.5L6.5 5.5L7 4L5 2H2Z" fill="#22c55e" transform="scale(0.75)"/>
          </svg>
        </div>
        <span style={{ color:"#9ca3af", fontSize:11 }}>Active Calls</span>
        <span style={{ color:"#fff", fontSize:14, fontWeight:700 }}>{inProgress ?? "--"}</span>
      </div>

      {/* ── AI Health chip ── */}
      <div style={{ display:"flex", alignItems:"center", gap:7, background:"var(--bg-inner)", border:"1px solid var(--border-md)", borderRadius:22, padding:"0 12px", height:30, flexShrink:0 }}>
        <Activity size={13} color="#22c55e" />
        <span style={{ color:"#9ca3af", fontSize:11 }}>AI Health</span>
        <span style={{ color:"#22c55e", fontSize:12, fontWeight:600 }}>Healthy</span>
        <ChevronDown size={11} color="#6b7280" />
      </div>

      {/* ── Campaign chip ── */}
      <div style={{ display:"flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,rgba(59,130,246,0.14),rgba(99,102,241,0.14))", border:"1px solid rgba(99,102,241,0.30)", borderRadius:22, padding:"0 12px", height:30, flexShrink:0 }}>
        <div style={{ width:18, height:18, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#fff", opacity:0.8 }} />
        </div>
        <span style={{ color:"#9ca3af", fontSize:11 }}>Campaign</span>
        <span style={{ color:"#fff", fontSize:11, fontWeight:600 }}>Shalimar City Q2</span>
        <ChevronDown size={11} color="#6b7280" />
      </div>

      {/* ── Bell ── */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <button style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg-inner)", border:"1px solid var(--border-md)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Bell size={14} color="#9ca3af" />
        </button>
        <div style={{ position:"absolute", top:-1, right:-1, width:17, height:17, borderRadius:"50%", background:"#ef4444", border:"2px solid var(--bg-nav)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:"#fff", fontSize:8, fontWeight:700 }}>3</span>
        </div>
      </div>

      {/* ── Help ── */}
      <button style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg-inner)", border:"1px solid var(--border-md)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <HelpCircle size={14} color="#9ca3af" />
      </button>

      {/* ── User ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>EK</span>
        </div>
        <div>
          <p style={{ color:"#fff", fontSize:12, fontWeight:600, lineHeight:1.2 }}>Ekansh Saxena</p>
          <p style={{ color:"#6b7280", fontSize:10, lineHeight:1.2 }}>Admin</p>
        </div>
        <ChevronDown size={12} color="#6b7280" />
      </div>
    </nav>
  );
}
