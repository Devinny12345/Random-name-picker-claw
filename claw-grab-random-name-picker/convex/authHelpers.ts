const encoder = new TextEncoder();

export const DEFAULT_PASSCODE = "nexgen2026";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPasscode(passcode: string, salt: string): Promise<string> {
  return sha256(`${salt}:${passcode}`);
}

export async function checkPasscode(doc: any, passcode: string): Promise<boolean> {
  if (!doc) return false;
  const h = await hashPasscode(passcode, doc.salt);
  return h === doc.passcodeHash;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Read-only: return the config doc or null. Safe to call from queries.
export async function getAppDoc(ctx: { db: any }): Promise<any> {
  return (await ctx.db.query("app").first()) ?? null;
}

// Mutation-only: ensure the config doc exists, creating with default passcode if missing.
export async function ensureAppDoc(ctx: { db: any }): Promise<any> {
  const existing = await ctx.db.query("app").first();
  if (existing) return existing;
  const salt = randomHex(16);
  const id = await ctx.db.insert("app", {
    salt,
    passcodeHash: await hashPasscode(DEFAULT_PASSCODE, salt),
  });
  return (await ctx.db.get(id))!;
}
