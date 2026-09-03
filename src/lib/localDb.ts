import Dexie, { Table } from 'dexie';
import { NameItem, WinnerHistoryItem } from '../types';

export interface DBName extends NameItem {
  id: string;
}

export interface DBHistory extends WinnerHistoryItem {
  id: string;
}

export class ClawDatabase extends Dexie {
  names!: Table<DBName>;
  history!: Table<DBHistory>;

  constructor() {
    super('ClawDatabase');
    this.version(1).stores({
      names: 'id, name',
      history: 'id, name'
    });
  }
}

export const db = new ClawDatabase();

export async function fetchNames(): Promise<NameItem[]> {
  return await db.names.toArray();
}

export async function saveNames(names: NameItem[]) {
  await db.transaction('rw', db.names, async () => {
    await db.names.clear();
    await db.names.bulkAdd(names);
  });
}

export async function fetchHistory(): Promise<WinnerHistoryItem[]> {
  return await db.history.toArray();
}

export async function saveHistory(history: WinnerHistoryItem[]) {
  await db.transaction('rw', db.history, async () => {
    await db.history.clear();
    await db.history.bulkAdd(history);
  });
}

export async function clearAllLocalData() {
  await db.transaction('rw', [db.names, db.history], async () => {
    await db.names.clear();
    await db.history.clear();
  });
}
