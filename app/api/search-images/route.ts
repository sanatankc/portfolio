import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { env } from '@/app/env';

// Initialize Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

// Helper function to generate cache key
function generateCacheKey(query: string, page: number, perPage: number): string {
  return `image_search:${query.toLowerCase().trim()}:${page}:${perPage}`;
}

interface UnsplashImage {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  downloads: number;
  likes: number;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    small_s3: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    portfolio_url: string | null;
    bio: string | null;
    location: string | null;
    total_likes: number;
    total_photos: number;
    total_collections: number;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

interface ImageSearchResult {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    profile_image: string;
  };
  likes: number;
  downloads: number;
  color: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (perPage > 30) {
      return NextResponse.json(
        { error: 'Maximum 30 images per request allowed' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey(query, page, perPage);

    try {
      // Check if data exists in cache
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for query: ${query}, page: ${page}, per_page: ${perPage}`);
        return NextResponse.json({
          ...cachedData,
          cached: true,
          cache_key: cacheKey,
        });
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError);
      // Continue with API call if cache fails
    }

    console.log(`Cache miss for query: ${query}, page: ${page}, per_page: ${perPage}`);

    // Fetch from Unsplash API
    const unsplashUrl = new URL('https://api.unsplash.com/search/photos');
    unsplashUrl.searchParams.set('query', query);
    unsplashUrl.searchParams.set('page', page.toString());
    unsplashUrl.searchParams.set('per_page', Math.min(perPage, 10).toString());
    unsplashUrl.searchParams.set('order_by', 'relevant');

    const response = await fetch(unsplashUrl.toString(), {
      headers: {
        'Authorization': `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Unsplash API credentials' },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Unsplash API rate limit exceeded' },
          { status: 429 }
        );
      }
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data: UnsplashSearchResponse = await response.json();

    // Transform the data to only include relevant fields
    const transformedResults: ImageSearchResult[] = data.results.map((image) => ({
      id: image.id,
      description: image.description,
      alt_description: image.alt_description,
      urls: {
        regular: image.urls.regular,
        small: image.urls.small,
        thumb: image.urls.thumb,
      },
      user: {
        name: image.user.name,
        username: image.user.username,
        profile_image: image.user.profile_image.medium,
      },
      likes: image.likes,
      downloads: image.downloads,
      color: image.color,
    }));

    const responseData = {
      total: data.total,
      total_pages: data.total_pages,
      current_page: page,
      per_page: perPage,
      results: transformedResults,
    };

    // Cache the results
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(responseData));
      console.log(`Cached results for query: ${query}, page: ${page}, per_page: ${perPage}`);
    } catch (cacheError) {
      console.warn('Cache write error:', cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json({
      ...responseData,
      cached: false,
      cache_key: cacheKey,
    });

  } catch (error) {
    console.error('Image search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, page = 1, per_page = 10 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required in request body' },
        { status: 400 }
      );
    }

    if (per_page > 30) {
      return NextResponse.json(
        { error: 'Maximum 30 images per request allowed' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey(query, page, per_page);

    try {
      // Check if data exists in cache
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for query: ${query}, page: ${page}, per_page: ${per_page}`);
        return NextResponse.json({
          ...cachedData,
          cached: true,
          cache_key: cacheKey,
        });
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError);
      // Continue with API call if cache fails
    }

    console.log(`Cache miss for query: ${query}, page: ${page}, per_page: ${per_page}`);

    // Fetch from Unsplash API
    const unsplashUrl = new URL('https://api.unsplash.com/search/photos');
    unsplashUrl.searchParams.set('query', query);
    unsplashUrl.searchParams.set('page', page.toString());
    unsplashUrl.searchParams.set('per_page', Math.min(per_page, 10).toString());
    unsplashUrl.searchParams.set('order_by', 'relevant');

    const response = await fetch(unsplashUrl.toString(), {
      headers: {
        'Authorization': `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Unsplash API credentials' },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Unsplash API rate limit exceeded' },
          { status: 429 }
        );
      }
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data: UnsplashSearchResponse = await response.json();

    // Transform the data to only include relevant fields
    const transformedResults: ImageSearchResult[] = data.results.map((image) => ({
      id: image.id,
      description: image.description,
      alt_description: image.alt_description,
      urls: {
        regular: image.urls.regular,
        small: image.urls.small,
        thumb: image.urls.thumb,
      },
      user: {
        name: image.user.name,
        username: image.user.username,
        profile_image: image.user.profile_image.medium,
      },
      likes: image.likes,
      downloads: image.downloads,
      color: image.color,
    }));

    const responseData = {
      total: data.total,
      total_pages: data.total_pages,
      current_page: page,
      per_page: per_page,
      results: transformedResults,
    };

    // Cache the results
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(responseData));
      console.log(`Cached results for query: ${query}, page: ${page}, per_page: ${per_page}`);
    } catch (cacheError) {
      console.warn('Cache write error:', cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json({
      ...responseData,
      cached: false,
      cache_key: cacheKey,
    });

  } catch (error) {
    console.error('Image search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 