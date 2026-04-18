import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { deletePersonalRecord, updatePersonalRecord } from "@/lib/db/personal-records";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const recordId = parseInt(id, 10);
    
    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const success = await deletePersonalRecord(recordId, session.user.id);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Record not found or unauthorized" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting personal record:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const recordId = parseInt(id, 10);
    
    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const success = await updatePersonalRecord(recordId, session.user.id, body);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Record not found or unauthorized" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating personal record:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}
