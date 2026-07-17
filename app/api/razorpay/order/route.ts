import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Due } from "@/lib/models";

export async function POST() {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) {
    return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
    );
    }
    const pendingDues = await Due.find({
    student_id: session.userId,
    status: "pending",
    });

    if (pendingDues.length === 0) {
    return NextResponse.json(
        { error: "No pending dues." },
        { status: 400 }
    );
    }

    const totalAmount = pendingDues.reduce(
    (sum, due) => sum + due.amount,
    0
    );
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}