import { getCachedValue, setCachedValue } from "@/lib/db/cache";

const DUOLINGO_API_BASE = "https://www.duolingo.com/2017-06-30";

export interface DuolingoProfile {
  id: number;
  username: string;
  name: string;
  picture: string;
  streak: number;
  totalXp: number;
  courses: {
    title: string;
    xp: number;
    id: string;
  }[];
  currentCourseId: string;
  learningLanguage: string;
  hasPlus: boolean;
}

export interface DuolingoActivity {
  datetime: number; // Unix timestamp
  improvement: number; // XP gained: 0 means no lessons completed
}

// Unofficial API response types
interface DuolingoUserResponse {
  users: {
    id: number;
    username: string;
    name: string;
    picture: string;
    streak: number;
    totalXp: number;
    courses: {
      title: string;
      xp: number;
      id: string;
    }[];
    currentCourseId: string;
    learningLanguage: string;
    hasPlus: boolean;
  }[];
}

/**
 * Get Duolingo user profile
 */
export async function getDuolingoProfile(userId: string, username: string): Promise<DuolingoProfile | null> {
  const cacheKey = `duolingo_profile_${username}`;
  // const cached = await getCachedValue<DuolingoProfile>(cacheKey, userId);
  // if (cached) return cached;

  try {
    const response = await fetch(`${DUOLINGO_API_BASE}/users?username=${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Homepage/1.0)"
      },
    });

    console.log("Response:", response);

    if (!response.ok) {
      console.error(`Duolingo API error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as DuolingoUserResponse;
    const user = data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());

    console.log("User:", user);

    if (!user) return null;

    const profile: DuolingoProfile = {
      id: user.id,
      username: user.username,
      name: user.name,
      picture: (user.picture.startsWith("//") ? "https:" + user.picture : user.picture) + "/xxlarge", // Use larger image
      streak: user.streak,
      totalXp: user.totalXp,
      courses: user.courses,
      currentCourseId: user.currentCourseId,
      learningLanguage: user.learningLanguage,
      hasPlus: user.hasPlus,
    };


    // Cache for 1 hour
    // await setCachedValue(cacheKey, profile, userId, 60 * 60);

    return profile;
  } catch (error) {
    console.error("Failed to fetch Duolingo profile:", error);
    return null;
  }
}

/**
 * Get Duolingo calendar/activity data
 * Note: The API doesn't seem to expose simple daily history in this endpoint.
 * We'll need a better strategy or just track streak for now.
 */
export async function getDuolingoCalendar(userId: string, username: string) {
    // Placeholder
    return [];
}
