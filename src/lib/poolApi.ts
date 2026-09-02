import { convex } from "./convexClient";
import { api } from "../../convex/_generated/api";
import type { NameItem, WinnerHistoryItem } from "../types";

// --- Auth ---
export async function verifyPasscode(passcode: string): Promise<boolean> {
  try {
    return await convex.mutation(api.auth.verify, { passcode });
  } catch {
    return false;
  }
}

// --- Lists (read) ---
export async function fetchLists() {
  return await convex.query(api.lists.listAll, {});
}

export async function fetchListByCode(listCode: string) {
  return await convex.query(api.lists.getByCode, { listCode });
}

// --- Single-shot init: ensure the default list exists, then load it ---
export async function initDefaultList(): Promise<string> {
  const id = await convex.mutation(api.seed.ensureDefault, {});
  return (id as unknown as string).replace("lists:", "");
}

// --- Writes (passcode required) ---
export async function createList(name: string, passcode: string) {
  return await convex.mutation(api.listsMutations.create, { name, passcode });
}

export async function renameList(listId: string, name: string, passcode: string) {
  await convex.mutation(api.listsMutations.rename, { listId: listId as any, name, passcode });
}

export async function deleteList(listId: string, passcode: string) {
  await convex.mutation(api.listsMutations.remove, { listId: listId as any, passcode });
}

export async function saveNames(
  listId: string,
  names: NameItem[],
  passcode: string
) {
  await convex.mutation(api.listsMutations.saveNames, {
    listId: listId as any,
    passcode,
    names: names.map((n) => ({ name: n.name, colorIndex: n.colorIndex })),
  });
}

export async function saveHistory(
  listId: string,
  history: WinnerHistoryItem[],
  passcode: string
) {
  await convex.mutation(api.listsMutations.saveHistory, {
    listId: listId as any,
    passcode,
    history: history.map((h) => ({
      name: h.name,
      colorIndex: h.colorIndex,
      theme: h.theme,
      createdAt: new Date(h.timestamp).getTime(),
    })),
  });
}

export async function changePasscode(oldPasscode: string, newPasscode: string) {
  return await convex.mutation(api.auth.change, { oldPasscode, newPasscode });
}
