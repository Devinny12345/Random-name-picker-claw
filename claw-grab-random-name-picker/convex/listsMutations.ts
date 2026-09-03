import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ensureAppDoc, checkPasscode } from "./authHelpers";

// Lists are readable by anyone (for the "open a shared list" flow).
// Every write must prove possession of the passcode.

// Create a new empty list. Passcode required.
export const create = mutation({
  args: { name: v.string(), passcode: v.string() },
  handler: async (ctx, { name, passcode }) => {
    const doc = await ensureAppDoc(ctx);
    if (!(await checkPasscode(doc, passcode))) throw new Error("unauthorized: invalid passcode");
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    return await ctx.db.insert("lists", {
      name: name.trim() || "NEW LIST",
      listCode: code,
      createdAt: Date.now(),
    });
  },
});

// Replace the entire pool for a list. Passcode required.
export const saveNames = mutation({
  args: {
    listId: v.id("lists"),
    passcode: v.string(),
    names: v.array(v.object({ name: v.string(), colorIndex: v.number() })),
  },
  handler: async (ctx, { listId, passcode, names }) => {
    const doc = await ensureAppDoc(ctx);
    if (!(await checkPasscode(doc, passcode))) throw new Error("unauthorized: invalid passcode");
    const existing = await ctx.db.query("names").withIndex("by_list", (q) => q.eq("listId", listId)).collect();
    await Promise.all(existing.map((n) => ctx.db.delete(n._id)));
    for (let i = 0; i < names.length; i++) {
      await ctx.db.insert("names", {
        listId,
        name: names[i].name,
        colorIndex: names[i].colorIndex,
        position: i,
      });
    }
  },
});

// Save the draw history for a list. Passcode required. Now with prize fields.
export const saveHistory = mutation({
  args: {
    listId: v.id("lists"),
    passcode: v.string(),
    history: v.array(v.object({ name: v.string(), colorIndex: v.number(), theme: v.string(), createdAt: v.number(), prizeId: v.optional(v.string()), prizeLabel: v.optional(v.string()) })),
  },
  handler: async (ctx, { listId, passcode, history }) => {
    const doc = await ensureAppDoc(ctx);
    if (!(await checkPasscode(doc, passcode))) throw new Error("unauthorized: invalid passcode");
    const existing = await ctx.db.query("history").withIndex("by_list", (q) => q.eq("listId", listId)).collect();
    await Promise.all(existing.map((h) => ctx.db.delete(h._id)));
    for (const h of history) {
      await ctx.db.insert("history", { listId, name: h.name, colorIndex: h.colorIndex, theme: h.theme, createdAt: h.createdAt, prizeId: (h as any).prizeId ?? undefined, prizeLabel: (h as any).prizeLabel ?? undefined });
    }
  },
});

// Delete a list and its children. Passcode required.
export const remove = mutation({
  args: { listId: v.id("lists"), passcode: v.string() },
  handler: async (ctx, { listId, passcode }) => {
    const doc = await ensureAppDoc(ctx);
    if (!(await checkPasscode(doc, passcode))) throw new Error("unauthorized: invalid passcode");
    await ctx.db.delete(listId);
    const names = await ctx.db.query("names").withIndex("by_list", (q) => q.eq("listId", listId)).collect();
    await Promise.all(names.map((n) => ctx.db.delete(n._id)));
    const history = await ctx.db.query("history").withIndex("by_list", (q) => q.eq("listId", listId)).collect();
    await Promise.all(history.map((h) => ctx.db.delete(h._id)));
  },
});

// Delete names for a list in chunks (avoids the read limit). Call repeatedly until empty.
export const clearNames = mutation({
  args: { listId: v.id("lists"), passcode: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { listId, passcode, limit = 250 }) => {
    const doc = await ensureAppDoc(ctx);
    if (!(await checkPasscode(doc, passcode))) throw new Error("unauthorized: invalid passcode");
    const existing = await ctx.db.query("names").withIndex("by_list", (q) => q.eq("listId", listId)).take(limit);
    const ids = existing.map((n) => n._id);
    await Promise.all(ids.map((id) => ctx.db.delete(id)));
    const remaining = await ctx.db.query("names").withIndex("by_list", (q) => q.eq("listId", listId)).first();
    return { deleted: ids.length, remaining: remaining ? 1 : 0 };
  },
});

// Rename a list. Passcode required.
export const rename = mutation({
  args: { listId: v.id("lists"), name: v.string(), passcode: v.string() },
  handler: async (ctx, { listId, name, passcode }) => {
    const doc = await ensureAppDoc(ctx);
    if (!(await checkPasscode(doc, passcode))) throw new Error("unauthorized: invalid passcode");
    await ctx.db.patch(listId, { name: name.trim() || "LIST" });
  },
});
