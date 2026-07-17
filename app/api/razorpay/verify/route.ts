import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Due, Transaction } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    const existingTransaction = await Transaction.findOne({
    razorpay_payment_id,
    });

    if (existingTransaction) {
    return NextResponse.json({
        success: true,
        transactionId: existingTransaction._id,
    });
    }

    await dbConnect();

    const session = await getSession();

    if (!session) {
    return NextResponse.json(
        { success: false, error: "Not logged in" },
        { status: 401 }
    );
    }

    const pendingDues = await Due.find({
    student_id: session.userId,
    status: "pending",
    });

    if (pendingDues.length === 0) {
    return NextResponse.json(
        { success: false, error: "No pending dues" },
        { status: 400 }
    );
    }

    const totalAmount = pendingDues.reduce(
    (sum, due) => sum + due.amount,
    0
    );

    const transactionId = crypto.randomUUID();

    await Transaction.create({
    _id: transactionId,
    student_id: session.userId,
    amount: totalAmount,

    razorpay_order_id,
    razorpay_payment_id,

    qr_data: `RECEIPT-${transactionId.substring(0, 8).toUpperCase()}`,
    });

    await Due.updateMany(
    {
        student_id: session.userId,
        status: "pending",
    },
    {
        $set: {
        status: "paid",
        transaction_id: transactionId,
        },
    }
    );

    return NextResponse.json({
    success: true,
    transactionId,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
      },
      { status: 500 }
    );
  }
}