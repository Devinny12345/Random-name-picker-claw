import { mutation } from "./_generated/server";
import { ensureAppDoc } from "./authHelpers";

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

// Ensure a default "Back to School Raffle" list exists and is populated.
// Idempotent — if a list with the reserved code exists, it is left alone.
export const ensureDefault = mutation({
  handler: async (ctx) => {
    await ensureAppDoc(ctx); // ensure passcode config exists
    const DEFAULT_CODE = "RAFFLE";
    const existing = await ctx.db.query("lists").withIndex("by_listCode", (q) => q.eq("listCode", DEFAULT_CODE)).first();
    if (existing) return existing._id;

    const id = await ctx.db.insert("lists", {
      name: "BACK TO SCHOOL RAFFLE",
      listCode: DEFAULT_CODE,
      createdAt: Date.now(),
    });
    await ctx.db.insert("lists", { name: "HOMEROOM 4B", listCode: makeCode(), createdAt: Date.now() });
    await ctx.db.insert("lists", { name: "SCIENCE PERIOD 3", listCode: makeCode(), createdAt: Date.now() });

    for (let i = 0; i < CLASSROOM_NAMES.length; i++) {
      await ctx.db.insert("names", {
        listId: id,
        name: CLASSROOM_NAMES[i],
        colorIndex: i % 8,
        position: i,
      });
    }
    return id;
  },
});
