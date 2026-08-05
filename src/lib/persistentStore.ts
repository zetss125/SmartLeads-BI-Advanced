import fs from "fs";
import path from "path";
import os from "os";

// Vercel serverless has a read-only filesystem except /tmp.
// Fall back to /tmp, then to in-memory if nothing is writable.
function resolveDataDir(): string {
  const candidates = [
    process.env.SMARTLEADS_DATA_DIR,
    path.join(os.tmpdir(), "smartleads-data"),
    path.join(process.cwd(), ".smartleads-data"),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      // Verify it is actually writable
      const probe = path.join(dir, `.probe-${Date.now()}`);
      fs.writeFileSync(probe, "ok", "utf8");
      fs.unlinkSync(probe);
      return dir;
    } catch {
      // Not writable, try next candidate
    }
  }

  return "";
}

let DATA_DIR = resolveDataDir();
let useMemoryFallback = DATA_DIR === "";

function setDataDir(dir: string): void {
  DATA_DIR = dir;
  useMemoryFallback = DATA_DIR === "";
}

function ensureDataDir(): void {
  if (useMemoryFallback) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    useMemoryFallback = true;
  }
}

export class PersistentStore<T extends { id?: string }> {
  private filePath: string;
  private memory: T[] = [];
  private cache: T[] | null = null;
  private writeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(filename: string) {
    this.filePath = DATA_DIR ? path.join(DATA_DIR, filename) : "";
  }

  load(): T[] {
    if (useMemoryFallback) return [...this.memory];
    if (this.cache !== null) return [...this.cache];

    try {
      if (this.filePath && fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf8");
        this.cache = JSON.parse(raw) as T[];
        return [...this.cache];
      }
    } catch {
      // Corrupted or unreadable file, start fresh
    }

    this.cache = [];
    return [];
  }

  private scheduleSave(): void {
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      this.flushToDisk();
    }, 100);
  }

  private flushToDisk(): void {
    if (useMemoryFallback) return;
    try {
      ensureDataDir();
      const data = JSON.stringify(this.cache || [], null, 2);
      fs.writeFileSync(this.filePath, data, "utf8");
    } catch {
      useMemoryFallback = true;
    }
  }

  getAll(): T[] {
    return this.load();
  }

  getById(id: string): T | undefined {
    const items = this.load();
    return items.find((item) => (item as any).id === id);
  }

  add(item: T): void {
    if (useMemoryFallback) {
      this.memory = [item, ...this.memory];
      return;
    }
    this.load();
    this.cache = [item, ...(this.cache || [])];
    this.scheduleSave();
  }

  addMany(items: T[]): void {
    if (useMemoryFallback) {
      this.memory = [...items, ...this.memory];
      return;
    }
    this.load();
    this.cache = [...items, ...(this.cache || [])];
    this.scheduleSave();
  }

  set(items: T[]): void {
    if (useMemoryFallback) {
      this.memory = [...items];
      return;
    }
    this.cache = [...items];
    this.scheduleSave();
  }

  update(id: string, patch: Partial<T>): T | null {
    if (useMemoryFallback) {
      const index = this.memory.findIndex((item) => (item as any).id === id);
      if (index === -1) return null;
      this.memory[index] = { ...this.memory[index], ...patch };
      return { ...this.memory[index] };
    }
    this.load();
    if (!this.cache) return null;

    const index = this.cache.findIndex((item) => (item as any).id === id);
    if (index === -1) return null;

    this.cache[index] = { ...this.cache[index], ...patch };
    this.scheduleSave();
    return { ...this.cache[index] };
  }

  updateMany(ids: string[], patch: Partial<T>): void {
    if (useMemoryFallback) {
      this.memory.forEach((item, i) => {
        if ((item as any).id && ids.includes((item as any).id)) {
          this.memory[i] = { ...item, ...patch };
        }
      });
      return;
    }
    this.load();
    if (!this.cache) return;

    this.cache.forEach((item, i) => {
      if ((item as any).id && ids.includes((item as any).id)) {
        this.cache![i] = { ...item, ...patch };
      }
    });
    this.scheduleSave();
  }

  delete(id: string): boolean {
    if (useMemoryFallback) {
      const initialLength = this.memory.length;
      this.memory = this.memory.filter((item) => (item as any).id !== id);
      return this.memory.length !== initialLength;
    }
    this.load();
    if (!this.cache) return false;

    const initialLength = this.cache.length;
    this.cache = this.cache.filter((item) => (item as any).id !== id);
    if (this.cache.length !== initialLength) {
      this.scheduleSave();
      return true;
    }
    return false;
  }

  count(): number {
    return this.load().length;
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.load().filter(predicate);
  }

  clear(): void {
    if (useMemoryFallback) {
      this.memory = [];
      return;
    }
    this.cache = [];
    this.scheduleSave();
  }

  flush(): void {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }
    this.flushToDisk();
  }

  trim(maxItems: number): void {
    this.load();
    if (this.cache && this.cache.length > maxItems) {
      this.cache = this.cache.slice(0, maxItems);
      this.scheduleSave();
    }
    if (useMemoryFallback && this.memory.length > maxItems) {
      this.memory = this.memory.slice(0, maxItems);
    }
  }
}

// Singleton instances for each data collection
let leadsStore: PersistentStore<any> | null = null;
let approvalsStore: PersistentStore<any> | null = null;
let eventsStore: PersistentStore<any> | null = null;
let socialStore: PersistentStore<any> | null = null;
let apiKeysStore: PersistentStore<any> | null = null;
let auditStore: PersistentStore<any> | null = null;
let usersStore: PersistentStore<any> | null = null;

export function getLeadsStore() {
  if (!leadsStore) leadsStore = new PersistentStore("leads.json");
  return leadsStore;
}

export function getApprovalsStore() {
  if (!approvalsStore) approvalsStore = new PersistentStore("approvals.json");
  return approvalsStore;
}

export function getEventsStore() {
  if (!eventsStore) eventsStore = new PersistentStore("events.json");
  return eventsStore;
}

export function getSocialStore() {
  if (!socialStore) socialStore = new PersistentStore("social.json");
  return socialStore;
}

export function getAPIKeysStore() {
  if (!apiKeysStore) apiKeysStore = new PersistentStore("api-keys.json");
  return apiKeysStore;
}

export function getAuditStore() {
  if (!auditStore) auditStore = new PersistentStore("audit.json");
  return auditStore;
}

export function getUsersStore() {
  if (!usersStore) usersStore = new PersistentStore("users.json");
  return usersStore;
}
