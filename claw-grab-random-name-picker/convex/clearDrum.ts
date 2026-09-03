import { action } from "./_generated/server";
import { api } from "./_generated/api";

const BATCH = 200;

// Delete up to BATCH names for the RAFFLE list, returning how many remain.
export const clearDrum = action({
  handler: async (ctx) => {
    const DEFAULT_CODE = "RAFFLE";
    const list = (await ctx.runQuery(api.lists.listAll, {}))
      .find((l: any) => l.listCode === DEFAULT_CODE) ?? null;
    if (!list) return { cleared: false, reason: "no RAFFLE list" };

    // Read a batch of names
    const all = (await ctx.runQuery(api.lists.getByCode, {
      listCode: DEFAULT_CODE,
    })) as any;
    const names = all?.names ?? [];
    if (names.length === 0) return { cleared: true, removed: 0, remaining: 0 };

    const batch = names.slice(0, BATCH);
    // Delete this batch one by one via a helper mutation we define inline is not possible;
    // instead re-save the list with the names we want to KEEP (everything except batch).
    const keep = names.slice(BATCH);
    await ctx.runMutation(api.listsMutations.saveNames, {
      listId: list._id as any,
      passcode: "nexgen2026",
      names: keep.map((n: any) => ({ name: n.name, colorIndex: n.colorIndex })),
    });
    return { cleared: false, removed: batch.length, remaining: names.length - batch.length };
  },
});