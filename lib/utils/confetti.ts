import confetti from "canvas-confetti";

/**
 * Achievement types that trigger confetti
 */
export type AchievementType =
  | "all-habits-complete"
  | "streak-7"
  | "streak-30"
  | "streak-100"
  | "streak-365"
  | "tasks-10"
  | "habit-target-reached"
  | "journal-milestone";

/**
 * Fire a basic confetti burst
 */
export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

/**
 * Fire confetti from both sides (celebration style)
 */
export function fireCelebrationConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Fire a burst of star-shaped confetti
 */
export function fireStarConfetti() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"] as confetti.Shape[],
    colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    origin: { y: 0.5 },
  });

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.75,
    origin: { y: 0.5 },
  });
}

/**
 * Fire realistic falling confetti
 */
export function fireRealisticConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Fire confetti based on achievement type
 */
export function fireAchievementConfetti(type: AchievementType) {
  switch (type) {
    case "all-habits-complete":
      // Celebration from both sides for completing all daily habits
      fireCelebrationConfetti();
      break;

    case "streak-7":
      // Basic burst for 7-day streak
      fireConfetti();
      break;

    case "streak-30":
      // Star confetti for 30-day streak
      fireStarConfetti();
      break;

    case "streak-100":
    case "streak-365":
      // Full realistic celebration for major milestones
      fireRealisticConfetti();
      break;

    case "tasks-10":
      // Basic burst for completing 10 tasks
      fireConfetti();
      break;

    case "habit-target-reached":
      // Star confetti for reaching habit target
      fireStarConfetti();
      break;

    case "journal-milestone":
      // Celebration for journaling milestones
      fireCelebrationConfetti();
      break;

    default:
      fireConfetti();
  }
}

/**
 * Check if a streak milestone was just reached
 */
export function getStreakMilestone(
  previousStreak: number,
  currentStreak: number
): AchievementType | null {
  const milestones = [
    { threshold: 365, type: "streak-365" as const },
    { threshold: 100, type: "streak-100" as const },
    { threshold: 30, type: "streak-30" as const },
    { threshold: 7, type: "streak-7" as const },
  ];

  for (const { threshold, type } of milestones) {
    if (previousStreak < threshold && currentStreak >= threshold) {
      return type;
    }
  }

  return null;
}

/**
 * Journal milestone thresholds: 10, 25, 50, 100, 150, 200, 250...
 */
const JOURNAL_MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

/**
 * Check if a journal count is a milestone
 */
export function isJournalMilestone(count: number): boolean {
  // Check predefined milestones
  if (JOURNAL_MILESTONES.includes(count)) {
    return true;
  }
  // After 500, every 100 is a milestone
  if (count > 500 && count % 100 === 0) {
    return true;
  }
  return false;
}

/**
 * Get the milestone message for a journal count
 */
export function getJournalMilestoneMessage(count: number): string {
  if (count === 10) return "10 journals! You're building a great habit!";
  if (count === 25) return "25 journals! A quarter century of reflections!";
  if (count === 50) return "50 journals! Halfway to a hundred!";
  if (count === 100) return "100 journals! A century of thoughts!";
  if (count === 150) return "150 journals! Incredible dedication!";
  if (count === 200) return "200 journals! You're a journaling master!";
  if (count === 250) return "250 journals! A quarter thousand reflections!";
  if (count === 300) return "300 journals! Legendary commitment!";
  if (count === 365) return "365 journals! A full year's worth!";
  if (count >= 500) return `${count} journals! Absolutely remarkable!`;
  return `${count} journals! Amazing milestone!`;
}
