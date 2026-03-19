import { hashPassword, verifyPassword } from "../password";
import { randomBytes, scryptSync } from "node:crypto";

describe("password helpers", () => {
  it("gera hash em formato argon2id e valida senha correta", async () => {
    const password = "StrongPass123";
    const hash = await hashPassword(password);

    expect(hash.startsWith("$argon2id$")).toBe(true);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it("retorna false para senha invalida", async () => {
    const hash = await hashPassword("StrongPass123");

    await expect(verifyPassword("WrongPass123", hash)).resolves.toBe(false);
  });

  it("mantem compatibilidade com hash legado scrypt", async () => {
    const salt = randomBytes(16).toString("hex");
    const legacyHash = scryptSync("StrongPass123", salt, 64).toString("hex");
    const storedHash = `${salt}:${legacyHash}`;

    await expect(verifyPassword("StrongPass123", storedHash)).resolves.toBe(true);
    await expect(verifyPassword("WrongPass123", storedHash)).resolves.toBe(false);
  });
});
