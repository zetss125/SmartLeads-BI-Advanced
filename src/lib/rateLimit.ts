import { RateLimitInfo } from "@/types";

// Simple in-memory rate limiter
// Key: API Key ID or IP Address -> Window start time & count
const rateLimits = new Map<string, { count: number; windowStart: number }>();

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 120; // Default for web users (UI is chatty)

export function checkRateLimit(
  identifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): { allowed: boolean; info: RateLimitInfo } {
  const now = Date.now();
  
  let record = rateLimits.get(identifier);

  if (!record || now - record.windowStart >= windowMs) {
    // New window
    record = { count: 1, windowStart: now };
    rateLimits.set(identifier, record);
    
    return {
      allowed: true,
      info: {
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetAt: new Date(now + windowMs).toISOString(),
      },
    };
  }

  // Existing window
  record.count += 1;
  const remaining = Math.max(0, maxRequests - record.count);
  const allowed = record.count <= maxRequests;

  return {
    allowed,
    info: {
      limit: maxRequests,
      remaining,
      resetAt: new Date(record.windowStart + windowMs).toISOString(),
    },
  };
}

// Optional: cleanup task to prevent memory leaks over time
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimits.entries()) {
    if (now - record.windowStart >= DEFAULT_WINDOW_MS * 2) {
      rateLimits.delete(key);
    }
  }
}, DEFAULT_WINDOW_MS * 5);
