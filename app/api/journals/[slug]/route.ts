import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getJournalBySlug,
  updateJournal,
  deleteJournal,
  getLinksForJournal,
  replaceJournalLinks,
  getMoodForDate,
} from "@/lib/db/journals";
import { getUserId } from "@/lib/auth/server";

// GET - Read existing journal entry for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = await getUserId();

    const journal = await getJournalBySlug(slug, userId);

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 }
      );
    }

    // Get associated links
    const links = await getLinksForJournal(journal.id);

    // For daily journals, get mood from mood_entries
    let mood = journal.mood;
    if (journal.journal_type === "daily" && journal.daily_date) {
      const moodRating = await getMoodForDate(journal.daily_date);
      if (moodRating !== null) {
        mood = moodRating;
      }
    }

    // Convert to frontmatter format for compatibility
    return NextResponse.json({
      frontmatter: {
        title: journal.title,
        journal_type: journal.journal_type,
        daily_date: journal.daily_date,
        mood: mood,
        tags: journal.tags,
        featured: journal.featured,
        published: journal.published,
      },
      content: journal.content,
      slug: journal.slug,
      links,
    });
  } catch (error) {
    console.error("Error reading journal:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal" },
      { status: 500 }
    );
  }
}

// PATCH - Update existing journal entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    const body = await request.json();
    const { frontmatter, content, links } = body;

    // Check if journal exists
    const existing = await getJournalBySlug(slug, userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 }
      );
    }

    // Validate required fields based on journal type
    if (existing.journal_type === "general" && !frontmatter?.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      content: content || "",
      tags: frontmatter.tags || undefined,
      featured: frontmatter.featured,
      published: frontmatter.published,
    };

    // For daily journals, handle daily_date changes but not title
    if (existing.journal_type === "daily") {
      if (frontmatter.daily_date) {
        updateData.daily_date = frontmatter.daily_date;
      }
      // Mood for daily journals is not stored in journals table
    } else {
      // For general journals, allow title and mood updates
      updateData.title = frontmatter.title;
      updateData.mood = frontmatter.mood !== undefined ? frontmatter.mood : undefined;
    }

    const updatedJournal = await updateJournal(slug, updateData);

    if (!updatedJournal) {
      return NextResponse.json(
        { error: "Failed to update journal" },
        { status: 500 }
      );
    }

    // Update links if provided
    if (links !== undefined) {
      try {
        if (Array.isArray(links)) {
          await replaceJournalLinks(updatedJournal.id, links);
        }
      } catch (linkError) {
        console.error("Error updating journal links:", linkError);
        // Continue even if links fail - journal was updated successfully
      }
    }

    // Revalidate paths
    revalidatePath("/journals");
    revalidatePath(`/journals/${slug}`);
    if (updatedJournal.slug !== slug) {
      revalidatePath(`/journals/${updatedJournal.slug}`);
    }

    return NextResponse.json({
      success: true,
      slug: updatedJournal.slug,
      path: `/journals/${updatedJournal.slug}`,
    });
  } catch (error) {
    console.error("Error updating journal:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update journal" },
      { status: 500 }
    );
  }
}

// DELETE - Remove journal entry (links are automatically removed via CASCADE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = await getUserId();

    // Check if journal exists
    const existing = await getJournalBySlug(slug, userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 }
      );
    }

    const success = await deleteJournal(slug);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete journal" },
        { status: 500 }
      );
    }

    // Revalidate paths
    revalidatePath("/journals");

    return NextResponse.json({
      success: true,
      message: "Journal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting journal:", error);
    return NextResponse.json(
      { error: "Failed to delete journal" },
      { status: 500 }
    );
  }
}
