import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Notification } from "@/lib/models";

export async function POST() {
  await dbConnect();

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  await Notification.updateMany(
    {
      user_id: session.userId,
      read: false,
    },
    {
      $set: {
        read: true,
      },
    }
  );

  return NextResponse.json({ success: true });
}