import { NextRequest, NextResponse } from "next/server";
import { getAllDrinksWithLogCount, createDrink, drinkSlugExists, CreateDrinkInput } from "@/lib/db/drinks";
import { getUserId } from "@/lib/auth/server";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const userId = await getUserId();
    const drinks = await getAllDrinksWithLogCount(userId);
    return NextResponse.json(drinks);
  } catch (error) {
    console.error("Error fetching drinks:", error);
    return NextResponse.json(
      { error: "Failed to fetch drinks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();

    // Basic validation
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = slugify(body.name);
    
    // Check if slug exists
    if (await drinkSlugExists(slug, userId)) {
      // Append random 4 characters
      const random = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${random}`;
    }

    const input: CreateDrinkInput = {
      ...body,
      slug,
      // Ensure specific types are handled correctly
      year: body.year ? parseInt(body.year) : undefined,
      abv: body.abv ? parseFloat(body.abv) : undefined,
      rating: body.rating ? parseInt(body.rating) : undefined,
    };

    const drink = await createDrink(input, userId);
    return NextResponse.json(drink);
  } catch (error) {
    console.error("Error creating drink:", error);
    return NextResponse.json(
      { error: "Failed to create drink" },
      { status: 500 }
    );
  }
}
