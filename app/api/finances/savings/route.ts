import { NextRequest, NextResponse } from "next/server";
import { getAllSavingsAccountsWithBalance, createSavingsAccount, CreateSavingsAccountInput } from "@/lib/db/savings";
import { getUserId } from "@/lib/auth/server";

export async function GET() {
  try {
    const userId = await getUserId();
    const accounts = await getAllSavingsAccountsWithBalance(userId);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching savings accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const input: CreateSavingsAccountInput = {
      name: body.name,
      institution: body.institution || undefined,
      account_type: body.account_type || 'savings',
      currency: body.currency || 'USD',
      notes: body.notes || undefined,
    };

    const account = await createSavingsAccount(input, userId);
    return NextResponse.json(account);
  } catch (error) {
    console.error("Error creating savings account:", error);
    return NextResponse.json(
      { error: "Failed to create savings account" },
      { status: 500 }
    );
  }
}
