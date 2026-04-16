import { NextRequest, NextResponse } from "next/server";
import { getAllDebtsWithDetails, createDebt, CreateDebtInput } from "@/lib/db/debts";
import { getUserId } from "@/lib/auth/server";

export async function GET() {
  try {
    const userId = await getUserId();
    const debts = await getAllDebtsWithDetails(userId);
    return NextResponse.json(debts);
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();

    if (!body.name || body.original_amount === undefined || body.current_balance === undefined || body.monthly_payment === undefined) {
      return NextResponse.json(
        { error: "Name, original amount, current balance, and monthly payment are required" },
        { status: 400 }
      );
    }

    const input: CreateDebtInput = {
      name: body.name,
      category: body.category || 'other',
      original_amount: parseFloat(body.original_amount),
      current_balance: parseFloat(body.current_balance),
      interest_rate: body.interest_rate ? parseFloat(body.interest_rate) : 0,
      monthly_payment: parseFloat(body.monthly_payment),
      extra_payment: body.extra_payment ? parseFloat(body.extra_payment) : 0,
      start_date: body.start_date || undefined,
      currency: body.currency || 'USD',
      notes: body.notes || undefined,
    };

    const debt = await createDebt(input, userId);
    return NextResponse.json(debt);
  } catch (error) {
    console.error("Error creating debt:", error);
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }
}
