import { mutation } from "./_generated/server";
import { ensureAppDoc } from "./authHelpers";
import { RAFFLE_NAMES } from "./raffleNames";

// Fallback tiny list for quick testing if raffle file missing
const CLASSROOM_NAMES = [
  "Emily Carter", "James Nguyen", "Sophia Patel", "Liam O'Brien", "Mia Rodriguez",
  "Noah Kim", "Ava Thompson", "Ethan Brown", "Isabella Garcia", "Lucas Smith",
  "Olivia Davis", "Mason Wilson", "Amelia Martinez", "Logan Anderson", "Harper Lee",
  "Elijah Thomas", "Ella White", "Gabriel Harris", "Scarlett Martin", "Jackson Perez",
];

function makeCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Ensure default lists exist and are populated.
// Idempotent — if a list with the reserved code exists, it is left alone.
export const ensureDefault = mutation({
  handler: async (ctx) => {
    await ensureAppDoc(ctx); // ensure passcode config exists
    const DEFAULT_CODE = "RAFFLE";
    const existing = await ctx.db.query("lists").withIndex("by_listCode", (q) => q.eq("listCode", DEFAULT_CODE)).first();
    if (existing) return existing._id;

    const id = await ctx.db.insert("lists", {
      name: "RAFFLE NAMES",
      listCode: DEFAULT_CODE,
      createdAt: Date.now(),
    });
    await ctx.db.insert("lists", { name: "HOMEROOM 4B", listCode: makeCode(), createdAt: Date.now() });
    await ctx.db.insert("lists", { name: "SCIENCE PERIOD 3", listCode: makeCode(), createdAt: Date.now() });

    // Use full raffle CSV (6656 names) if available, else fallback to 20 demo names
    const source = RAFFLE_NAMES.length > 100 ? RAFFLE_NAMES : CLASSROOM_NAMES;

    for (let i = 0; i < source.length; i++) {
      await ctx.db.insert("names", {
        listId: id,
        name: source[i],
        colorIndex: i % 8,
        position: i,
      });
    }
    return id;
  },
});

// One-shot import: replace the RAFFLE list with the full CSV (passcode not required, idempotent).
// Useful for local Windows testing or re-seeding after clearing data.
export const importRaffleCsv = mutation({
  handler: async (ctx) => {
    await ensureAppDoc(ctx);
    const DEFAULT_CODE = "RAFFLE";
    let list = await ctx.db.query("lists").withIndex("by_listCode", (q) => q.eq("listCode", DEFAULT_CODE)).first();
    if (!list) {
      const id = await ctx.db.insert("lists", {
        name: "RAFFLE NAMES",
        listCode: DEFAULT_CODE,
        createdAt: Date.now(),
      });
      list = (await ctx.db.get(id))!;
    }
    // Clear existing names for this list
    const existing = await ctx.db.query("names").withIndex("by_list", (q) => q.eq("listId", list!._id)).collect();
    await Promise.all(existing.map((n) => ctx.db.delete(n._id)));
    // Insert all 6656
    for (let i = 0; i < RAFFLE_NAMES.length; i++) {
      await ctx.db.insert("names", {
        listId: list!._id,
        name: RAFFLE_NAMES[i],
        colorIndex: i % 8,
        position: i,
      });
    }
    return { listId: list!._id, count: RAFFLE_NAMES.length };
  },
});
