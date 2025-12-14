import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAllJournals,
  createJournal,
  getJournalBySlug,
  replaceJournalLinks,
  getJournalCount,
} from "@/lib/db/journals";
import { requireAuthApi } from "@/lib/auth/server";

// Helper function to sanitize slug
function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/journals
 * Get all journal entries
 */
export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const journals = await getAllJournals(userId);
    return NextResponse.json(journals);
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json(
      { error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/journals
 * Create a new journal entry
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { frontmatter, content, links } = body;

    const journalType = frontmatter?.journal_type || "general";

    // Validate required fields based on journal type
    if (journalType === "daily") {
      if (!frontmatter?.daily_date) {
        return NextResponse.json(
          { error: "Date is required for daily journals" },
          { status: 400 }
        );
      }
    } else {
      if (!frontmatter?.title) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }
    }

    let slug = "";
    const journalData: any = {
      userId,
      journal_type: journalType,
      content: content || "",
      tags: frontmatter.tags,
      featured: frontmatter.featured,
      published: frontmatter.published,
    };

    if (journalType === "daily") {
      // For daily journals, title and slug are auto-generated
      journalData.daily_date = frontmatter.daily_date;
      // Mood is not stored in journals table for daily journals
      // It's read from mood_entries
    } else {
      // For general journals, generate slug from title
      slug = sanitizeSlug(frontmatter.title);
      journalData.slug = slug;
      journalData.title = frontmatter.title;
      journalData.mood = frontmatter.mood;

      // Check if journal with this slug already exists
      const existing = await getJournalBySlug(slug, userId);
      if (existing) {
        return NextResponse.json(
          { error: "A journal entry with this title already exists" },
          { status: 409 }
        );
      }
    }

    const journal = await createJournal(journalData);
    slug = journal.slug;

    // Add links if provided
    if (links && Array.isArray(links) && links.length > 0) {
      try {
        await replaceJournalLinks(journal.id, links);
      } catch (linkError) {
        console.error("Error adding journal links:", linkError);
        // Continue even if links fail - journal was created successfully
      }
    }

    // Revalidate paths
    revalidatePath("/journals");
    revalidatePath(`/journals/${slug}`);

    // Get total journal count for milestone detection
    const totalJournals = await getJournalCount(userId);

    return NextResponse.json(
      {
        success: true,
        slug,
        path: `/journals/${slug}`,
        journal,
        totalJournals,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating journal:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create journal" },
      { status: 500 }
    );
  }
}
