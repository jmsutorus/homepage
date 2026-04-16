import { NextRequest, NextResponse } from "next/server";
import { getAllFixedCosts, createFixedCost, CreateFixedCostInput } from "@/lib/db/budget";
import { getUserId } from "@/lib/auth/server";

export async function GET() {
  try {
    const userId = await getUserId();
    const costs = await getAllFixedCosts(userId);
    return NextResponse.json(costs);
  } catch (error) {
    console.error("Error fetching fixed costs:", error);
    return NextResponse.json({ error: "Failed to fetch fixed costs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();

    if (!body.name || body.amount === undefined) {
      return NextResponse.json(
        { error: "Name and amount are required" },
        { status: 400 }
      );
    }

    const input: CreateFixedCostInput = {
      name: body.name,
      category: body.category || 'other',
      amount: parseFloat(body.amount),
      currency: body.currency || 'USD',
      notes: body.notes || undefined,
    };

    const cost = await createFixedCost(input, userId);
    return NextResponse.json(cost);
  } catch (error) {
    console.error("Error creating fixed cost:", error);
    return NextResponse.json({ error: "Failed to create fixed cost" }, { status: 500 });
  }
}
