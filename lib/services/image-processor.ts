import { GoogleAuth } from "google-auth-library";

const BACKEND_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:8000"
  : (process.env.IMAGE_PROCESSING_URL || "https://image-processing-backend-705251858590.us-central1.run.app");

/**
 * Checks if a file needs to be converted to WebP and performs the conversion
 * using the GCP Image Processing service.
 * 
 * If the file is already a JPG, PNG, or WebP, it is returned unchanged.
 */
export async function convertToWebP(
  file: File,
  quality = 85,
  lossless = false
): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  
  // If the user uploads an image that is not a jpg, png, or webp, convert it to webp
  const allowedTypes = ["jpg", "jpeg", "png", "webp"];
  if (allowedTypes.includes(extension)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      buffer,
      fileName: file.name,
      contentType: file.type,
    };
  }

  console.log(`Image processor: converting file ${file.name} (${extension}) to WebP...`);

  let currentBackendUrl = BACKEND_URL;
  let token = "";

  const fetchToken = async (url: string) => {
    if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
      try {
        const auth = new GoogleAuth();
        const client = await auth.getIdTokenClient(url);
        if (client.idTokenProvider) {
          return await client.idTokenProvider.fetchIdToken(url);
        }
      } catch (authError) {
        console.error(`Failed to fetch OIDC token for ${url}:`, authError);
      }
    }
    return "";
  };

  token = await fetchToken(currentBackendUrl);

  const formData = new FormData();
  formData.append("file", file);

  const tryFetch = async (baseUrl: string, authToken: string) => {
    const targetUrl = new URL(`${baseUrl}/convert-to-webp`);
    targetUrl.searchParams.append("quality", quality.toString());
    targetUrl.searchParams.append("lossless", lossless.toString());

    const headers: Record<string, string> = {};
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return await fetch(targetUrl.toString(), {
      method: "POST",
      headers,
      body: formData,
    });
  };

  let response;
  try {
    response = await tryFetch(currentBackendUrl, token);
  } catch (error) {
    if (
      ((error as any).code === "ECONNREFUSED" || (error as Error).message.includes("fetch failed")) &&
      currentBackendUrl.includes("localhost")
    ) {
      console.warn(`Local image processing service at ${currentBackendUrl} not running. Falling back to production...`);
      currentBackendUrl = "https://image-processing-backend-705251858590.us-central1.run.app";
      token = await fetchToken(currentBackendUrl);
      response = await tryFetch(currentBackendUrl, token);
    } else {
      throw error;
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to convert image to WebP. Status: ${response.status}. Error: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  
  // Determine new filename
  const lastDotIndex = file.name.lastIndexOf(".");
  const baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
  const newFileName = `${baseName}.webp`;

  console.log(`Image processor: successfully converted ${file.name} to ${newFileName}`);

  return {
    buffer: Buffer.from(arrayBuffer),
    fileName: newFileName,
    contentType: "image/webp",
  };
}
