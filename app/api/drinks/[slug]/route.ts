import { NextRequest, NextResponse } from "next/server";
import { getDrinkWithLogs, updateDrink, deleteDrink, drinkSlugExists, UpdateDrinkInput } from "@/lib/db/drinks";
import { getUserId } from "@/lib/auth/server";
import { slugify } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const userId = await getUserId();
    const drink = await getDrinkWithLogs(slug, userId);

    if (!drink) {
      return NextResponse.json(
        { error: "Drink not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(drink);
  } catch (error) {
    console.error("Error fetching drink:", error);
    return NextResponse.json(
      { error: "Failed to fetch drink" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const userId = await getUserId();
    const body = await req.json();

    let newSlug = undefined;

    // Handle slug update (if name changes)
    if (body.name && body.name !== slug) {
      const potentialSlug = slugify(body.name);
      // We only update slug if explicitly asked or if we want to auto-update (maybe later)
      // For now, let's keep slug stable unless explicitly updated or if logic changes
      // Actually, let's mimic restaurants logic - usually name update can trigger slug update or not
      // But typically we might want to keep URL stable. 
      // Let's assume frontend sends 'slug' if it wants to change it.
    }
    
    // Explicit slug change request
    if (body.slug && body.slug !== slug) {
       newSlug = slugify(body.slug);
       if (await drinkSlugExists(newSlug, userId)) {
          // If collision, don't change slug or error?
          // Let's error
          return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
       }
    }

    const input: UpdateDrinkInput = {
      ...body,
      slug: newSlug,
      year: body.year ? parseInt(body.year) : undefined,
      abv: body.abv ? parseFloat(body.abv) : undefined,
      rating: body.rating ? parseInt(body.rating) : undefined,
    };

    // Remove undefined fields
    Object.keys(input).forEach(key => (input as any)[key] === undefined && delete (input as any)[key]);

    const updated = await updateDrink(slug, userId, input);

    if (!updated) {
      return NextResponse.json(
        { error: "Drink not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating drink:", error);
    return NextResponse.json(
      { error: "Failed to update drink" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const userId = await getUserId();
    
    const success = await deleteDrink(slug, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Drink not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting drink:", error);
    return NextResponse.json(
      { error: "Failed to delete drink" },
      { status: 500 }
    );
  }
}
