#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getDatabase } from "@/lib/db/index";
import { createMedia, getMediaBySlug } from "@/lib/db/media";

interface MediaFrontmatter {
  title: string;
  type: "movie" | "tv" | "book";
  status: "watching" | "completed" | "planned";
  rating?: number;
  imageUrl?: string;
  dateWatched?: string;
  dateStarted?: string;
  genres?: string[];
  director?: string | string[]; // For movies/tv
  authors?: string | string[]; // For books
}

/**
 * Get all markdown files from content/media directory
 */
function getAllMediaFiles(): Array<{
  filePath: string;
  slug: string;
  type: "movie" | "tv" | "book";
}> {
  const contentDir = path.join(process.cwd(), "content", "media");
  const mediaFiles: Array<{
    filePath: string;
    slug: string;
    type: "movie" | "tv" | "book";
  }> = [];

  const types = ["movies", "tv", "books"];

  types.forEach((typeDir) => {
    const dirPath = path.join(contentDir, typeDir);

    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      if (file.endsWith(".md")) {
        const filePath = path.join(dirPath, file);
        const slug = file.replace(/\.md$/, "");
        const type = typeDir === "movies" ? "movie" : typeDir === "tv" ? "tv" : "book";

        mediaFiles.push({ filePath, slug, type });
      }
    });
  });

  return mediaFiles;
}

/**
 * Parse markdown file and extract frontmatter and content
 */
function parseMediaFile(filePath: string) {
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);
  return { frontmatter: data as MediaFrontmatter, content };
}

/**
 * Migrate all media files to database
 */
async function migrateMediaFiles() {
  console.log("🚀 Starting media migration to database...\n");

  // Initialize database (creates table if not exists)
  getDatabase();
  console.log("✅ Database initialized\n");

  // Get all media files
  const mediaFiles = getAllMediaFiles();
  console.log(`📁 Found ${mediaFiles.length} media files to migrate\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const { filePath, slug, type } of mediaFiles) {
    try {
      // Check if already exists in database
      const existing = getMediaBySlug(slug);
      if (existing) {
        console.log(`⏭️  Skipping ${slug} (already exists in database)`);
        skipCount++;
        continue;
      }

      // Parse file
      const { frontmatter, content } = parseMediaFile(filePath);

      // Combine director and authors into creator array
      const creator: string[] = [];
      if (frontmatter.director) {
        if (Array.isArray(frontmatter.director)) {
          creator.push(...frontmatter.director);
        } else {
          creator.push(frontmatter.director);
        }
      }
      if (frontmatter.authors) {
        if (Array.isArray(frontmatter.authors)) {
          creator.push(...frontmatter.authors);
        } else {
          creator.push(frontmatter.authors);
        }
      }

      // Create database entry
      createMedia({
        slug,
        title: frontmatter.title,
        type: frontmatter.type || type,
        status: frontmatter.status === "watching" ? "in-progress" : frontmatter.status,
        rating: frontmatter.rating,
        poster: frontmatter.imageUrl,
        completed: frontmatter.dateWatched,
        started: frontmatter.dateStarted,
        genres: frontmatter.genres,
        creator: creator.length > 0 ? creator : undefined,
        content: content.trim(),
      });

      console.log(`✅ Migrated: ${slug} (${type})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error migrating ${slug}:`, error);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary:");
  console.log("=".repeat(50));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`⏭️  Skipped (already exists): ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Total files processed: ${mediaFiles.length}`);
  console.log("=".repeat(50) + "\n");

  if (successCount > 0) {
    console.log("💡 Next steps:");
    console.log("  1. Verify data in database");
    console.log("  2. Update application to use database instead of markdown files");
    console.log("  3. Test all media pages render correctly");
    console.log("  4. Keep markdown files as backup (don't delete yet)\n");
  }
}

/**
 * Run migration
 */
if (require.main === module) {
  migrateMediaFiles()
    .then(() => {
      console.log("✨ Migration complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}

export { migrateMediaFiles };
