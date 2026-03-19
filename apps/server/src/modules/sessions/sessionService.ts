import { randomBytes } from "node:crypto";
import { Session } from "./SessionModel";
import type { UserRole } from "../../types/auth";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function createUserSession({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const token = randomBytes(32).toString("hex");

  const session = await Session.create({
    token,
    userId,
    role,
    expiresAt,
  });

  return session;
}

export async function deleteUserSession(token: string) {
  await Session.deleteOne({ token });
}

export async function findValidSession(token: string) {
  return await Session.findOne({
    token,
    expiresAt: { $gt: new Date() },
  });
}
