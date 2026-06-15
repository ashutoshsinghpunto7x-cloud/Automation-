"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* Custom SVG icons matching the screenshot exactly */
function IconDashboard({ active }: { active:boolean }) {
  const c = active?"#3b82f6":"#6b7280";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.5"/>
      <rect x="10" y="1" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.5"/>
      <rect x="1" y="10" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.5"/>
      <rect x="10" y="10" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.5"/>
    </svg>
  );
}
function IconPhone({ active }: { active:boolean }) {
  const c = active?"#3b82f6":"#6b7280";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 3C3 3 3.8 8.5 8.5 13.2C13.2 17.9 18 16 18 16L15.5 12.5L13.2 13.3L9.8 9.9L10.5 7.5L7.5 3H3Z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function IconUsers({ active }: { active:boolean }) {
  const c = active?"#3b82f6":"#6b7280";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6" r="3" stroke={c} strokeWidth="1.5"/>
      <path d="M1 16C1 12.7 3.7 10 7 10C10.3 10 13 12.7 13 16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13" cy="5" r="2.2" stroke={c} strokeWidth="1.3"/>
      <path d="M15.5 14C15.5 11.5 14 9.5 12 9.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function IconMegaphone({ active }: { active:boolean }) {
  const c = active?"#3b82f6":"#6b7280";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M14 3L5 7H2C1.4 7 1 7.4 1 8V10C1 10.6 1.4 11 2 11H5L14 15V3Z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 11V15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 5C17 5 17.5 7 17.5 9C17.5 11 17 13 17 13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconBarChart({ active }: { active:boolean }) {
  const c = active?"#3b82f6":"#6b7280";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="10" width="4" height="7" rx="1" stroke={c} strokeWidth="1.5"/>
      <rect x="7" y="6"  width="4" height="11" rx="1" stroke={c} strokeWidth="1.5"/>
      <rect x="13" y="2" width="4" height="15" rx="1" stroke={c} strokeWidth="1.5"/>
    </svg>
  );
}
function IconPlug({ active }: { active:boolean }) {
  const c = active?"#3b82f6":"#6b7280";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M6 2V6M12 2V6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="3" y="6" width="12" height="5" rx="2" stroke={c} strokeWidth="1.5"/>
      <path d="M9 11V16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 15H12" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconSettings({ active }: { active:boolean }) {
  const c = active?"#3b82f6":"#6b7280";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke={c} strokeWidth="1.5"/>
      <path d="M9 1V3M9 15V17M17 9H15M3 9H1M14.7 3.3L13.3 4.7M4.7 13.3L3.3 14.7M14.7 14.7L13.3 13.3M4.7 4.7L3.3 3.3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconChevronLeft({ active }: { active:boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8L10 13" stroke={active?"#3b82f6":"#6b7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NAV = [
  { href:"/",          Icon:IconDashboard, label:"Dashboard"   },
  { href:"/calls",     Icon:IconPhone,     label:"Calls"       },
  { href:"/leads",     Icon:IconUsers,     label:"Leads"       },
  { href:"/campaigns", Icon:IconMegaphone, label:"Campaigns"   },
  { href:"/analytics", Icon:IconBarChart,  label:"Analytics"   },
  { href:"/settings",  Icon:IconPlug,      label:"Integrations"},
  { href:"/settings",  Icon:IconSettings,  label:"Settings"    },
];

export default function LeftSidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width:66, flexShrink:0,
      background:"var(--bg-nav)",
      borderRight:"1px solid var(--border)",
      display:"flex", flexDirection:"column",
      alignItems:"center",
      paddingTop:12, paddingBottom:12,
      gap:2, zIndex:40,
    }}>
      {NAV.map(({ href, Icon, label }) => {
        const active = href==="/" ? path==="/" : path.startsWith(href) && href!=="/";
        return (
          <Link
            key={label}
            href={href}
            title={label}
            style={{
              width:50,
              display:"flex", flexDirection:"column",
              alignItems:"center", gap:4,
              padding:"9px 0",
              borderRadius:11,
              background:active?"rgba(59,130,246,0.13)":"transparent",
              border:active?"1px solid rgba(59,130,246,0.26)":"1px solid transparent",
              transition:"all 0.15s",
              position:"relative",
            }}
          >
            {active && (
              <div style={{
                position:"absolute", left:0, top:"50%", transform:"translateY(-50%)",
                width:3, height:22, borderRadius:"0 2px 2px 0",
                background:"#3b82f6",
              }} />
            )}
            <Icon active={active} />
            <span style={{
              color:active?"#3b82f6":"#4b5563",
              fontSize:8, fontWeight:600,
              letterSpacing:"0.03em",
              textAlign:"center",
            }}>
              {label.length>9 ? label.slice(0,9) : label}
            </span>
          </Link>
        );
      })}

      <div style={{ flex:1 }} />

      {/* Collapse */}
      <button style={{ width:50, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"9px 0", borderRadius:11, border:"1px solid transparent" }}>
        <IconChevronLeft active={false} />
        <span style={{ color:"#4b5563", fontSize:8, fontWeight:600 }}>Collapse</span>
      </button>
    </aside>
  );
}
