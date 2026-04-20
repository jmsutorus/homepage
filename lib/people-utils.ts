/**
 * Utility functions for people data (birthdays, ages, etc.)
 * These functions are safe to use in both server and client components
 */

/**
 * Calculate age from birthday string
 * Returns null if year is unknown (0000-MM-DD format)
 */
export function calculateAge(birthday: string): number | null {
  if (!birthday) return null;

  const [year] = birthday.split('-');

  // Year unknown
  if (year === '0000') return null;

  const birthDate = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate next birthday occurrence (YYYY-MM-DD)
 * Uses current year or next year depending on if birthday has passed
 */
export function calculateNextBirthday(birthday: string): string {
  if (!birthday) return '';

  const [, month, day] = birthday.split('-');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  // Create birthday date for this year
  let nextBirthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));

  // If birthday has already passed this year, use next year
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
  }

  // Return in YYYY-MM-DD format
  const year_str = nextBirthday.getFullYear();
  const month_str = String(nextBirthday.getMonth() + 1).padStart(2, '0');
  const day_str = String(nextBirthday.getDate()).padStart(2, '0');
  return `${year_str}-${month_str}-${day_str}`;
}

/**
 * Calculate days until next birthday
 */
export function calculateDaysUntilBirthday(birthday: string): number {
  if (!birthday) return 0;

  const nextBirthdayStr = calculateNextBirthday(birthday);
  const [year, month, day] = nextBirthdayStr.split('-');
  const nextBirthday = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calculate years together from anniversary date
 * Returns null if year is unknown (0000-MM-DD format)
 */
export function calculateYearsTogether(anniversary: string): number | null {
  if (!anniversary) return null;

  const [year] = anniversary.split('-');

  // Year unknown
  if (year === '0000') return null;

  const anniversaryDate = new Date(anniversary);
  const today = new Date();

  let years = today.getFullYear() - anniversaryDate.getFullYear();
  const monthDiff = today.getMonth() - anniversaryDate.getMonth();

  // Adjust if anniversary hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < anniversaryDate.getDate())) {
    years--;
  }

  return years;
}

/**
 * Calculate next anniversary occurrence (YYYY-MM-DD)
 * Uses current year or next year depending on if anniversary has passed
 */
export function calculateNextAnniversary(anniversary: string): string {
  if (!anniversary) return '';

  const [, month, day] = anniversary.split('-');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  // Create anniversary date for this year
  let nextAnniversary = new Date(currentYear, parseInt(month) - 1, parseInt(day));

  // If anniversary has already passed this year, use next year
  if (nextAnniversary < today) {
    nextAnniversary = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
  }

  // Return in YYYY-MM-DD format
  const year_str = nextAnniversary.getFullYear();
  const month_str = String(nextAnniversary.getMonth() + 1).padStart(2, '0');
  const day_str = String(nextAnniversary.getDate()).padStart(2, '0');
  return `${year_str}-${month_str}-${day_str}`;
}

/**
 * Calculate days until next anniversary
 */
export function calculateDaysUntilAnniversary(anniversary: string): number {
  if (!anniversary) return 0;

  const nextAnniversaryStr = calculateNextAnniversary(anniversary);
  const [year, month, day] = nextAnniversaryStr.split('-');
  const nextAnniversary = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = nextAnniversary.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
