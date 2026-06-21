import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { blobEnabled } from "@/lib/blob";

/** Quick check: does this running deployment see a Blob token? */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({
    blobEnabled: blobEnabled(),
    isVercel: !!process.env.VERCEL,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  });
}
