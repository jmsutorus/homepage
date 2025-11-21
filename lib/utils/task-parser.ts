import * as chrono from "chrono-node";
import { TaskPriority } from "@/lib/db/tasks";

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  priority?: TaskPriority;
}

// Priority patterns to detect and extract
const PRIORITY_PATTERNS: { pattern: RegExp; priority: TaskPriority }[] = [
  // Explicit priority markers
  { pattern: /^(high priority|urgent|important|asap)[:\s]+/i, priority: "high" },
  { pattern: /^(low priority|whenever|someday)[:\s]+/i, priority: "low" },
  { pattern: /^(medium priority|normal)[:\s]+/i, priority: "medium" },
  // Priority markers with exclamation marks
  { pattern: /^!!!\s*/i, priority: "high" },
  { pattern: /^!!\s*/i, priority: "medium" },
  { pattern: /^!\s*/i, priority: "low" },
  // Priority markers at the end
  { pattern: /\s+(high priority|urgent|important|asap)$/i, priority: "high" },
  { pattern: /\s+(low priority|whenever|someday)$/i, priority: "low" },
  // Parenthetical priority markers
  { pattern: /\s*\(high\)\s*/i, priority: "high" },
  { pattern: /\s*\(low\)\s*/i, priority: "low" },
  { pattern: /\s*\(urgent\)\s*/i, priority: "high" },
];

/**
 * Parse natural language task input to extract title, due date, and priority
 *
 * Examples:
 * - "Buy milk tomorrow" → { title: "Buy milk", dueDate: tomorrow }
 * - "High priority: finish report by Friday" → { title: "finish report", dueDate: Friday, priority: "high" }
 * - "Call mom next week" → { title: "Call mom", dueDate: next week }
 * - "!!! Submit proposal by end of day" → { title: "Submit proposal", dueDate: today EOD, priority: "high" }
 */
export function parseTaskInput(input: string): ParsedTask {
  let text = input.trim();
  let priority: TaskPriority | undefined;
  let dueDate: Date | undefined;

  // Extract priority from the text
  for (const { pattern, priority: p } of PRIORITY_PATTERNS) {
    if (pattern.test(text)) {
      priority = p;
      text = text.replace(pattern, "").trim();
      break;
    }
  }

  // Parse dates using chrono-node
  const parsedResults = chrono.parse(text, new Date(), { forwardDate: true });

  if (parsedResults.length > 0) {
    // Get the first parsed date result
    const result = parsedResults[0];
    dueDate = result.start.date();

    // Remove the date text from the title
    // We need to be careful here to preserve the meaning of the title
    const dateText = result.text;

    // Common prepositions that introduce dates
    const datePrepositions = /\s+(by|on|at|before|until|due|for)\s+$/i;

    // Remove the date portion and any preceding preposition
    let title = text.slice(0, result.index).trim();
    title = title.replace(datePrepositions, "").trim();

    // If there's text after the date, append it
    const afterDate = text.slice(result.index + dateText.length).trim();
    if (afterDate) {
      title = title ? `${title} ${afterDate}` : afterDate;
    }

    text = title;
  }

  return {
    title: text.trim(),
    dueDate,
    priority,
  };
}

/**
 * Check if the input contains parseable date or priority information
 * Useful for showing hints to users
 */
export function hasParseableContent(input: string): {
  hasDate: boolean;
  hasPriority: boolean;
} {
  const trimmed = input.trim();

  // Check for priority markers
  const hasPriority = PRIORITY_PATTERNS.some(({ pattern }) => pattern.test(trimmed));

  // Check for dates using chrono
  const parsedResults = chrono.parse(trimmed, new Date(), { forwardDate: true });
  const hasDate = parsedResults.length > 0;

  return { hasDate, hasPriority };
}
