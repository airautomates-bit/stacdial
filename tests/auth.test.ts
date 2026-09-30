import { describe, expect, it } from "vitest";
import { createAdminToken, platformUserFromHeaders, validAdminToken } from "@/app/chatgpt-auth";
import { usesTrustedPlatformIdentity } from "@/lib/runtime";

describe("identity trust", () => {
  const identityHeaders = new Headers({
    "oai-authenticated-user-id": "attacker",
    "oai-authenticated-user-email": "admin@example.com",
  });

  it("ignores user-controlled identity headers on Vercel", () => {
    expect(usesTrustedPlatformIdentity({ VERCEL: "1", AUTH_PROVIDER: "sites" })).toBe(false);
    expect(platformUserFromHeaders(identityHeaders, false)).toBeNull();
  });

  it("accepts complete identity headers only when the platform is trusted", () => {
    expect(platformUserFromHeaders(identityHeaders, true)?.userId).toBe("attacker");
  });
});

describe("admin session tokens", () => {
  const secret = "a-secure-test-secret-that-is-long-enough";

  it("accepts valid tokens and rejects tampering", async () => {
    const token = await createAdminToken(secret, 1_000_000);
    expect(await validAdminToken(token, secret, 1_000_100)).toBe(true);
    const replacement = token.endsWith("0") ? "1" : "0";
    expect(await validAdminToken(token.slice(0, -1) + replacement, secret, 1_000_100)).toBe(false);
  });

  it("rejects expired tokens", async () => {
    const token = await createAdminToken(secret, 1_000_000);
    expect(await validAdminToken(token, secret, 1_000_000 + 31 * 24 * 60 * 60 * 1_000)).toBe(false);
  });
});
