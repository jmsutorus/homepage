import confetti from "canvas-confetti";

/**
 * Confetti Helper Utilities
 * Provides reusable confetti patterns for celebrating achievements and milestones
 */

/**
 * Basic celebration confetti burst
 */
export function celebrationConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#3b82f6", "#a855f7", "#ec4899", "#10b981"],
  });
}

/**
 * Achievement unlock confetti - more dramatic
 */
export function achievementConfetti() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    colors: ["#ffd700", "#ffa500", "#ff69b4", "#00ff00", "#00bfff"],
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

/**
 * Milestone confetti - shoots from bottom
 */
export function milestoneConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#a855f7", "#ec4899", "#3b82f6"],
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
 * Subtle confetti for small wins
 */
export function subtleConfetti() {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    colors: ["#3b82f6", "#a855f7"],
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    colors: ["#ec4899", "#10b981"],
  });
}

/**
 * Story mode completion confetti - full screen celebration
 */
export function storyCompleteConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 999,
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#ffd700", "#ffa500", "#ff69b4"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#00ff00", "#00bfff", "#a855f7"],
    });
  }, 250);
}

/**
 * Year-over-year improvement confetti
 */
export function improvementConfetti() {
  confetti({
    particleCount: 80,
    angle: 90,
    spread: 45,
    origin: { x: 0.5, y: 0.8 },
    colors: ["#10b981", "#22c55e", "#16a34a"],
    shapes: ["circle"],
  });
}

/**
 * Streak achievement confetti
 */
export function streakConfetti() {
  const end = Date.now() + 1000;
  const colors = ["#fbbf24", "#f59e0b", "#d97706"];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}
