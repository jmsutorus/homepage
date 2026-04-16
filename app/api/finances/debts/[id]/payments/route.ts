import { NextRequest, NextResponse } from "next/server";
import { addPayment, CreatePaymentInput } from "@/lib/db/debts";
import { getUserId } from "@/lib/auth/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body = await req.json();

    if (body.amount === undefined || !body.date) {
      return NextResponse.json(
        { error: "Amount and date are required" },
        { status: 400 }
      );
    }

    const input: CreatePaymentInput = {
      debtId: parseInt(id),
      amount: parseFloat(body.amount),
      date: body.date,
      notes: body.notes || undefined,
    };

    const payment = await addPayment(input, userId);
    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error adding payment:", error);
    return NextResponse.json(
      { error: "Failed to add payment" },
      { status: 500 }
    );
  }
}
