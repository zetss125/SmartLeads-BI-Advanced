import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { validateAPIKey } from "@/lib/apiKeys";
import { checkRateLimit } from "@/lib/rateLimit";
import { APIScope } from "@/types";

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function enforceAuth(request: NextRequest, requiredScope?: APIScope) {
  let isAuthenticated = false;
  let identifier = "";
  let rateLimitConfig = { max: 120, windowMs: 60000 };

  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer slk_")) {
    const token = authHeader.split(" ")[1];
    const apiKey = validateAPIKey(token, requiredScope);
    
    if (apiKey) {
      isAuthenticated = true;
      identifier = apiKey.id;
      rateLimitConfig.max = apiKey.rateLimit || 60;
    } else {
      return { error: NextResponse.json({ error: "Invalid API key or insufficient scope" }, { status: 401 }) };
    }
  } else {
    const token = request.cookies.get("token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        isAuthenticated = true;
        identifier = decoded.id;
      }
    }
  }

  if (!isAuthenticated) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  // Rate Limiting
  const rl = checkRateLimit(identifier, rateLimitConfig.max, rateLimitConfig.windowMs);
  if (!rl.allowed) {
    return { 
      error: NextResponse.json(
        { error: "Rate limit exceeded" },
        { 
          status: 429, 
          headers: {
            "Retry-After": Math.ceil((new Date(rl.info.resetAt).getTime() - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rl.info.limit.toString(),
            "X-RateLimit-Remaining": rl.info.remaining.toString(),
            "X-RateLimit-Reset": rl.info.resetAt,
          } 
        }
      )
    };
  }

  return { 
    user: identifier, 
    headers: {
      "X-RateLimit-Limit": rl.info.limit.toString(),
      "X-RateLimit-Remaining": rl.info.remaining.toString(),
      "X-RateLimit-Reset": rl.info.resetAt,
    }
  };
}
