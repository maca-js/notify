import { NextRequest, NextResponse } from "next/server";
import { searchCoins } from "@/shared/api/coingecko";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);

  try {
    const results = await searchCoins(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
