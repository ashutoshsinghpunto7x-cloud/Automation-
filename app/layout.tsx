import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import LeftSidebar from "./components/LeftSidebar";

export const metadata: Metadata = {
  title: "Shalimar Developers — AI Dashboard",
  description: "AI Voice Calling & Lead Management Dashboard — Shalimar Developers, Lucknow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height:"100%" }}>
      <body style={{ display:"flex", flexDirection:"row", height:"100vh", overflow:"hidden" }}>
        <LeftSidebar />
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", height:"100%" }}>
          <Navbar />
          <div style={{ flex:1, minHeight:0, overflow:"hidden" }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
