import { NextRequest, NextResponse } from "next/server";
import { getDebt, updateDebt, deleteDebt } from "@/lib/db/debts";
import { getUserId } from "@/lib/auth/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const debt = await getDebt(parseInt(id), userId);
    if (!debt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(debt);
  } catch (error) {
    console.error("Error fetching debt:", error);
    return NextResponse.json({ error: "Failed to fetch debt" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateDebt(parseInt(id), userId, {
      name: body.name,
      category: body.category,
      original_amount: body.original_amount !== undefined ? parseFloat(body.original_amount) : undefined,
      current_balance: body.current_balance !== undefined ? parseFloat(body.current_balance) : undefined,
      interest_rate: body.interest_rate !== undefined ? parseFloat(body.interest_rate) : undefined,
      monthly_payment: body.monthly_payment !== undefined ? parseFloat(body.monthly_payment) : undefined,
      extra_payment: body.extra_payment !== undefined ? parseFloat(body.extra_payment) : undefined,
      start_date: body.start_date,
      currency: body.currency,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating debt:", error);
    return NextResponse.json({ error: "Failed to update debt" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const deleted = await deleteDebt(parseInt(id), userId);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting debt:", error);
    return NextResponse.json({ error: "Failed to delete debt" }, { status: 500 });
  }
}
