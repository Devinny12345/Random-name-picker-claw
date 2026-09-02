import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Single-row config store — passcode gate + misc app settings
  app: defineTable({
    passcodeHash: v.string(),
    salt: v.string(),
  }),

  // Saved name pools / lists
  lists: defineTable({
    name: v.string(),      // display name, e.g. "Homeroom 4B"
    listCode: v.string(),  // short stable share code
    createdAt: v.number(),
  })
    .index("by_listCode", ["listCode"])
    .index("by_createdAt", ["createdAt"]),

  // The pool entries belonging to a list
  names: defineTable({
    listId: v.id("lists"),
    name: v.string(),
    colorIndex: v.number(),
    position: v.number(),
  })
    .index("by_list_position", ["listId", "position"])
    .index("by_list", ["listId"]),

  // Winners drawn from a list
  history: defineTable({
    listId: v.id("lists"),
    name: v.string(),
    colorIndex: v.number(),
    theme: v.string(),
    createdAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_list_created", ["listId", "createdAt"]),
});
