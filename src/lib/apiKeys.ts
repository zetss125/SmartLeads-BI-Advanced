import { APIKey, APIScope } from "@/types";
import { getAPIKeysStore } from "@/lib/persistentStore";
import { generateId, hashAPIKey, generateAPIKeyToken } from "@/lib/encryption";
import { recordAudit } from "@/store";

export function createAPIKey(userId: string, name: string, scopes: APIScope[]): { key: APIKey; token: string } {
  const token = generateAPIKeyToken();
  const hashedKey = hashAPIKey(token);
  const prefix = token.substring(0, 12); // Include slk_ + 8 chars

  const key: APIKey = {
    id: generateId("apikey"),
    name,
    hashedKey,
    prefix,
    userId,
    scopes,
    createdAt: new Date().toISOString(),
    rateLimit: 60, // Default 60 requests per minute
    active: true,
    requestCount: 0,
  };

  getAPIKeysStore().add(key);
  recordAudit({
    userId,
    action: "key_created",
    resource: `apikey:${key.id}`,
    details: `Created API key "${name}" with scopes: ${scopes.join(", ")}`,
  });

  return { key, token }; // Token is only returned once!
}

export function validateAPIKey(token: string, requiredScope?: APIScope): APIKey | null {
  if (!token || !token.startsWith("slk_")) return null;

  const hashedToken = hashAPIKey(token);
  const store = getAPIKeysStore();
  const keys = store.getAll() as APIKey[];

  const key = keys.find((k) => k.hashedKey === hashedToken && k.active);
  if (!key) return null;

  // Check expiration
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
    return null;
  }

  // Check scope
  if (requiredScope && !key.scopes.includes("admin:full") && !key.scopes.includes(requiredScope)) {
    return null;
  }

  // Update usage stats (fire and forget, don't wait for disk flush)
  store.update(key.id, {
    lastUsedAt: new Date().toISOString(),
    requestCount: (key.requestCount || 0) + 1,
  });

  return key;
}

export function revokeAPIKey(id: string, userId: string): boolean {
  const store = getAPIKeysStore();
  const key = store.getById(id) as APIKey | undefined;

  if (!key || key.userId !== userId) return false;

  store.update(id, { active: false });
  
  recordAudit({
    userId,
    action: "key_revoked",
    resource: `apikey:${id}`,
    details: `Revoked API key "${key.name}"`,
  });

  return true;
}

export function getUserAPIKeys(userId: string): Omit<APIKey, "hashedKey">[] {
  const store = getAPIKeysStore();
  const keys = store.getAll() as APIKey[];
  
  return keys
    .filter((k) => k.userId === userId && k.active)
    .map(({ hashedKey, ...rest }) => rest); // Strip hashed key before returning
}

export function updateAPIKey(id: string, userId: string, updates: Partial<Pick<APIKey, "name" | "scopes" | "rateLimit">>): APIKey | null {
  const store = getAPIKeysStore();
  const key = store.getById(id) as APIKey | undefined;

  if (!key || key.userId !== userId) return null;

  const updated = store.update(id, updates);
  return updated as APIKey | null;
}
