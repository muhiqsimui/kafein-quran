import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.myquran.com/v3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const id = searchParams.get("id");

  try {
    // If ID is provided, get detail
    if (id) {
      const res = await fetch(`${API_BASE}/hadist/perawi/id/${id}`, {
        headers: { Accept: "application/json" },
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    }

    // Otherwise browse
    const res = await fetch(
      `${API_BASE}/hadist/perawi/browse?page=${page}&limit=${limit}`,
      { headers: { Accept: "application/json" } }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error) {
    console.error("Perawi API error:", error);
    return NextResponse.json(
      { status: false, message: "Gagal memuat data perawi" },
      { status: 500 }
    );
  }
}
