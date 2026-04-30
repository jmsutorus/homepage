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
    const { query, top } = body;

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

    let targetQuery = query.trim();
    const isImdbId = targetQuery.toLowerCase().startsWith('tt');

    // If it's not an ID and we want the top result, search for the ID first
    if (!isImdbId && top) {
      const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(targetQuery)}&apikey=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error('Failed to fetch from OMDb API');
      }

      const searchData = await searchResponse.json();

      if (searchData.Response === 'True' && searchData.Search && searchData.Search.length > 0) {
        // Use the ID of the first result
        targetQuery = searchData.Search[0].imdbID;
      } else {
        return NextResponse.json(
          { error: searchData.Error || 'Movie/TV show not found' },
          { status: 404 }
        );
      }
    }

    // Determine if we are now looking for a specific ID (either originally or from top search)
    const finalizedIsImdbId = targetQuery.toLowerCase().startsWith('tt');

    if (finalizedIsImdbId) {
      // Build API URL for full details
      const apiUrl = `https://www.omdbapi.com/?i=${encodeURIComponent(targetQuery)}&apikey=${apiKey}&plot=full`;

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
      
      // Add Directors
      if (data.Director && data.Director !== 'N/A') {
        creators.push(...data.Director.split(',').map((d: string) => d.trim()));
      }
      
      // Check for explicit Creator field (some OMDb responses or future versions might have this)
      if (data.Creator && data.Creator !== 'N/A') {
        const explicitCreators = data.Creator.split(',').map((c: string) => c.trim());
        explicitCreators.forEach((c: string) => {
          if (!creators.includes(c)) {
            creators.push(c);
          }
        });
      }

      // For TV shows, also add writers/creators if available
      if (mediaType === 'tv' && data.Writer && data.Writer !== 'N/A') {
        const writers = data.Writer.split(',').map((w: string) => w.trim());
        // Avoid duplicates
        writers.forEach((writer: string) => {
          // Remove "(creator)" or other parenthetical notes if present
          const cleanWriter = writer.replace(/\s*\([^)]*\)/g, '').trim();
          if (cleanWriter && !creators.includes(cleanWriter)) {
            creators.push(cleanWriter);
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
    } else {
      // Build API URL for search list
      const apiUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(targetQuery)}&apikey=${apiKey}`;

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

      if (!data.Search || !Array.isArray(data.Search)) {
        return NextResponse.json(
          { error: 'No results found' },
          { status: 404 }
        );
      }

      // Filter and map basic search results
      const results = data.Search.filter((item: any) => item.Type === 'movie' || item.Type === 'series')
        .map((item: any) => ({
          title: item.Title,
          type: item.Type === 'movie' ? 'movie' : 'tv',
          imdbId: item.imdbID,
          poster: item.Poster && item.Poster !== 'N/A' ? item.Poster : undefined,
          released: item.Year && item.Year !== 'N/A' ? item.Year : undefined,
        }));

      return NextResponse.json(results, { status: 200 });
    }
  } catch (error) {
    console.error('Error searching IMDB:', error);
    return NextResponse.json(
      { error: 'Failed to search IMDB. Please try again.' },
      { status: 500 }
    );
  }
}
