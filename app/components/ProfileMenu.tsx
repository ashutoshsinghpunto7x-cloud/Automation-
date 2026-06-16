"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Settings as SettingsIcon, Bell, Moon, HelpCircle, FileText, LogOut,
  ChevronRight, Mail, Briefcase, Shield, Sparkles,
} from "lucide-react";

const BD = "rgba(255,255,255,0.07)";
const BG = "#1E1F25";

interface Props {
  /** Compact (header avatar) or wide (sidebar pill) — defaults compact */
  variant?: "compact" | "wide";
}

const USER = {
  name: "Varun Shukla",
  role: "Admin",
  email: "varun.shukla@shalimardevelopers.com",
  company: "Shalimar Developers",
  initials: "VS",
};

export default function ProfileMenu({ variant = "compact" }: Props) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onEsc); };
  }, []);

  const MENU = [
    { icon: User,        label: "My Profile",        hint: "Personal info" },
    { icon: SettingsIcon,label: "Account Settings",  hint: "Preferences"   },
    { icon: Bell,        label: "Notifications",     hint: "Manage alerts" },
    { icon: Shield,      label: "Security & Privacy",hint: "2FA · Sessions"},
    { icon: FileText,    label: "Activity Log",      hint: "Recent actions"},
    { icon: HelpCircle,  label: "Help & Support",    hint: "Docs · Contact"},
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {variant === "compact" ? (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(o => !o)}
          style={{
            width: 44, height: 44, borderRadius: 50, border: "none",
            background: "linear-gradient(135deg,#29A8FF,#3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
            cursor: "pointer", position: "relative",
            boxShadow: open ? "0 0 0 3px rgba(41,168,255,0.35)" : "none",
            transition: "box-shadow 0.2s",
          }}>
          {USER.initials}
          <span style={{
            position: "absolute", bottom: 1, right: 1,
            width: 11, height: 11, borderRadius: "50%",
            background: "#35D07F", border: "2px solid #1E1F25",
          }}/>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.04)", border: `1px solid ${BD}`,
            borderRadius: 14, padding: "8px 12px", cursor: "pointer",
          }}>
          <div style={{
            width: 34, height: 34, borderRadius: 11,
            background: "linear-gradient(135deg,#29A8FF,#3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 12,
          }}>{USER.initials}</div>
          <div style={{ textAlign: "left" }}>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{USER.name}</p>
            <p style={{ color: "#8F8F8F", fontSize: 10 }}>{USER.role}</p>
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 296, background: "#252731", border: `1px solid ${BD}`,
              borderRadius: 18, zIndex: 1000, overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5),-4px -4px 15px rgba(255,255,255,0.03),0 0 30px rgba(59,130,246,0.12)",
            }}>
            {/* Header */}
            <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${BD}`,
              background: "linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.08))" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "linear-gradient(135deg,#29A8FF,#3B82F6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 16,
                  }}>{USER.initials}</div>
                  <span style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 14, height: 14, borderRadius: "50%",
                    background: "#35D07F", border: "2.5px solid #252731",
                  }}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{USER.name}</p>
                  <p style={{ color: "#8F8F8F", fontSize: 11, marginTop: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{USER.email}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(53,208,127,0.18)", color: "#35D07F",
                    padding: "2px 8px", borderRadius: 20, marginTop: 6, fontSize: 10, fontWeight: 600 }}>
                    <Shield size={9}/>{USER.role}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: "8px 10px", background: "rgba(0,0,0,0.25)",
                borderRadius: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Briefcase size={11} color="#8F8F8F"/>
                <span style={{ color: "#C5C5C5", fontSize: 11 }}>{USER.company}</span>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "8px 6px" }}>
              {MENU.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    whileHover={{ background: "rgba(255,255,255,0.06)" }}
                    onClick={() => setOpen(false)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 10, border: "none",
                      background: "transparent", cursor: "pointer", textAlign: "left",
                    }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={13} color="#C5C5C5"/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>{item.label}</p>
                      <p style={{ color: "#8F8F8F", fontSize: 10, marginTop: 1 }}>{item.hint}</p>
                    </div>
                    <ChevronRight size={12} color="#5E6373"/>
                  </motion.button>
                );
              })}
            </div>

            {/* Dark mode toggle */}
            <div style={{ padding: "0 12px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Moon size={13} color="#C5C5C5"/>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>Dark mode</span>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setDark(d => !d)}
                  style={{ width: 38, height: 22, borderRadius: 11, border: "none",
                    background: dark ? "#3B82F6" : "#3a3d48", position: "relative", cursor: "pointer" }}>
                  <motion.span initial={false} animate={{ left: dark ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ position: "absolute", top: 2, width: 18, height: 18,
                      borderRadius: "50%", background: "#fff" }}/>
                </motion.button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "8px 6px 10px", borderTop: `1px solid ${BD}` }}>
              <motion.button
                whileHover={{ background: "rgba(255,107,107,0.1)" }}
                onClick={() => setOpen(false)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 10, border: "none",
                  background: "transparent", cursor: "pointer", textAlign: "left",
                }}>
                <div style={{ width: 28, height: 28, borderRadius: 8,
                  background: "rgba(255,107,107,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogOut size={13} color="#FF6B6B"/>
                </div>
                <span style={{ color: "#FF6B6B", fontSize: 12, fontWeight: 600 }}>Sign Out</span>
              </motion.button>
              <p style={{ textAlign: "center", color: "#5E6373", fontSize: 9, marginTop: 8,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Sparkles size={9} color="#5E6373"/>VoxCall™ Dashboard · v1.0.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { USER };
