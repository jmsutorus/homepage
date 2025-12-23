/**
 * Zodiac sign utilities for calculating and displaying astrological signs
 */

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

export interface ZodiacSign {
  name: string;
  emoji: string;
  element: ZodiacElement;
  dateRange: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Capricorn', emoji: '♑', element: 'earth', dateRange: 'Dec 22 - Jan 19' },
  { name: 'Aquarius', emoji: '♒', element: 'air', dateRange: 'Jan 20 - Feb 18' },
  { name: 'Pisces', emoji: '♓', element: 'water', dateRange: 'Feb 19 - Mar 20' },
  { name: 'Aries', emoji: '♈', element: 'fire', dateRange: 'Mar 21 - Apr 19' },
  { name: 'Taurus', emoji: '♉', element: 'earth', dateRange: 'Apr 20 - May 20' },
  { name: 'Gemini', emoji: '♊', element: 'air', dateRange: 'May 21 - Jun 20' },
  { name: 'Cancer', emoji: '♋', element: 'water', dateRange: 'Jun 21 - Jul 22' },
  { name: 'Leo', emoji: '♌', element: 'fire', dateRange: 'Jul 23 - Aug 22' },
  { name: 'Virgo', emoji: '♍', element: 'earth', dateRange: 'Aug 23 - Sep 22' },
  { name: 'Libra', emoji: '♎', element: 'air', dateRange: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', emoji: '♏', element: 'water', dateRange: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', emoji: '♐', element: 'fire', dateRange: 'Nov 22 - Dec 21' },
];

/**
 * Calculate zodiac sign from month and day
 */
export function getZodiacSign(month: number, day: number): ZodiacSign | null {
  // Validate input
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Capricorn spans year boundary (Dec 22 - Jan 19)
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return ZODIAC_SIGNS[0]; // Capricorn
  }
  // Aquarius (Jan 20 - Feb 18)
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return ZODIAC_SIGNS[1]; // Aquarius
  }
  // Pisces (Feb 19 - Mar 20)
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return ZODIAC_SIGNS[2]; // Pisces
  }
  // Aries (Mar 21 - Apr 19)
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return ZODIAC_SIGNS[3]; // Aries
  }
  // Taurus (Apr 20 - May 20)
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return ZODIAC_SIGNS[4]; // Taurus
  }
  // Gemini (May 21 - Jun 20)
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return ZODIAC_SIGNS[5]; // Gemini
  }
  // Cancer (Jun 21 - Jul 22)
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return ZODIAC_SIGNS[6]; // Cancer
  }
  // Leo (Jul 23 - Aug 22)
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return ZODIAC_SIGNS[7]; // Leo
  }
  // Virgo (Aug 23 - Sep 22)
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return ZODIAC_SIGNS[8]; // Virgo
  }
  // Libra (Sep 23 - Oct 22)
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return ZODIAC_SIGNS[9]; // Libra
  }
  // Scorpio (Oct 23 - Nov 21)
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return ZODIAC_SIGNS[10]; // Scorpio
  }
  // Sagittarius (Nov 22 - Dec 21)
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return ZODIAC_SIGNS[11]; // Sagittarius
  }

  return null;
}

/**
 * Calculate zodiac sign from birthday string (YYYY-MM-DD or 0000-MM-DD)
 */
export function getZodiacSignFromBirthday(birthday: string): ZodiacSign | null {
  if (!birthday) return null;

  const [, month, day] = birthday.split('-');
  return getZodiacSign(parseInt(month, 10), parseInt(day, 10));
}

/**
 * Get CSS color class for zodiac element
 */
export function getZodiacElementColor(element: ZodiacElement): string {
  const colors: Record<ZodiacElement, string> = {
    fire: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300',
    earth: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300',
    air: 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300',
    water: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
  };
  return colors[element];
}

/**
 * Get all zodiac signs (for reference/stats)
 */
export function getAllZodiacSigns(): ZodiacSign[] {
  return ZODIAC_SIGNS;
}
