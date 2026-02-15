import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.myquran.com/v3";

// This route handles hadith detail by ID via the [slug] parameter
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const id = parseInt(slug);

  if (isNaN(id)) {
    return NextResponse.json(
      { status: false, message: "ID hadis tidak valid" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${API_BASE}/hadis/enc/show/${id}`, {
      headers: { Accept: "application/json" },
    });

    const data = await res.json();

    if (!res.ok || data.status === false) {
      return NextResponse.json(
        { status: false, message: data.message || "Hadis tidak ditemukan" },
        { status: res.status === 404 ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Hadith API error:", error);
    return NextResponse.json(
      { status: false, message: "Gagal memuat hadis" },
      { status: 500 }
    );
  }
}
