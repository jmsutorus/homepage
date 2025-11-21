import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * POST /api/imdb/search
 * Body: { query: string } - Movie/TV show name or IMDB ID
 *
 * Searches IMDB via OMDb API and returns formatted media data
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

    // Check if API key is configured
    const apiKey = env.OMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OMDb API key is not configured. Please add OMDB_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Determine if query is an IMDB ID or title
    const isImdbId = query.trim().toLowerCase().startsWith('tt');

    // Build API URL
    const searchParam = isImdbId ? `i=${encodeURIComponent(query.trim())}` : `t=${encodeURIComponent(query.trim())}`;
    const apiUrl = `https://www.omdbapi.com/?${searchParam}&apikey=${apiKey}&plot=full`;

    // Fetch from OMDb API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch from OMDb API');
    }

    const data = await response.json();

    // Check if the API returned an error
    if (data.Response === 'False') {
      return NextResponse.json(
        { error: data.Error || 'Movie/TV show not found' },
        { status: 404 }
      );
    }

    // Parse and format the data
    const mediaType = data.Type === 'movie' ? 'movie' : data.Type === 'series' ? 'tv' : null;

    if (!mediaType) {
      return NextResponse.json(
        { error: 'Only movies and TV series are supported' },
        { status: 400 }
      );
    }

    // Parse rating (convert from "x.x/10" to number)
    let rating: number | undefined;
    if (data.imdbRating && data.imdbRating !== 'N/A') {
      const parsedRating = parseFloat(data.imdbRating);
      if (!isNaN(parsedRating)) {
        rating = parsedRating;
      }
    }

    // Parse genres
    const genres = data.Genre && data.Genre !== 'N/A'
      ? data.Genre.split(',').map((g: string) => g.trim().toLowerCase())
      : [];

    // Parse release date (format: "25 Dec 2010" or "2010")
    let released: string | undefined;
    if (data.Released && data.Released !== 'N/A') {
      try {
        const releaseDate = new Date(data.Released);
        if (!isNaN(releaseDate.getTime())) {
          const year = releaseDate.getFullYear();
          const month = String(releaseDate.getMonth() + 1).padStart(2, '0');
          const day = String(releaseDate.getDate()).padStart(2, '0');
          released = `${year}-${month}-${day}`;
        }
      } catch {
        // If parsing fails, skip the release date
      }
    }

    // Parse runtime/length
    let length: string | undefined;
    if (data.Runtime && data.Runtime !== 'N/A') {
      length = data.Runtime; // e.g., "148 min"
    } else if (data.Type === 'series' && data.totalSeasons && data.totalSeasons !== 'N/A') {
      length = `${data.totalSeasons} seasons`;
    }

    // Parse creators (directors for movies, creators for TV shows)
    const creators: string[] = [];
    if (data.Director && data.Director !== 'N/A') {
      creators.push(...data.Director.split(',').map((d: string) => d.trim()));
    }
    // For TV shows, also add writers/creators if available
    if (mediaType === 'tv' && data.Writer && data.Writer !== 'N/A') {
      const writers = data.Writer.split(',').map((w: string) => w.trim());
      // Avoid duplicates
      writers.forEach((writer: string) => {
        if (!creators.includes(writer)) {
          creators.push(writer);
        }
      });
    }

    // Format the response
    const formattedData = {
      title: data.Title,
      type: mediaType,
      rating,
      released,
      genres,
      poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : undefined,
      description: data.Plot && data.Plot !== 'N/A' ? data.Plot : undefined,
      length,
      creator: creators.length > 0 ? creators : undefined,
      // Additional metadata that might be useful
      imdbId: data.imdbID,
      year: data.Year && data.Year !== 'N/A' ? data.Year : undefined,
      rated: data.Rated && data.Rated !== 'N/A' ? data.Rated : undefined,
      actors: data.Actors && data.Actors !== 'N/A' ? data.Actors : undefined,
    };

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error('Error searching IMDB:', error);
    return NextResponse.json(
      { error: 'Failed to search IMDB. Please try again.' },
      { status: 500 }
    );
  }
}
