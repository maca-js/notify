import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/shared/api/finnhub";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  try {
    const results = await searchStocks(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
