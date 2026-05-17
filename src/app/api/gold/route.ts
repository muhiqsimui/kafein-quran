// src/app/api/gold/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://gold.kafein.web.id/api/v1/gold/latest",
      {
        next: {
          revalidate: 3600, // Menyimpan cache selama 3600 detik (1 jam)
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil data" },
        { status: 500 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
