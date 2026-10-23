import { NextResponse } from "next/server";
import { listAssets } from "@/lib/stub/assets-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json(listAssets(searchParams));
}
