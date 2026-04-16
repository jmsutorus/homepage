import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { getPersonalRecords, createPersonalRecord, CreatePersonalRecord } from "@/lib/db/personal-records";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "running" | "weights" | null;

    const records = await getPersonalRecords(session.user.id, type || undefined);
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching personal records:", error);
    return NextResponse.json({ error: "Failed to fetch personal records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, date, notes, distance, total_seconds, exercise, weight, reps } = body;

    if (!type || !['running', 'weights'].includes(type)) {
      return NextResponse.json({ error: "Invalid PR type" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const newRecord: CreatePersonalRecord = {
      type,
      date,
      notes,
      distance: distance ? Number(distance) : undefined,
      total_seconds: total_seconds ? Number(total_seconds) : undefined,
      exercise,
      weight: weight ? Number(weight) : undefined,
      reps: reps ? Number(reps) : undefined,
    };

    const id = await createPersonalRecord(session.user.id, newRecord);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating personal record:", error);
    return NextResponse.json({ error: "Failed to create personal record" }, { status: 500 });
  }
}
