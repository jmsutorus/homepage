import { env } from "@/lib/env";

export interface TautulliActivity {
  session_key: string;
  user: string;
  user_id: number;
  player: string;
  platform: string;
  media_type: string;
  title: string;
  grandparent_title?: string;
  year?: number;
  rating_key: string;
  parent_rating_key?: string;
  grandparent_rating_key?: string;
  thumb: string;
  art: string;
  state: string;
  view_offset: number;
  duration: number;
  progress_percent: number;
  quality_profile: string;
  stream_video_resolution: string;
  stream_container: string;
  bandwidth: number;
}

export interface TautulliLibrary {
  section_id: number;
  section_name: string;
  section_type: string;
  count: number;
  parent_count?: number;
  child_count?: number;
}

export interface TautulliRecentlyAdded {
  added_at: number;
  media_type: string;
  title: string;
  year?: number;
  thumb: string;
  art: string;
  rating_key: string;
  parent_rating_key?: string;
  grandparent_rating_key?: string;
  grandparent_title?: string;
}

export interface TautulliServerInfo {
  pms_identifier: string;
  pms_name: string;
  pms_version: string;
  pms_platform: string;
  pms_ip: string;
  pms_port: number;
  pms_is_remote: number;
  pms_web_url: string;
}

/**
 * Make a request to the Tautulli API
 */
async function tautulliFetch<T>(
  cmd: string,
  params: Record<string, any> = {}
): Promise<T> {
  const baseUrl = env.TAUTULLI_URL;
  const apiKey = env.TAUTULLI_API_KEY;

  if (!baseUrl) {
    throw new Error("Tautulli URL not configured");
  }

  if (!apiKey) {
    throw new Error("Tautulli API key not configured");
  }

  const url = new URL(`${baseUrl}/api/v2`);
  url.searchParams.append("apikey", apiKey);
  url.searchParams.append("cmd", cmd);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: env.CACHE_TTL_PLEX },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tautulli API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (data.response.result !== "success") {
    throw new Error(
      `Tautulli API error: ${data.response.message || "Unknown error"}`
    );
  }

  return data.response.data;
}

/**
 * Get current activity (active streams)
 */
export async function getActivity(): Promise<{
  stream_count: number;
  sessions: TautulliActivity[];
}> {
  return tautulliFetch("get_activity");
}

/**
 * Get library sections
 */
export async function getLibraries(): Promise<TautulliLibrary[]> {
  return tautulliFetch("get_libraries");
}

/**
 * Get recently added media
 */
export async function getRecentlyAdded(
  count = 10
): Promise<{ recently_added: TautulliRecentlyAdded[] }> {
  return tautulliFetch("get_recently_added", { count });
}

/**
 * Get server info
 */
export async function getServerInfo(): Promise<TautulliServerInfo> {
  return tautulliFetch("get_server_info");
}

/**
 * Get Plex image URL
 */
export function getPlexImageUrl(
  imagePath: string,
  width = 300,
  height = 450
): string {
  const baseUrl = env.TAUTULLI_URL;
  const apiKey = env.TAUTULLI_API_KEY;

  if (!baseUrl || !apiKey) {
    return "";
  }

  const url = new URL(`${baseUrl}/api/v2`);
  url.searchParams.append("apikey", apiKey);
  url.searchParams.append("cmd", "pms_image_proxy");
  url.searchParams.append("img", imagePath);
  url.searchParams.append("width", String(width));
  url.searchParams.append("height", String(height));

  return url.toString();
}

/**
 * Format media type for display
 */
export function formatMediaType(mediaType: string): string {
  const types: Record<string, string> = {
    movie: "Movie",
    episode: "TV Episode",
    track: "Music",
    photo: "Photo",
  };
  return types[mediaType] || mediaType;
}

/**
 * Format progress percentage
 */
export function formatProgress(viewOffset: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.round((viewOffset / duration) * 100);
}

/**
 * Get stream quality badge color
 */
export function getQualityColor(resolution: string): string {
  if (resolution.includes("4K") || resolution.includes("2160")) {
    return "bg-purple-500/10 text-purple-500";
  }
  if (resolution.includes("1080")) {
    return "bg-blue-500/10 text-blue-500";
  }
  if (resolution.includes("720")) {
    return "bg-green-500/10 text-green-500";
  }
  return "bg-gray-500/10 text-gray-500";
}
