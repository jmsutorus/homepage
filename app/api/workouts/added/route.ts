import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/server";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dayNumber } = await request.json();
    if (dayNumber === undefined) {
      return NextResponse.json({ error: "dayNumber is required" }, { status: 400 });
    }

    const userId = session.user.id;
    const firestore = getAdminFirestore();
    const docRef = firestore
      .collection("curations")
      .doc("workouts")
      .collection("users")
      .doc(userId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const data = doc.data();
    if (!data || !data.plan || !data.plan.days) {
      return NextResponse.json({ error: "Invalid plan data in Firestore" }, { status: 400 });
    }

    const updatedDays = data.plan.days.map((day: any) => {
      if (day.dayNumber === dayNumber) {
        return { ...day, added: true };
      }
      return day;
    });

    await docRef.update({
      "plan.days": updatedDays
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}
