import { NextRequest, NextResponse } from "next/server";
import { getAllSubscriptions, createSubscription, CreateSubscriptionInput } from "@/lib/db/subscriptions";
import { getUserId } from "@/lib/auth/server";

export async function GET() {
  try {
    const userId = await getUserId();
    const subscriptions = await getAllSubscriptions(userId);
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();

    if (!body.name || body.price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const input: CreateSubscriptionInput = {
      name: body.name,
      website: body.website || undefined,
      price: parseFloat(body.price),
      cycle: body.cycle || 'monthly',
      currency: body.currency || 'USD',
      active: body.active !== false,
      notes: body.notes || undefined,
    };

    const subscription = await createSubscription(input, userId);
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
