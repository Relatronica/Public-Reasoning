import fs from 'fs/promises';
import path from 'path';
import { CuratorStore, EMPTY_CURATOR_STORE } from '@/lib/curator/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'curator-store.json');
const EXAMPLE_PATH = path.join(DATA_DIR, 'curator-store.example.json');

async function seedFromExample(): Promise<CuratorStore> {
  try {
    const raw = await fs.readFile(EXAMPLE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as CuratorStore;
    const store = { ...EMPTY_CURATOR_STORE, ...parsed };
    await writeCuratorStore(store);
    return store;
  } catch {
    await writeCuratorStore(EMPTY_CURATOR_STORE);
    return EMPTY_CURATOR_STORE;
  }
}

export async function readCuratorStore(): Promise<CuratorStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as CuratorStore;
    return { ...EMPTY_CURATOR_STORE, ...parsed };
  } catch {
    return seedFromExample();
  }
}

export async function writeCuratorStore(store: CuratorStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

export async function updateCuratorStore(
  updater: (store: CuratorStore) => CuratorStore
): Promise<CuratorStore> {
  const current = await readCuratorStore();
  const next = updater(current);
  await writeCuratorStore(next);
  return next;
}
