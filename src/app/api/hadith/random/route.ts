import { NextResponse } from "next/server";

const API_BASE = "https://api.myquran.com/v3";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/hadis/enc/random`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error) {
    console.error("Hadith random API error:", error);
    return NextResponse.json(
      { status: false, message: "Gagal memuat hadis acak" },
      { status: 500 }
    );
  }
}
