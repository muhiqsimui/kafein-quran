import { NextRequest, NextResponse } from "next/server";
import { getPaginatedHadiths } from "@/lib/hadith-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const q = searchParams.get("q") || "";

  try {
    const data = await getPaginatedHadiths(slug, page, limit, q);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hadith API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hadiths" },
      { status: 500 }
    );
  }
}
