import { NextRequest, NextResponse } from "next/server";
import {
  getHoliday,
  updateHoliday,
  deleteHoliday,
  type UpdateHolidayInput,
} from "@/lib/db/holidays";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * PATCH /api/holidays/[id]
 * Body: UpdateHolidayInput
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const holidayId = parseInt(id, 10);
    
    if (isNaN(holidayId)) {
      return NextResponse.json({ error: "Invalid holiday ID" }, { status: 400 });
    }

    const body = await request.json();
    const updates: UpdateHolidayInput = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.month !== undefined) {
      if (body.month < 1 || body.month > 12) {
        return NextResponse.json(
          { error: "Month must be between 1 and 12" },
          { status: 400 }
        );
      }
      updates.month = body.month;
    }
    if (body.day !== undefined) {
      if (body.day < 1 || body.day > 31) {
        return NextResponse.json(
          { error: "Day must be between 1 and 31" },
          { status: 400 }
        );
      }
      updates.day = body.day;
    }
    if (body.year !== undefined) updates.year = body.year;

    const success = await updateHoliday(holidayId, updates);

    if (!success) {
      return NextResponse.json(
        { error: "Holiday not found or no changes made" },
        { status: 404 }
      );
    }

    const holiday = await getHoliday(holidayId);
    return NextResponse.json(holiday);
  } catch (error) {
    console.error("Error updating holiday:", error);
    
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "A holiday with this name and date already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update holiday" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/holidays/[id]
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const holidayId = parseInt(id, 10);
    
    if (isNaN(holidayId)) {
      return NextResponse.json({ error: "Invalid holiday ID" }, { status: 400 });
    }

    const success = await deleteHoliday(holidayId);

    if (!success) {
      return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return NextResponse.json(
      { error: "Failed to delete holiday" },
      { status: 500 }
    );
  }
}
