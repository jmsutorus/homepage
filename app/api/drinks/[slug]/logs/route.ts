import { NextRequest, NextResponse } from "next/server";
import { createLog, getDrinkBySlug, CreateDrinkLogInput } from "@/lib/db/drinks";
import { getUserId } from "@/lib/auth/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const userId = await getUserId();
    const body = await req.json();

    const drink = await getDrinkBySlug(slug, userId);
    if (!drink) {
      return NextResponse.json(
        { error: "Drink not found" },
        { status: 404 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const input: CreateDrinkLogInput = {
      drinkId: drink.id,
      date: body.date,
      location: body.location,
      notes: body.notes,
      rating: body.rating ? parseInt(body.rating) : undefined,
    };

    const log = await createLog(input, userId);
    return NextResponse.json(log);
  } catch (error) {
    console.error("Error creating drink log:", error);
    return NextResponse.json(
      { error: "Failed to create drink log" },
      { status: 500 }
    );
  }
}
