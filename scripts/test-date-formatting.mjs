/**
 * Test script to verify date formatting utilities handle all formats correctly
 */

// Simulate the formatDateLongSafe function
function formatDateLongSafe(dateString, locale = "en-US") {
  if (!dateString) return "";

  // Handle ISO datetime strings (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD HH:MM:SS)
  // Split on both "T" and space " " to handle SQLite timestamps
  const datePart = dateString.split("T")[0].split(" ")[0];

  // Parse date components to avoid timezone issues
  // Handle both YYYY-MM-DD and YYYY/MM/DD formats
  const separator = datePart.includes("-") ? "-" : "/";
  const [year, month, day] = datePart.split(separator).map(Number);

  // Create date in local timezone (not UTC)
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

console.log("🧪 Testing date formatting utilities...\n");

const testCases = [
  {
    input: "2025-11-14",
    description: "Standard date format (YYYY-MM-DD)",
  },
  {
    input: "2025/11/14",
    description: "Alternate date format (YYYY/MM/DD)",
  },
  {
    input: "2025-11-14T18:12:55",
    description: "ISO datetime with T separator",
  },
  {
    input: "2025-11-14 18:12:55",
    description: "SQLite timestamp with space separator",
  },
];

let allPassed = true;

testCases.forEach(({ input, description }) => {
  try {
    const result = formatDateLongSafe(input);
    const isValid = result && result !== "Invalid Date" && !result.includes("NaN");

    if (isValid) {
      console.log(`✅ ${description}`);
      console.log(`   Input:  "${input}"`);
      console.log(`   Output: "${result}"\n`);
    } else {
      console.log(`❌ ${description}`);
      console.log(`   Input:  "${input}"`);
      console.log(`   Output: "${result}" (INVALID)\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Input:  "${input}"`);
    console.log(`   Error:  ${error.message}\n`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log("🎉 All tests passed! Date formatting handles all formats correctly.");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Please review the formatting function.");
  process.exit(1);
}
