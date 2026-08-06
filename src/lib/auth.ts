import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "@/types";
import { getUsersStore } from "@/lib/persistentStore";
import { getJwtSecret } from "@/lib/encryption";

export async function registerUser(name: string, email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const store = getUsersStore();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = store.getById(normalizedEmail) || store.getAll().find((u: User) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = `user_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  const createdAt = new Date().toISOString();

  store.add({
    id,
    name,
    email: normalizedEmail,
    password: hashedPassword,
    createdAt,
  });

  const token = jwt.sign(
    { id, email: normalizedEmail, name },
    getJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    user: { id, name, email: normalizedEmail, createdAt },
    token
  };
}

export async function loginUser(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const store = getUsersStore();
  const normalizedEmail = email.trim().toLowerCase();

  const user = store.getAll().find((u: User) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    getJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token
  };
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; email: string; name: string };
    return decoded;
  } catch {
    return null;
  }
}
