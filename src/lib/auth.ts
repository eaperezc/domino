import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Crypto core only — no DB imports, safe for proxy.ts. User lookups live in
// src/lib/current-user.ts.

export const SESSION_COOKIE = "domino_session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // seconds

function secret(): string {
  const s = process.env.DOMINO_SECRET;
  if (!s) throw new Error("DOMINO_SECRET is not set");
  return s;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Token is `<userId>.<expiry epoch ms>.<hmac>`. */
export function createSessionToken(userId: string): string {
  const payload = `${userId}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the userId for a valid, unexpired token; null otherwise. */
export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const mac = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(payload));
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) return null;
  const sep = payload.lastIndexOf(".");
  if (sep < 0) return null;
  const userId = payload.slice(0, sep);
  const exp = Number(payload.slice(sep + 1));
  if (!userId || !Number.isFinite(exp) || exp <= Date.now()) return null;
  return userId;
}
