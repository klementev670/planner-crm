import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();
  if (!passcode || passcode !== process.env.APP_PASSCODE) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("planner_auth", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
