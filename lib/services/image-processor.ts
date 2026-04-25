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

  // Fetch token using google-auth-library if not testing locally
  let token = "";
  if (!BACKEND_URL.includes("localhost") && !BACKEND_URL.includes("127.0.0.1")) {
    try {
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(BACKEND_URL);
      if (client.idTokenProvider) {
        token = await client.idTokenProvider.fetchIdToken(BACKEND_URL);
      }
    } catch (authError) {
      console.error("Failed to fetch OIDC token for image conversion:", authError);
    }
  }

  const formData = new FormData();
  formData.append("file", file);

  const targetUrl = new URL(`${BACKEND_URL}/convert-to-webp`);
  targetUrl.searchParams.append("quality", quality.toString());
  targetUrl.searchParams.append("lossless", lossless.toString());

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(targetUrl.toString(), {
    method: "POST",
    headers,
    body: formData,
  });

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
