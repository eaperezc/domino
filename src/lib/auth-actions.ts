"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

type Result = { error: string } | { ok: true };

async function setSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function signUpAction(
  email: string,
  username: string,
  password: string
): Promise<Result> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return { error: "Enter a valid email" };
  if (!/^[\w.-]{2,24}$/.test(cleanUsername)) {
    return { error: "Username: 2-24 letters, digits, dots, dashes or underscores" };
  }
  if (password.length < 8) return { error: "Password must be at least 8 characters" };

  const clash = await db.user.findFirst({
    where: { OR: [{ email: cleanEmail }, { username: cleanUsername }] },
    select: { email: true },
  });
  if (clash) {
    return { error: clash.email === cleanEmail ? "Email already registered" : "Username taken" };
  }

  const user = await db.user.create({
    data: { email: cleanEmail, username: cleanUsername, passwordHash: hashPassword(password) },
  });
  await setSession(user.id);
  return { ok: true };
}

export async function signInAction(email: string, password: string): Promise<Result> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  // Verify against a dummy hash when the user is missing so both paths cost
  // roughly the same (no user-enumeration timing signal).
  const ok = verifyPassword(password, user?.passwordHash ?? "00:00") && user !== null;
  if (!ok || !user) return { error: "Wrong email or password" };
  await setSession(user.id);
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
