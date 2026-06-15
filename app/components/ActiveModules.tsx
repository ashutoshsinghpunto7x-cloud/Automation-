"use client";
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";

function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      style={{
        width:36, height:20, borderRadius:10,
        background: on ? "#3b82f6" : "#374151",
        position:"relative", flexShrink:0,
        transition:"background 0.2s",
      }}
    >
      <div
        style={{
          position:"absolute", top:2,
          left: on ? 18 : 2,
          width:16, height:16, borderRadius:"50%",
          background:"#fff",
          boxShadow:"0 1px 3px rgba(0,0,0,0.35)",
          transition:"left 0.2s",
        }}
      />
    </button>
  );
}

function IconBox() {
  return (
    <div
      style={{
        width:28, height:28, borderRadius:8,
        background:"var(--bg-inner)",
        border:"1px solid var(--border-md)",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0,
      }}
    >
      <div style={{ width:12, height:12, border:"1.5px solid #6b7280", borderRadius:3 }} />
    </div>
  );
}

interface ModCardProps {
  title: string;
  sub: string;
  subColor?: string;
  on: boolean;
  toggle: () => void;
}
function ModCard({ title, sub, subColor = "var(--text-3)", on, toggle }: ModCardProps) {
  return (
    <div
      style={{
        background:"var(--bg-card)",
        border:"1px solid var(--border)",
        borderRadius:18, padding:16,
      }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
        <IconBox />
        <Toggle on={on} toggle={toggle} />
      </div>
      <p style={{ color:"var(--text-1)", fontSize:13, fontWeight:500, marginBottom:3 }}>{title}</p>
      <p style={{ color:subColor, fontSize:11 }}>{sub}</p>
    </div>
  );
}

export default function ActiveModules() {
  const [t, setT] = useState({
    agent: true, campaign: true, leads: false,
    voice: true, queue: true, integrations: true,
  });
  const tog = (k: keyof typeof t) => setT((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ color:"var(--text-3)", fontSize:11, letterSpacing:"0.09em", fontWeight:600 }}>
          ACTIVE MODULES
        </span>
        <div style={{ display:"flex", gap:6 }}>
          {[LayoutGrid, List].map((Icon, i) => (
            <button
              key={i}
              style={{
                width:28, height:28, borderRadius:8,
                background:"var(--bg-card)",
                border:"1px solid var(--border)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}
            >
              <Icon size={12} color="var(--text-3)" />
            </button>
          ))}
        </div>
      </div>

      {/* Row 1 — 4 equal cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:12 }}>
        <ModCard title="Agent Status"  sub="Online · Healthy"    subColor="#22c55e" on={t.agent}    toggle={() => tog("agent")} />
        <ModCard title="Campaign"      sub="Shalimar City Q2"                       on={t.campaign} toggle={() => tog("campaign")} />
        <ModCard title="Active Leads"  sub="247 in pipeline"                        on={t.leads}    toggle={() => tog("leads")} />
        <ModCard title="Voice Models"  sub="3 active"                               on={t.voice}    toggle={() => tog("voice")} />
      </div>

      {/* Row 2 — 2 small + 1 wide (spanning 2 cols) */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>

        {/* Call Queue */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:18, padding:16 }}>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
            <Toggle on={t.queue} toggle={() => tog("queue")} />
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"var(--bg-inner)", border:"1px solid var(--border-md)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:12, height:12, border:"1.5px solid #6b7280", borderRadius:3 }} />
            </div>
            <span style={{ color:"var(--text-1)", fontSize:28, fontWeight:700, lineHeight:1 }}>38</span>
            <span style={{ color:"var(--text-3)", fontSize:11 }}>slots</span>
            <div style={{ width:28, height:28, borderRadius:8, background:"var(--bg-inner)", border:"1px solid var(--border-md)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:12, height:12, border:"1.5px solid #6b7280", borderRadius:3 }} />
            </div>
          </div>
          <p style={{ color:"var(--text-1)", fontSize:12, fontWeight:500, marginBottom:2 }}>Call Queue</p>
          <p style={{ color:"var(--text-3)", fontSize:11 }}>Live: 14 / 38</p>
        </div>

        {/* Integrations */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:18, padding:16 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
            <IconBox />
            <Toggle on={t.integrations} toggle={() => tog("integrations")} />
          </div>
          <p style={{ color:"var(--text-1)", fontSize:12, fontWeight:500, marginBottom:2 }}>Integrations</p>
          <p style={{ color:"#22c55e", fontSize:11, marginBottom:10 }}>5 connected</p>
          <div style={{ display:"flex", gap:6 }}>
            {["#22c55e","#3b82f6","#f59e0b"].map((c) => (
              <div
                key={c}
                style={{
                  width:22, height:22, borderRadius:6,
                  background:`${c}22`,
                  border:`1px solid ${c}55`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}
              >
                <div style={{ width:9, height:9, background:c, borderRadius:2 }} />
              </div>
            ))}
          </div>
        </div>

        {/* CRM Sync + Cost Tracker — spans 2 cols */}
        <div
          style={{
            gridColumn:"span 2",
            background:"var(--bg-card)",
            border:"1px solid var(--border)",
            borderRadius:18, padding:"14px 18px",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
          }}
        >
          {/* CRM Sync */}
          <div
            style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              paddingBottom:12, borderBottom:"1px solid var(--border)",
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"var(--bg-inner)", border:"1px solid var(--border-md)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:14, height:14, border:"1.5px solid #6b7280", borderRadius:3 }} />
              </div>
              <div>
                <p style={{ color:"var(--text-1)", fontSize:13, fontWeight:500, marginBottom:2 }}>CRM Sync</p>
                <p style={{ color:"var(--text-3)", fontSize:11 }}>Last synced 12 sec ago</p>
              </div>
            </div>
            <span style={{ color:"#3b82f6", fontSize:14, fontWeight:700 }}>247 Records</span>
          </div>

          {/* Cost Tracker */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"var(--bg-inner)", border:"1px solid var(--border-md)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:14, height:14, border:"1.5px solid #6b7280", borderRadius:3 }} />
              </div>
              <div>
                <p style={{ color:"var(--text-1)", fontSize:13, fontWeight:500, marginBottom:2 }}>Cost Tracker</p>
                <p style={{ color:"var(--text-3)", fontSize:11 }}>June spend · Budget ₹12k</p>
              </div>
            </div>
            <span style={{ color:"#22c55e", fontSize:14, fontWeight:700 }}>₹4,820</span>
          </div>
        </div>

      </div>
    </div>
  );
}
