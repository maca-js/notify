import { NextRequest, NextResponse } from "next/server";
import { lookupStock } from "@/shared/api/yahoo-finance";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker?.trim()) return NextResponse.json(null);

  const info = await lookupStock(ticker);
  return NextResponse.json(info);
}
