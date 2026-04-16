import { NextRequest, NextResponse } from "next/server";
import { getAllIncome, createIncome, CreateIncomeInput } from "@/lib/db/budget";
import { getUserId } from "@/lib/auth/server";

export async function GET() {
  try {
    const userId = await getUserId();
    const income = await getAllIncome(userId);
    return NextResponse.json(income);
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json({ error: "Failed to fetch income" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();

    if (body.amount === undefined || !body.effective_date) {
      return NextResponse.json(
        { error: "Amount and effective date are required" },
        { status: 400 }
      );
    }

    const input: CreateIncomeInput = {
      amount: parseFloat(body.amount),
      currency: body.currency || 'USD',
      label: body.label || 'Primary',
      effective_date: body.effective_date,
      notes: body.notes || undefined,
    };

    const income = await createIncome(input, userId);
    return NextResponse.json(income);
  } catch (error) {
    console.error("Error creating income:", error);
    return NextResponse.json({ error: "Failed to create income" }, { status: 500 });
  }
}
