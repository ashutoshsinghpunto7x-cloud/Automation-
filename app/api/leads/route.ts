import { NextResponse } from "next/server";

const SHEET_ID  = process.env.NEXT_PUBLIC_SHEET_ID  || "10yIaxVfLchnY-ejoeesossE6WQigaf_TLriLOgMsqcE";
const SHEET_TAB = process.env.NEXT_PUBLIC_SHEET_NAME || "Form responses 5";
const API_KEY   = process.env.GOOGLE_SHEETS_API_KEY;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_API_KEY not set in .env.local", leads: [], connected: false },
      { status: 200 }
    );
  }

  const range = encodeURIComponent(SHEET_TAB);
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  try {
    const res  = await fetch(url, { next: { revalidate: 30 } });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message, leads: [], connected: false });
    }

    if (!data.values || data.values.length < 2) {
      return NextResponse.json({ leads: [], connected: true, total: 0 });
    }

    const headers: string[] = data.values[0];
    const rows = data.values.slice(1).map((row: string[], idx: number) => {
      const obj: Record<string, string> = { _rowIndex: String(idx + 2) };
      headers.forEach((h, i) => { obj[h.trim()] = (row[i] || "").trim(); });
      return obj;
    });

    return NextResponse.json({ leads: rows, headers, connected: true, total: rows.length });
  } catch (err) {
    return NextResponse.json({ error: String(err), leads: [], connected: false });
  }
}
