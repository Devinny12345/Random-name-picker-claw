import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAppDoc } from "./authHelpers";

// List all saved lists, with their name counts (public read).
export const listAll = query({
  handler: async (ctx) => {
    await getAppDoc(ctx); // read config (ignore absence)
    const lists = await ctx.db.query("lists").order("asc").collect();
    const counts = await Promise.all(
      lists.map(async (list) => {
        const n = await ctx.db.query("names").withIndex("by_list", (q) => q.eq("listId", list._id)).collect();
        return { _id: list._id, name: list.name, listCode: list.listCode, createdAt: list.createdAt, count: n.length };
      })
    );
    return counts;
  },
});

// Fetch a full list by its share code (public read).
export const getByCode = query({
  args: { listCode: v.string() },
  handler: async (ctx, { listCode }) => {
    await getAppDoc(ctx);
    const list = await ctx.db.query("lists").withIndex("by_listCode", (q) => q.eq("listCode", listCode)).first();
    if (!list) return null;
    const names = await ctx.db.query("names").withIndex("by_list_position", (q) => q.eq("listId", list._id)).order("asc").collect();
    const history = await ctx.db.query("history").withIndex("by_list_created", (q) => q.eq("listId", list._id)).order("desc").collect();
    return {
      _id: list._id,
      name: list.name,
      listCode: list.listCode,
      createdAt: list.createdAt,
      names: names.map((n) => ({ id: n._id, name: n.name, colorIndex: n.colorIndex })),
      history: history.map((h) => ({ id: h._id, name: h.name, colorIndex: h.colorIndex, theme: h.theme, createdAt: h.createdAt, prizeId: (h as any).prizeId ?? null, prizeLabel: (h as any).prizeLabel ?? null })),
    };
  },
});
