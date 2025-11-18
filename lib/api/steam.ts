import { env } from "@/lib/env";

const STEAM_API_BASE = "http://api.steampowered.com";

export interface SteamPlayer {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  personastate: number;
  realname?: string;
  timecreated?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
  lastlogoff?: number;
  gameextrainfo?: string;
  gameid?: string;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_2weeks?: number;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
  has_community_visible_stats?: boolean;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
}

export interface SteamRecentGame {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
}

export interface SteamAchievement {
  apiname: string;
  achieved: number;
  unlocktime: number;
  name?: string;
  description?: string;
}

export interface SteamGameSchema {
  gameName: string;
  gameVersion: string;
  availableGameStats: {
    achievements?: Array<{
      name: string;
      defaultvalue: number;
      displayName: string;
      hidden: number;
      description: string;
      icon: string;
      icongray: string;
    }>;
  };
}

export interface RecentAchievement {
  gameName: string;
  gameId: number;
  achievementName: string;
  achievementDescription: string;
  unlockTime: number;
  icon: string;
}

/**
 * Make a request to the Steam API
 */
async function steamFetch<T>(endpoint: string): Promise<T> {
  const apiKey = env.STEAM_API_KEY;

  if (!apiKey) {
    throw new Error("Steam API key not configured");
  }

  const url = `${STEAM_API_BASE}${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }key=${apiKey}`;

  const response = await fetch(url, {
    next: { revalidate: env.CACHE_TTL_STEAM },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Steam API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get player summary (profile and online status)
 */
export async function getPlayerSummary(
  steamId?: string
): Promise<SteamPlayer | null> {
  const id = steamId || env.STEAM_ID;

  if (!id) {
    throw new Error("Steam ID not provided");
  }

  const data = await steamFetch<{
    response: { players: SteamPlayer[] };
  }>(`/ISteamUser/GetPlayerSummaries/v0002/?steamids=${id}`);

  return data.response.players[0] || null;
}

/**
 * Get recently played games (last 2 weeks)
 */
export async function getRecentlyPlayedGames(
  steamId?: string,
  count?: number
): Promise<SteamRecentGame[]> {
  const id = steamId || env.STEAM_ID;

  if (!id) {
    throw new Error("Steam ID not provided");
  }

  const params = new URLSearchParams({
    steamid: id,
  });

  if (count) {
    params.append('count', count.toString());
  }

  const data = await steamFetch<{
    response: { total_count?: number; games?: SteamRecentGame[] };
  }>(`/IPlayerService/GetRecentlyPlayedGames/v0001/?${params}`);

  console.log('[Steam API] GetRecentlyPlayedGames response:', JSON.stringify(data, null, 2));
  console.log('[Steam API] Total count:', data.response.total_count);
  console.log('[Steam API] Games array:', data.response.games);

  // Check if games array exists and has items
  if (!data.response.games || data.response.games.length === 0) {
    console.warn('[Steam API] No recent games found. This could be due to:');
    console.warn('  1. Steam profile privacy settings (must be public)');
    console.warn('  2. No games played in the last 2 weeks');
    console.warn('  3. Steam ID:', id);
  }

  return data.response.games || [];
}

/**
 * Get owned games
 */
export async function getOwnedGames(
  steamId?: string,
  includeAppInfo = true,
  includePlayedFreeGames = false
): Promise<SteamGame[]> {
  const id = steamId || env.STEAM_ID;

  if (!id) {
    throw new Error("Steam ID not provided");
  }

  const params = new URLSearchParams({
    steamid: id,
    include_appinfo: includeAppInfo ? "1" : "0",
    include_played_free_games: includePlayedFreeGames ? "1" : "0",
  });

  const data = await steamFetch<{
    response: { game_count: number; games: SteamGame[] };
  }>(`/IPlayerService/GetOwnedGames/v0001/?${params}`);

  return data.response.games || [];
}

/**
 * Get Steam app image URL
 */
export function getSteamImageUrl(
  appId: number,
  imageHash: string,
  type: "icon" | "logo" | "header" = "header"
): string {
  if (type === "icon") {
    return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${imageHash}.jpg`;
  }
  if (type === "logo") {
    return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${imageHash}.jpg`;
  }
  // header
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

/**
 * Format playtime from minutes to human readable
 */
export function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (hours < 100) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${hours.toFixed(0)}h`;
}

/**
 * Get persona state as human-readable status
 */
export function getPersonaState(state: number): string {
  const states: Record<number, string> = {
    0: "Offline",
    1: "Online",
    2: "Busy",
    3: "Away",
    4: "Snooze",
    5: "Looking to trade",
    6: "Looking to play",
  };
  return states[state] || "Unknown";
}

/**
 * Check if player is currently in-game
 */
export function isInGame(player: SteamPlayer): boolean {
  return !!player.gameid && !!player.gameextrainfo;
}

/**
 * Get game schema (includes achievement metadata)
 */
export async function getGameSchema(appId: number): Promise<SteamGameSchema | null> {
  try {
    const data = await steamFetch<{
      game: SteamGameSchema;
    }>(`/ISteamUserStats/GetSchemaForGame/v0002/?appid=${appId}`);
    return data.game || null;
  } catch (error) {
    console.error(`Failed to get schema for app ${appId}:`, error);
    return null;
  }
}

/**
 * Get player achievements for a specific game
 */
export async function getPlayerAchievements(
  appId: number,
  steamId?: string
): Promise<SteamAchievement[]> {
  const id = steamId || env.STEAM_ID;

  if (!id) {
    throw new Error("Steam ID not provided");
  }

  try {
    const data = await steamFetch<{
      playerstats: {
        steamID: string;
        gameName: string;
        achievements?: SteamAchievement[];
      };
    }>(`/ISteamUserStats/GetPlayerAchievements/v0001/?steamid=${id}&appid=${appId}`);

    return data.playerstats.achievements || [];
  } catch (error) {
    console.error(`Failed to get achievements for app ${appId}:`, error);
    return [];
  }
}

/**
 * Get recent achievements (from recently played games)
 */
export async function getRecentAchievements(
  steamId?: string,
  limit = 10
): Promise<RecentAchievement[]> {
  const id = steamId || env.STEAM_ID;

  if (!id) {
    throw new Error("Steam ID not provided");
  }

  try {
    // Get recently played games
    const recentGames = await getRecentlyPlayedGames(id);

    if (recentGames.length === 0) {
      return [];
    }

    const allAchievements: RecentAchievement[] = [];

    // For each recently played game, get achievements
    for (const game of recentGames.slice(0, 5)) {
      try {
        // Get player achievements for this game
        const achievements = await getPlayerAchievements(game.appid, id);

        // Get game schema for achievement details
        const schema = await getGameSchema(game.appid);

        // Filter for recently unlocked achievements (last 30 days)
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
        const recentUnlocked = achievements.filter(
          (a) => a.achieved === 1 && a.unlocktime > thirtyDaysAgo
        );

        // Map achievements with metadata
        for (const achievement of recentUnlocked) {
          const metadata = schema?.availableGameStats?.achievements?.find(
            (a) => a.name === achievement.apiname
          );

          if (metadata) {
            allAchievements.push({
              gameName: game.name,
              gameId: game.appid,
              achievementName: metadata.displayName,
              achievementDescription: metadata.description,
              unlockTime: achievement.unlocktime,
              icon: metadata.icon,
            });
          }
        }
      } catch (error) {
        // Skip games that don't have achievements or fail
        console.error(`Failed to get achievements for ${game.name}:`, error);
        continue;
      }
    }

    // Sort by unlock time (most recent first) and limit
    return allAchievements
      .sort((a, b) => b.unlockTime - a.unlockTime)
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get recent achievements:", error);
    return [];
  }
}
