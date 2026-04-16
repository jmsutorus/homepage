import { NextRequest, NextResponse } from "next/server";
import { getSavingsAccount, updateSavingsAccount, deleteSavingsAccount } from "@/lib/db/savings";
import { getUserId } from "@/lib/auth/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const account = await getSavingsAccount(parseInt(id), userId);
    if (!account) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(account);
  } catch (error) {
    console.error("Error fetching savings account:", error);
    return NextResponse.json({ error: "Failed to fetch savings account" }, { status: 500 });
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

    const updated = await updateSavingsAccount(parseInt(id), userId, {
      name: body.name,
      institution: body.institution,
      account_type: body.account_type,
      currency: body.currency,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating savings account:", error);
    return NextResponse.json({ error: "Failed to update savings account" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const deleted = await deleteSavingsAccount(parseInt(id), userId);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting savings account:", error);
    return NextResponse.json({ error: "Failed to delete savings account" }, { status: 500 });
  }
}
