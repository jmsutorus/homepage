import { NextRequest, NextResponse } from "next/server";
import { addBalance, CreateBalanceInput } from "@/lib/db/savings";
import { getUserId } from "@/lib/auth/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body = await req.json();

    if (body.balance === undefined || !body.date) {
      return NextResponse.json(
        { error: "Balance and date are required" },
        { status: 400 }
      );
    }

    const input: CreateBalanceInput = {
      accountId: parseInt(id),
      balance: parseFloat(body.balance),
      date: body.date,
    };

    const balance = await addBalance(input, userId);
    return NextResponse.json(balance);
  } catch (error) {
    console.error("Error adding balance:", error);
    return NextResponse.json(
      { error: "Failed to add balance" },
      { status: 500 }
    );
  }
}
