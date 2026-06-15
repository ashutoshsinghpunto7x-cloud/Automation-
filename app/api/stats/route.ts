import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const host  = request.headers.get("host") || "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";

  try {
    const res = await fetch(`${proto}://${host}/api/leads`);
    const { leads, connected, error } = await res.json();

    if (!connected || !leads || leads.length === 0) {
      return NextResponse.json({ connected: connected ?? false, error, stats: null });
    }

    // Today in DD/MM/YYYY format (matches sheet timestamp format)
    const now   = new Date();
    const today = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;

    let callsToday     = 0;
    let callsMade      = 0;   // has a Call ID (attempted)
    let answered       = 0;   // actually connected (silence-timed-out / customer-ended-call)
    let apiErrors      = 0;
    let inProgress     = 0;
    let hotLeads       = 0;
    let warmLeads      = 0;
    let coldLeads      = 0;
    let visitsBooked   = 0;
    let interested     = 0;

    for (const row of leads) {
      const status   = (row["Call Status"]     || "").trim();
      const callId   = (row["Call ID"]         || "").trim();
      const visit    = (row["Visit Scheduled"] || "").trim().toUpperCase();
      const interest = (row["Intrested"]       || "").trim().toUpperCase(); // their spelling
      const category = (row["Lead Category"]   || "").trim().toLowerCase();
      const ts       = (row["Timestamp"]       || "").trim();

      // Calls today — timestamp starts with today's date DD/MM/YYYY
      if (ts.startsWith(today)) callsToday++;

      // Call outcomes
      if (status === "API Error - Retry Needed") { apiErrors++; }
      else if (status === "Call In Progress" || status === "Calling...") { inProgress++; }
      else if (status === "silence-timed-out" || status === "customer-ended-call") { answered++; callsMade++; }
      
      if (callId) callsMade++; // has a call ID = was attempted

      // Visit
      if (visit === "TRUE") visitsBooked++;

      // Interest
      if (interest === "TRUE") interested++;

      // Lead category (from AI scoring)
      if (category === "hot")  hotLeads++;
      if (category === "warm") warmLeads++;
      if (category === "cold") coldLeads++;
    }

    // Deduplicate callsMade (counted twice above for answered)
    callsMade = callsMade - answered; // answered was added to callsMade twice above
    const totalAttempted = answered + inProgress; // meaningful calls

    const successRate = totalAttempted > 0
      ? Math.round((answered / totalAttempted) * 100)
      : 0;

    const convRate = answered > 0
      ? ((visitsBooked / answered) * 100).toFixed(1)
      : "0";

    return NextResponse.json({
      connected: true,
      stats: {
        totalLeads:    leads.length,
        callsToday,
        totalAttempted,
        answered,
        inProgress,
        apiErrors,
        successRate,
        hotLeads,
        warmLeads,
        coldLeads,
        visitsBooked,
        interested,
        convRate,
      },
    });
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err), stats: null });
  }
}
