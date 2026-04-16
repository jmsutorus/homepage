import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { getExerciseSettings, updateExerciseSettings } from "@/lib/db/personal-records";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getExerciseSettings(session.user.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching exercise settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { enable_running_prs, enable_weights_prs } = body;

    const success = await updateExerciseSettings(
      session.user.id, 
      Boolean(enable_running_prs), 
      Boolean(enable_weights_prs)
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating exercise settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
