import { NextRequest } from "next/server";
import axios from "axios";
import { validateSuggestionTerm, validateSource } from "@/lib/validation";

// Simple rate limiting store (in production, use Redis)
const suggestionRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Function to check rate limit for suggestions
function checkSuggestionRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 1 * 60 * 1000; // 1 minute window for suggestions
  const maxRequests = 30; // 30 requests per minute
  
  const key = ip;
  const current = suggestionRateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    suggestionRateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Function to sanitize suggestion input
function sanitizeSuggestionInput(input: string): string {
  return input
    .trim()
    .slice(0, 50) // Limit suggestion search length
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .toLowerCase();
}

const SUGGESTION_SOURCES = {
  e621: {
    url: "https://e621.net/tags.json",
    params: (term: string) => ({
      "search[name_matches]": `${term}*`,
      "search[order]": "count",
      limit: 10
    }),
    map: (data: any) => data.map((tag: any) => tag.name),
    headers: {
      'User-Agent': 'dark-post-viewer/1.0 (by user on GitHub Copilot)'
    }
  },
  rule34: {
    url: "https://api.rule34.xxx/index.php",
    params: (term: string) => ({
      page: "dapi",
      s: "tag",
      q: "index",
      name_pattern: `${term}%`,
      limit: 10
    }),
    map: (data: any) => {
      if (typeof data === 'string') {
        // Parse XML response
        const matches = data.match(/<tag[^>]+name="([^"]+)"/g);
        return matches ? matches.map((match: string) => {
          const nameMatch = match.match(/name="([^"]+)"/);
          return nameMatch ? nameMatch[1] : '';
        }).filter(Boolean) : [];
      }
      return [];
    },
    headers: {}
  },
  xbooru: {
    url: "https://xbooru.com/index.php",
    params: (term: string) => ({
      page: "dapi",
      s: "tag",
      q: "index",
      name_pattern: `${term}%`,
      limit: 10
    }),
    map: (data: any) => {
      if (typeof data === 'string') {
        // Parse XML response
        const matches = data.match(/<tag[^>]+name="([^"]+)"/g);
        return matches ? matches.map((match: string) => {
          const nameMatch = match.match(/name="([^"]+)"/);
          return nameMatch ? nameMatch[1] : '';
        }).filter(Boolean) : [];
      }
      return [];
    },
    headers: {}
  }
};

export async function GET(request: NextRequest) {
  // Rate limiting for suggestions
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkSuggestionRateLimit(ip)) {
    return Response.json({ error: "Rate limit exceeded" }, { 
      status: 429,
      headers: { 
        "Retry-After": "60",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }

  const searchParams = request.nextUrl.searchParams;
  
  // Enhanced validation
  const termValidation = validateSuggestionTerm(searchParams.get('term'));
  const sourceValidation = validateSource(searchParams.get('source'));

  if (!termValidation.isValid) {
    return Response.json({ error: termValidation.error }, { 
      status: 400,
      headers: { "X-Content-Type-Options": "nosniff" }
    });
  }

  const term = termValidation.sanitized!;
  const source = sourceValidation.sanitized!;

  try {
    const sourceConfig = SUGGESTION_SOURCES[source as keyof typeof SUGGESTION_SOURCES];
    if (!sourceConfig) {
      return Response.json({ error: 'Invalid source' }, { status: 400 });
    }

    const params = sourceConfig.params(term);
    const url = new URL(sourceConfig.url);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const response = await axios.get(url.toString(), {
      headers: {
        ...sourceConfig.headers,
        'Accept': 'application/json, text/xml'
      },
      timeout: 5000,
      maxContentLength: 1024 * 1024 // 1MB max for suggestions
    });

    const suggestions = sourceConfig.map(response.data);
    return Response.json(suggestions.slice(0, 10), {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minute cache
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block"
      }
    });

  } catch (error) {
    console.error('[SUGGESTIONS ERROR]', { source, term, error: (error as Error).message });
    return Response.json({ error: 'Service temporarily unavailable' }, { 
      status: 500,
      headers: { "X-Content-Type-Options": "nosniff" }
    });
  }
}
