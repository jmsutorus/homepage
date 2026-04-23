import { getAdminStorage } from "./admin";

/**
 * Deletes a file from Firebase Storage if it's a Firebase Storage URL.
 * @param url The full URL of the file in Firebase Storage.
 * @returns Promise<boolean> True if deletion was attempted (and succeeded or file didn't exist), false if not a Firebase URL.
 */
export async function deleteFromStorage(url: string): Promise<boolean> {
  if (!url || !url.includes("firebasestorage.googleapis.com")) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    const pathPart = urlObj.pathname.split("/o/")[1];
    if (pathPart) {
      const filePath = decodeURIComponent(pathPart);
      const bucket = getAdminStorage().bucket();
      const storageFile = bucket.file(filePath);
      
      const [exists] = await storageFile.exists();
      if (exists) {
        await storageFile.delete();
        console.log(`Deleted file from storage: ${filePath}`);
      }
      return true;
    }
  } catch (error) {
    console.error("Error deleting from Firebase Storage:", error);
    // We return true here because we attempted and it either worked or errored out, 
    // but we don't want to block database deletions usually.
    return true; 
  }
  
  return false;
}
