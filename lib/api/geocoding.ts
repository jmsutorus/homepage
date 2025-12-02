/**
 * Geocoding service to convert city names to coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface GeocodingResult {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Convert city name to coordinates using OpenStreetMap Nominatim
 * Example: "Denver, CO" -> { lat: 39.7392, lon: -104.9903 }
 */
export async function geocodeCity(
  cityName: string
): Promise<GeocodingResult | null> {
  try {
    // Clean and validate input
    const cleanCity = cityName.trim();
    if (!cleanCity) {
      throw new Error("City name is required");
    }

    // Add USA to the query for better results
    const searchQuery = `${cleanCity}, USA`;

    // Use OpenStreetMap Nominatim (free, no API key)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchQuery
    )}&format=json&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Homepage-Weather-Widget/1.0",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours (city coords don't change)
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    // Parse Nominatim response
    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];

    // Extract city and state from address components
    const address = result.address || {};
    const city =
      address.city || address.town || address.village || address.county || "";
    const state = address.state || "";

    return {
      city,
      state,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Validate that a location string is in the correct format
 * Expected: "City, ST" or "City Name, ST"
 */
export function validateLocationFormat(location: string): boolean {
  // Basic validation: should contain a comma and state abbreviation
  const pattern = /^[a-zA-Z\s]+,\s*[A-Z]{2}$/;
  return pattern.test(location.trim());
}
