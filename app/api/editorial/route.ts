import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({"posts": [{"id": "a", "title": "Album of the Month: Afterglow", "excerpt": "Why Neon Rivers' 'Afterglow' is our pick.", "image": "/placeholder/e1.jpg"}, {"id": "b", "title": "Staff Picks: September", "excerpt": "From shoegaze to post-punk \u2014 what we loved.", "image": "/placeholder/e2.jpg"}, {"id": "c", "title": "Behind the Counter: Pressing Plants", "excerpt": "A quick tour of modern vinyl pressing.", "image": "/placeholder/e3.jpg"}]});
}
