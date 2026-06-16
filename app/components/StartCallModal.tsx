"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Search, X, User, ChevronDown, Loader } from "lucide-react";

interface Lead { [key: string]: string }

interface Props {
  onClose: () => void;
  onCallStarted: () => void;
}

export default function StartCallModal({ onClose, onCallStarted }: Props) {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [query, setQuery]         = useState("");
  const [selected, setSelected]   = useState<Lead | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [mode, setMode]           = useState<"pick" | "manual">("pick");
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(d => {
      setLeads(d.leads ?? []);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = leads.filter(l => {
    const name  = (l["Full Name"] || l["Name"] || "").toLowerCase();
    const phone = (l["Phone Number"] || l["Phone"] || "").toLowerCase();
    return name.includes(query.toLowerCase()) || phone.includes(query.toLowerCase());
  });

  const callName  = mode === "pick" ? (selected?.["Full Name"] || selected?.["Name"] || "") : manualName;
  const callPhone = mode === "pick" ? (selected?.["Phone Number"] || selected?.["Phone"] || "") : manualPhone;
  const canCall   = callPhone.replace(/\D/g, "").length >= 10;

  const handleCall = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vapi/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: callName, phone: callPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Call failed");
      setSuccess(true);
      setTimeout(() => { onCallStarted(); onClose(); }, 1800);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        style={{
          width: 420, background: "#1a1b26",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 20px 14px",
          background: "linear-gradient(135deg,rgba(34,197,94,0.15),rgba(59,130,246,0.08))",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Phone size={16} color="#22c55e" />
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Start New Call</p>
              <p style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}>Initiate Vapi AI call directly</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <div style={{ padding: "18px 20px 20px" }}>
          {/* Mode toggle */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.05)",
            borderRadius: 10, padding: 3, marginBottom: 16,
          }}>
            {(["pick", "manual"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setSelected(null); setError(""); }}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 8, border: "none",
                  background: mode === m ? "#3b82f6" : "transparent",
                  color: mode === m ? "#fff" : "#6b7280",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}>
                {m === "pick" ? "📋  Pick from Leads" : "✏️  Enter Manually"}
              </button>
            ))}
          </div>

          {mode === "pick" ? (
            <div ref={dropRef} style={{ marginBottom: 14 }}>
              <label style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>
                SELECT LEAD
              </label>
              {/* Dropdown trigger */}
              <button
                onClick={() => setDropOpen(o => !o)}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, color: selected ? "#fff" : "#6b7280",
                  fontSize: 13, cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                <span>
                  {selected
                    ? `${selected["Full Name"] || selected["Name"]} · ${selected["Phone Number"] || selected["Phone"]}`
                    : fetching ? "Loading leads..." : "Search and select a lead..."}
                </span>
                <ChevronDown size={14} color="#6b7280" />
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    style={{
                      position: "absolute", width: 380, maxHeight: 260, overflowY: "auto",
                      background: "#252731", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12, zIndex: 100, marginTop: 4,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    }}>
                    {/* Search inside dropdown */}
                    <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Search size={12} color="#6b7280" />
                      <input
                        autoFocus
                        value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search by name or phone..."
                        style={{
                          flex: 1, background: "none", border: "none", outline: "none",
                          color: "#fff", fontSize: 12,
                        }}
                      />
                    </div>
                    {filtered.length === 0 ? (
                      <p style={{ color: "#6b7280", fontSize: 12, padding: "14px 16px" }}>No leads found.</p>
                    ) : filtered.slice(0, 30).map((l, i) => {
                      const name  = l["Full Name"] || l["Name"] || "Unknown";
                      const phone = l["Phone Number"] || l["Phone"] || "--";
                      const status = l["Call Status"] || "";
                      return (
                        <button key={i}
                          onClick={() => { setSelected(l); setDropOpen(false); setQuery(""); }}
                          style={{
                            width: "100%", padding: "10px 14px", border: "none",
                            background: selected === l ? "rgba(59,130,246,0.15)" : "transparent",
                            cursor: "pointer", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.04)",
                            display: "flex", alignItems: "center", gap: 10,
                          }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>
                              {name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                            </span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{name}</p>
                            <p style={{ color: "#6b7280", fontSize: 11 }}>{phone}
                              {status && <span style={{ marginLeft: 8, color: "#f59e0b", fontSize: 10 }}>{status}</span>}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>NAME (OPTIONAL)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px" }}>
                  <User size={13} color="#6b7280" />
                  <input value={manualName} onChange={e => setManualName(e.target.value)}
                    placeholder="Customer name"
                    style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13 }} />
                </div>
              </div>
              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>PHONE NUMBER *</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px" }}>
                  <Phone size={13} color="#6b7280" />
                  <span style={{ color: "#6b7280", fontSize: 13 }}>+91</span>
                  <input value={manualPhone} onChange={e => setManualPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210" maxLength={10}
                    style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13 }} />
                </div>
              </div>
            </div>
          )}

          {/* Selected lead preview */}
          {mode === "pick" && selected && (
            <div style={{
              padding: "10px 14px", background: "rgba(34,197,94,0.07)",
              border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, marginBottom: 14,
            }}>
              <p style={{ color: "#22c55e", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>SELECTED LEAD</p>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{callName}</p>
              <p style={{ color: "#9ca3af", fontSize: 12 }}>{callPhone}</p>
              {selected["Property Type"] && <p style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{selected["Property Type"]} · {selected["Location"] || selected["City"] || ""}</p>}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, marginBottom: 14 }}>
              <p style={{ color: "#ef4444", fontSize: 12 }}>{error}</p>
              {error.includes("env") && (
                <p style={{ color: "#9ca3af", fontSize: 11, marginTop: 4 }}>
                  Add VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PHONE_NUMBER_ID to Vercel environment variables.
                </p>
              )}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, marginBottom: 14 }}>
              <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>✓ Call initiated! Connecting...</p>
            </div>
          )}

          {/* Call button */}
          <motion.button
            whileHover={canCall && !loading ? { scale: 1.02 } : {}}
            whileTap={canCall && !loading ? { scale: 0.98 } : {}}
            onClick={handleCall}
            disabled={!canCall || loading || success}
            style={{
              width: "100%", padding: "13px 0",
              background: canCall && !success
                ? "linear-gradient(135deg,#16a34a,#22c55e)"
                : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: 12,
              color: canCall && !success ? "#fff" : "#4b5563",
              fontSize: 14, fontWeight: 700, cursor: canCall && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}>
            {loading
              ? <><Loader size={16} className="spin" /> Connecting...</>
              : success
              ? "✓ Call Started"
              : <><Phone size={15} /> Call {callName || callPhone || "—"}</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
