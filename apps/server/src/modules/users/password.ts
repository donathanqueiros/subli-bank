import argon2 from "argon2";
import { scryptSync, timingSafeEqual } from "node:crypto";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
} as const;

const ARGON2_TEST_OPTIONS = {
  ...ARGON2_OPTIONS,
  memoryCost: 256,
  timeCost: 1,
} as const;

function getArgon2Options() {
  return process.env.NODE_ENV === "test" ? ARGON2_TEST_OPTIONS : ARGON2_OPTIONS;
}

function verifyLegacyScryptPassword(password: string, storedHash: string) {
  const [salt, hash, ...rest] = storedHash.split(":");

  if (!salt || !hash || rest.length > 0) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64);
  const storedHashBuffer = Buffer.from(hash, "hex");

  if (storedHashBuffer.length !== derivedHash.length) {
    return false;
  }

  return timingSafeEqual(storedHashBuffer, derivedHash);
}

export async function hashPassword(password: string) {
  return await argon2.hash(password, getArgon2Options());
}

export async function verifyPassword(password: string, storedHash: string) {
  if (!storedHash?.trim()) {
    return false;
  }

  try {
    return await argon2.verify(storedHash, password);
  } catch {
    return verifyLegacyScryptPassword(password, storedHash);
  }
}
