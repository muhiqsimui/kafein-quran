import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.myquran.com/v3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword") || "";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  if (!keyword || keyword.length < 4) {
    return NextResponse.json(
      { status: false, message: "Kata kunci minimal 4 karakter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${API_BASE}/hadis/enc/cari/${encodeURIComponent(keyword)}?page=${page}&limit=${limit}`,
      { headers: { Accept: "application/json" } }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error) {
    console.error("Hadith search API error:", error);
    return NextResponse.json(
      { status: false, message: "Gagal mencari hadis" },
      { status: 500 }
    );
  }
}
