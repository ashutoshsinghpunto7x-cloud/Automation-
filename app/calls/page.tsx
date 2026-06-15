"use client";
import { useState, useEffect } from "react";
import { Phone, PhoneOff, PhoneMissed, PhoneIncoming, Search, Filter, RefreshCw, Clock, MapPin, Home } from "lucide-react";

interface Lead { [key: string]: string; }

const STATUS_MAP: Record<string, { label:string; color:string; bg:string; icon:typeof Phone }> = {
  "call in progress": { label:"In Progress", color:"#22c55e", bg:"rgba(34,197,94,0.12)",  icon:Phone       },
  "calling...":       { label:"Calling",      color:"#3b82f6", bg:"rgba(59,130,246,0.12)", icon:PhoneIncoming},
  "silence-timed-out":{ label:"No Answer",    color:"#f59e0b", bg:"rgba(245,158,11,0.12)", icon:PhoneMissed  },
  "customer-ended-call":{ label:"Completed",  color:"#22c55e", bg:"rgba(34,197,94,0.12)", icon:PhoneOff     },
  "api error - retry needed":{ label:"Pending",color:"#f59e0b",bg:"rgba(245,158,11,0.12)",icon:RefreshCw    },
};

function getStatus(raw: string) {
  const key = raw.toLowerCase().trim();
  return STATUS_MAP[key] ?? { label:"Pending", color:"#f59e0b", bg:"rgba(245,158,11,0.12)", icon:Clock };
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";
}

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#22c55e","#ef4444","#06b6d4","#ec4899"];

const FILTERS = ["All","In Progress","Completed","Pending","No Answer"];

export default function CallsPage() {
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("All");
  const [updated, setUpdated] = useState("");

  const load = async () => {
    try {
      const res  = await fetch("/api/leads");
      const data = await res.json();
      if (data.leads) { setLeads(data.leads); setUpdated(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t=setInterval(load,30_000); return()=>clearInterval(t); }, []);

  const filtered = leads.filter(l => {
    const name = (l["Full Name"]||l["Name"]||"").toLowerCase();
    const phone = (l["Phone Number"]||l["Phone"]||"").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
    const st = getStatus(l["Call Status"]||"").label;
    const matchFilter =
      filter==="All"         ? true :
      filter==="In Progress" ? st==="In Progress" || st==="Calling" :
      filter==="Completed"   ? st==="Completed" :
      filter==="Pending"     ? st==="Pending" :
      filter==="No Answer"   ? st==="No Answer" : true;
    return matchSearch && matchFilter;
  });

  /* Stats */
  const total      = leads.length;
  const inProgress = leads.filter(l=>getStatus(l["Call Status"]||"").label==="In Progress"||getStatus(l["Call Status"]||"").label==="Calling").length;
  const completed  = leads.filter(l=>getStatus(l["Call Status"]||"").label==="Completed").length;
  const pending    = leads.filter(l=>getStatus(l["Call Status"]||"").label==="Pending").length;
  const noAnswer   = leads.filter(l=>getStatus(l["Call Status"]||"").label==="No Answer").length;

  const STATS = [
    { label:"Total Calls",  value:total,      color:"#fff",     bg:"rgba(59,130,246,0.12)",  icon:Phone       },
    { label:"In Progress",  value:inProgress, color:"#22c55e",  bg:"rgba(34,197,94,0.12)",   icon:PhoneIncoming},
    { label:"Completed",    value:completed,  color:"#3b82f6",  bg:"rgba(59,130,246,0.12)",  icon:PhoneOff    },
    { label:"Pending",      value:pending,    color:"#f59e0b",  bg:"rgba(245,158,11,0.12)",  icon:Clock       },
    { label:"No Answer",    value:noAnswer,   color:"#ef4444",  bg:"rgba(239,68,68,0.12)",   icon:PhoneMissed },
  ];

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"16px 20px", background:"var(--bg-base)", display:"flex", flexDirection:"column", gap:14 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ color:"#fff", fontSize:20, fontWeight:700, marginBottom:2 }}>Call Log</h1>
          <p style={{ color:"#6b7280", fontSize:12 }}>All AI agent call records from Google Sheets</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {updated && <span style={{ color:"#374151", fontSize:10 }}>Updated {updated}</span>}
          <button onClick={load} style={{ width:32, height:32, borderRadius:9, background:"var(--bg-card)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <RefreshCw size={13} color="#6b7280" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
        {STATS.map(({ label, value, color, bg, icon:Icon }) => (
          <div key={label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <p style={{ color:"#fff", fontSize:22, fontWeight:700, lineHeight:1 }}>{loading?"--":value}</p>
              <p style={{ color:"#6b7280", fontSize:10, fontWeight:600, marginTop:2 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ flex:1, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:22, display:"flex", alignItems:"center", gap:8, padding:"0 14px", height:36 }}>
          <Search size={13} color="#6b7280" />
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            style={{ background:"none", color:"#fff", fontSize:12, flex:1, outline:"none" }}
          />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:600,
              background: filter===f ? "rgba(59,130,246,0.18)" : "var(--bg-card)",
              border: filter===f ? "1px solid rgba(59,130,246,0.40)" : "1px solid var(--border)",
              color: filter===f ? "#60a5fa" : "#6b7280",
              transition:"all 0.15s",
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, color:"#6b7280", fontSize:11 }}>
          <Filter size={12} />
          <span>{filtered.length} calls</span>
        </div>
      </div>

      {/* Call list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {loading ? (
          Array.from({length:6}).map((_,i) => (
            <div key={i} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:14, padding:"14px 18px", height:70, opacity:0.4 }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"40px", textAlign:"center" }}>
            <PhoneMissed size={32} color="#374151" style={{ margin:"0 auto 10px" }} />
            <p style={{ color:"#4b5563", fontSize:14 }}>No calls found</p>
          </div>
        ) : filtered.map((lead, i) => {
          const name     = lead["Full Name"] || lead["Name"] || "Unknown";
          const phone    = lead["Phone Number"] || lead["Phone"] || "--";
          const property = lead["Property Type"] || lead["Property"] || "--";
          const location = lead["Location"] || lead["City"] || "--";
          const rawSt    = lead["Call Status"] || "";
          const { label, color, bg, icon:StIcon } = getStatus(rawSt);
          const avColor  = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const ts       = lead["Timestamp"] || lead["Date"] || "";

          return (
            <div key={i} style={{
              background:"var(--bg-card)", border:"1px solid var(--border)",
              borderRadius:14, padding:"12px 18px",
              display:"flex", alignItems:"center", gap:14,
              transition:"border-color 0.15s",
            }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(59,130,246,0.3)")}
              onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}
            >
              {/* Avatar */}
              <div style={{ width:42, height:42, borderRadius:"50%", background:avColor+"22", border:`1.5px solid ${avColor}55`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ color:avColor, fontSize:13, fontWeight:700 }}>{getInitials(name)}</span>
              </div>

              {/* Name + phone */}
              <div style={{ width:180, flexShrink:0 }}>
                <p style={{ color:"#fff", fontSize:13, fontWeight:600, marginBottom:3 }}>{name}</p>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <Phone size={10} color="#6b7280" />
                  <span style={{ color:"#6b7280", fontSize:11 }}>{phone}</span>
                </div>
              </div>

              {/* Property */}
              <div style={{ width:120, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                  <Home size={10} color="#6b7280" />
                  <span style={{ color:"#9ca3af", fontSize:11 }}>{property}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <MapPin size={10} color="#6b7280" />
                  <span style={{ color:"#6b7280", fontSize:10 }}>{location}</span>
                </div>
              </div>

              {/* Interested */}
              <div style={{ width:80, flexShrink:0 }}>
                <p style={{ color:"#6b7280", fontSize:9, fontWeight:600, marginBottom:2 }}>INTERESTED</p>
                <p style={{ color:(lead["Intrested"]||lead["Interested"]||"").toUpperCase()==="TRUE"?"#22c55e":"#4b5563", fontSize:11, fontWeight:600 }}>
                  {(lead["Intrested"]||lead["Interested"]||"--").toUpperCase()==="TRUE"?"Yes":"No"}
                </p>
              </div>

              {/* Timestamp */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:"#6b7280", fontSize:9, fontWeight:600, marginBottom:2 }}>TIMESTAMP</p>
                <p style={{ color:"#9ca3af", fontSize:11 }}>{ts || "--"}</p>
              </div>

              {/* Status badge */}
              <div style={{ background:bg, border:`1px solid ${color}44`, borderRadius:20, padding:"5px 12px", display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                <StIcon size={11} color={color} />
                <span style={{ color, fontSize:11, fontWeight:600 }}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
