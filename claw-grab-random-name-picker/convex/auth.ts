import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ensureAppDoc, checkPasscode, hashPasscode, DEFAULT_PASSCODE } from "./authHelpers";

export const verify = mutation({
  args: { passcode: v.string() },
  handler: async (ctx, { passcode }) => {
    const doc = await ensureAppDoc(ctx);
    return await checkPasscode(doc, passcode);
  },
});

export const change = mutation({
  args: { oldPasscode: v.string(), newPasscode: v.string() },
  handler: async (ctx, { oldPasscode, newPasscode }) => {
    const doc = await ensureAppDoc(ctx);
    if (!(await checkPasscode(doc, oldPasscode))) throw new Error("unauthorized: wrong passcode");
    const finalCode = newPasscode.trim() || DEFAULT_PASSCODE;
    const passcodeHash = await hashPasscode(finalCode, doc.salt);
    await ctx.db.patch(doc._id, { passcodeHash });
    return true;
  },
});
