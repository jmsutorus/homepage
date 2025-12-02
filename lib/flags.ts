import { remoteConfig } from "@/lib/firebase/admin";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let templateCache: {
  template: any;
  timestamp: number;
} | null = null;

/**
 * Fetches the Remote Config template with caching
 * Cache is stored in memory and refreshed every 5 minutes
 */
async function getCachedTemplate() {
  const now = Date.now();

  // Return cached template if it exists and is not expired
  if (templateCache && now - templateCache.timestamp < CACHE_TTL) {
    return templateCache.template;
  }

  // Fetch fresh template from Firebase
  try {
    const template = await remoteConfig.getTemplate();
    templateCache = {
      template,
      timestamp: now,
    };
    return template;
  } catch (error) {
    console.error("Error fetching Remote Config template:", error);

    // If fetch fails but we have a stale cache, use it anyway
    if (templateCache) {
      console.warn("Using stale cache due to fetch error");
      return templateCache.template;
    }

    throw error;
  }
}

export async function getFeatureFlag(key: string, defaultValue: boolean = false): Promise<boolean> {
  try {
    const template = await getCachedTemplate();
    const parameter = template.parameters[key];

    if (!parameter || !parameter.defaultValue) {
      return defaultValue;
    }


    const value = (parameter.defaultValue as any).value;
    return value === "true";
  } catch (error) {
    console.error(`Error fetching feature flag ${key}:`, error);
    return defaultValue;
  }
}

export async function getFeatureFlagString(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const template = await getCachedTemplate();
    const parameter = template.parameters[key];

    if (!parameter || !parameter.defaultValue) {
      return defaultValue;
    }


    return (parameter.defaultValue as any).value || defaultValue;
  } catch (error) {
    console.error(`Error fetching feature flag ${key}:`, error);
    return defaultValue;
  }
}
