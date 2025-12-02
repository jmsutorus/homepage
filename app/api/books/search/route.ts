import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * POST /api/books/search
 * Body: { query: string } - Book title, author, or ISBN
 *
 * Searches Google Books API and returns formatted book data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Build API URL for Google Books
    // The API doesn't strictly require an API key for basic searches, but having one increases quota
    const apiKey = env.GOOGLE_BOOKS_API_KEY;
    const encodedQuery = encodeURIComponent(query.trim());

    let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=1&printType=books`;

    // Add API key if available
    if (apiKey) {
      apiUrl += `&key=${apiKey}`;
    }

    // Fetch from Google Books API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API');
    }

    const data = await response.json();

    // Check if any results were found
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Book not found. Try a different search term or ISBN.' },
        { status: 404 }
      );
    }

    // Get the first result
    const book = data.items[0];
    const volumeInfo = book.volumeInfo || {};

    // Parse and format the data
    // Parse rating (Google Books uses 0-5 scale, we use 0-10)
    let rating: number | undefined;
    if (volumeInfo.averageRating) {
      // Convert from 0-5 to 0-10 scale
      rating = (volumeInfo.averageRating / 5) * 10;
      // Round to 1 decimal place
      rating = Math.round(rating * 10) / 10;
    }

    // Parse genres/categories
    const genres: string[] = [];
    if (volumeInfo.categories && Array.isArray(volumeInfo.categories)) {
      volumeInfo.categories.forEach((category: string) => {
        // Categories are often in format "Fiction / Science Fiction"
        // Split by / and take individual genres
        category.split('/').forEach((genre) => {
          const trimmed = genre.trim().toLowerCase();
          if (trimmed && !genres.includes(trimmed)) {
            genres.push(trimmed);
          }
        });
      });
    }

    // Parse release date (format: "YYYY-MM-DD" or "YYYY-MM" or "YYYY")
    let released: string | undefined;
    if (volumeInfo.publishedDate) {
      const dateStr = volumeInfo.publishedDate;

      // Try to parse and format to YYYY-MM-DD
      if (dateStr.length === 10 && dateStr.includes('-')) {
        // Already in YYYY-MM-DD format
        released = dateStr;
      } else if (dateStr.length === 7 && dateStr.includes('-')) {
        // YYYY-MM format, add day as 01
        released = `${dateStr}-01`;
      } else if (dateStr.length === 4) {
        // Just year YYYY, add month and day as 01
        released = `${dateStr}-01-01`;
      } else {
        // Try to parse as a date
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            released = `${year}-${month}-${day}`;
          }
        } catch {
          // If parsing fails, skip the release date
        }
      }
    }

    // Parse length (page count)
    let length: string | undefined;
    if (volumeInfo.pageCount) {
      length = `${volumeInfo.pageCount} pages`;
    }

    // Parse authors
    const creators: string[] = [];
    if (volumeInfo.authors && Array.isArray(volumeInfo.authors)) {
      creators.push(...volumeInfo.authors);
    }

    // Get the best quality poster/cover image
    let poster: string | undefined;
    if (volumeInfo.imageLinks) {
      // Prefer larger images
      poster = volumeInfo.imageLinks.extraLarge
        || volumeInfo.imageLinks.large
        || volumeInfo.imageLinks.medium
        || volumeInfo.imageLinks.small
        || volumeInfo.imageLinks.thumbnail
        || volumeInfo.imageLinks.smallThumbnail;

      // Replace http with https for security
      if (poster) {
        poster = poster.replace('http://', 'https://');
        // Remove edge=curl parameter for better image quality
        poster = poster.replace('&edge=curl', '');
        // Increase zoom level for better quality (zoom=1 is default, we want higher)
        poster = poster.replace('zoom=1', 'zoom=2');
      }
    }

    // Format the response
    const formattedData = {
      title: volumeInfo.title || 'Unknown Title',
      type: 'book' as const,
      rating,
      released,
      genres: genres.length > 0 ? genres : undefined,
      poster,
      description: volumeInfo.description || undefined,
      length,
      creator: creators.length > 0 ? creators : undefined,
      // Additional metadata that might be useful
      isbn: volumeInfo.industryIdentifiers
        ? volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13')?.identifier
          || volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10')?.identifier
        : undefined,
      publisher: volumeInfo.publisher || undefined,
      language: volumeInfo.language || undefined,
      infoLink: volumeInfo.infoLink || undefined,
    };

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return NextResponse.json(
      { error: 'Failed to search Google Books. Please try again.' },
      { status: 500 }
    );
  }
}
