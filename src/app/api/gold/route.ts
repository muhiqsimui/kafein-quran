import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://gold.kafein.web.id/api/v1/gold/latest",
      {
        next: {
          revalidate: 3600, // Cache 1 jam
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil data dari penyedia" },
        { status: 500 },
      );
    }

    const res = await response.json();

    // Pastikan data ada sebelum dikirim
    if (res.success && res.data) {
      return NextResponse.json({
        success: true,
        price_1_gram: res.data.price_1_gram, // Data sudah rata di root object
      });
    }

    return NextResponse.json(
      { error: "Format data tidak valid" },
      { status: 422 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
