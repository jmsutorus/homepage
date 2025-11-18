import { env } from "@/lib/env";

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HAServiceCall {
  domain: string;
  service: string;
  service_data?: Record<string, any>;
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
}

/**
 * Make a request to the Home Assistant API
 */
async function haFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = env.HOMEASSISTANT_URL;
  const token = env.HOMEASSISTANT_TOKEN;

  if (!baseUrl) {
    throw new Error("Home Assistant URL not configured");
  }

  if (!token) {
    throw new Error("Home Assistant token not configured");
  }

  const url = `${baseUrl}/api${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: { revalidate: env.CACHE_TTL_HA },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Home Assistant API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get all entity states
 */
export async function getStates(): Promise<HAState[]> {
  return haFetch<HAState[]>("/states");
}

/**
 * Get a specific entity state
 */
export async function getState(entityId: string): Promise<HAState | null> {
  try {
    return await haFetch<HAState>(`/states/${entityId}`);
  } catch (error) {
    console.error(`Failed to get state for ${entityId}:`, error);
    return null;
  }
}

/**
 * Get multiple entity states by IDs
 */
export async function getMultipleStates(
  entityIds: string[]
): Promise<(HAState | null)[]> {
  const states = await getStates();
  const stateMap = new Map(states.map((state) => [state.entity_id, state]));

  return entityIds.map((id) => stateMap.get(id) || null);
}

/**
 * Call a Home Assistant service
 */
export async function callService(
  serviceCall: HAServiceCall
): Promise<HAState[]> {
  const endpoint = `/services/${serviceCall.domain}/${serviceCall.service}`;

  return haFetch<HAState[]>(endpoint, {
    method: "POST",
    body: JSON.stringify({
      ...serviceCall.service_data,
      ...serviceCall.target,
    }),
  });
}

/**
 * Check if Home Assistant is available
 */
export async function checkAvailability(): Promise<boolean> {
  try {
    const baseUrl = env.HOMEASSISTANT_URL;
    const token = env.HOMEASSISTANT_TOKEN;

    if (!baseUrl || !token) {
      return false;
    }

    const response = await fetch(`${baseUrl}/api/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Format entity state for display
 */
export function formatEntityState(state: HAState): string {
  // Binary sensors (on/off, open/closed, etc.)
  if (state.entity_id.startsWith("binary_sensor.")) {
    return state.state === "on" ? "Open" : "Closed";
  }

  // Numbers with units
  if (state.attributes.unit_of_measurement) {
    return `${state.state} ${state.attributes.unit_of_measurement}`;
  }

  // Capitalize first letter
  return state.state.charAt(0).toUpperCase() + state.state.slice(1);
}

/**
 * Get friendly name from entity attributes
 */
export function getFriendlyName(state: HAState): string {
  return state.attributes.friendly_name || state.entity_id;
}

/**
 * Check if entity is unavailable
 */
export function isUnavailable(state: HAState | null): boolean {
  return !state || state.state === "unavailable" || state.state === "unknown";
}
