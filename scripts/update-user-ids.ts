import { query, queryOne, execute } from "@/lib/db";

async function updateUserIds() {
  console.log("Starting user ID update process...\n");

  // Find the user ID for jmsutorus@gmail.com
  const user = queryOne<{ id: string }>(
    "SELECT id FROM user WHERE email = ?",
    ["jmsutorus@gmail.com"]
  );

  if (!user) {
    console.error("❌ User not found: jmsutorus@gmail.com");
    process.exit(1);
  }

  const userId = user.id;
  console.log(`✅ Found user ID: ${userId}\n`);

  // Check media_content table
  console.log("Checking media_content table...");
  const mediaWithoutUserId = query<{ id: number; title: string }>(
    "SELECT id, title FROM media_content WHERE userId IS NULL OR userId = ''"
  );
  console.log(`Found ${mediaWithoutUserId.length} media records without userId`);

  if (mediaWithoutUserId.length > 0) {
    console.log("\nUpdating media records:");
    mediaWithoutUserId.forEach((media) => {
      console.log(`  - ${media.id}: ${media.title}`);
    });

    const mediaResult = execute(
      "UPDATE media_content SET userId = ? WHERE userId IS NULL OR userId = ''",
      [userId]
    );
    console.log(`✅ Updated ${mediaResult.changes} media records\n`);
  } else {
    console.log("✅ All media records already have userId\n");
  }

  // Check parks table
  console.log("Checking parks table...");
  const parksWithoutUserId = query<{ id: number; title: string }>(
    "SELECT id, title FROM parks WHERE userId IS NULL OR userId = ''"
  );
  console.log(`Found ${parksWithoutUserId.length} parks records without userId`);

  if (parksWithoutUserId.length > 0) {
    console.log("\nUpdating parks records:");
    parksWithoutUserId.forEach((park) => {
      console.log(`  - ${park.id}: ${park.title}`);
    });

    const parksResult = execute(
      "UPDATE parks SET userId = ? WHERE userId IS NULL OR userId = ''",
      [userId]
    );
    console.log(`✅ Updated ${parksResult.changes} parks records\n`);
  } else {
    console.log("✅ All parks records already have userId\n");
  }

  // Summary
  console.log("=== Summary ===");
  const totalMedia = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM media_content"
  )?.count || 0;
  const mediaWithUserId = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM media_content WHERE userId IS NOT NULL AND userId != ''"
  )?.count || 0;

  const totalParks = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM parks"
  )?.count || 0;
  const parksWithUserId = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM parks WHERE userId IS NOT NULL AND userId != ''"
  )?.count || 0;

  console.log(`Media: ${mediaWithUserId}/${totalMedia} have userId`);
  console.log(`Parks: ${parksWithUserId}/${totalParks} have userId`);
  console.log("\n✅ User ID update complete!");
}

updateUserIds().catch(console.error);
