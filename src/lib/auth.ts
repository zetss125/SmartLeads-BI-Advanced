import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/types";

const users: User[] = [];
const JWT_SECRET = process.env.JWT_SECRET || "smartleads-bi-jwt-secret";

export async function registerUser(name: string, email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const existing = users.find(u => u.email === email);
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(user);

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token
  };
}

export async function loginUser(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token
  };
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    return decoded;
  } catch {
    return null;
  }
}
