import fs from 'fs/promises';
import path from 'path';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CuratorStore, EMPTY_CURATOR_STORE } from '@/lib/curator/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'curator-store.json');
const EXAMPLE_PATH = path.join(DATA_DIR, 'curator-store.example.json');
const STORE_ID = 'default';

let warnedFallback = false;

function normalizeStore(data: unknown): CuratorStore {
  if (!data || typeof data !== 'object') return { ...EMPTY_CURATOR_STORE };
  return { ...EMPTY_CURATOR_STORE, ...(data as CuratorStore) };
}

function toJson(store: CuratorStore): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(store)) as Prisma.InputJsonValue;
}

function warnFallback(err: unknown) {
  if (warnedFallback) return;
  warnedFallback = true;
  const message = err instanceof Error ? err.message : String(err);
  console.warn(
    `[curator-store] Postgres non disponibile (${message}). Uso data/curator-store.json. Esegui: npm run db:deploy`
  );
}

async function loadInitialFromDisk(): Promise<CuratorStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    return normalizeStore(JSON.parse(raw));
  } catch {
    try {
      const raw = await fs.readFile(EXAMPLE_PATH, 'utf-8');
      return normalizeStore(JSON.parse(raw));
    } catch {
      return { ...EMPTY_CURATOR_STORE };
    }
  }
}

async function readFromDisk(): Promise<CuratorStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    return normalizeStore(JSON.parse(raw));
  } catch {
    const initial = await loadInitialFromDisk();
    await writeToDisk(initial);
    return initial;
  }
}

async function writeToDisk(store: CuratorStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

async function readFromDb(): Promise<CuratorStore> {
  const existing = await prisma.curatorStoreState.findUnique({
    where: { id: STORE_ID },
  });
  if (existing) return normalizeStore(existing.data);

  const initial = await loadInitialFromDisk();
  try {
    await prisma.curatorStoreState.create({
      data: { id: STORE_ID, data: toJson(initial) },
    });
    return initial;
  } catch {
    const raced = await prisma.curatorStoreState.findUnique({
      where: { id: STORE_ID },
    });
    if (raced) return normalizeStore(raced.data);
    return initial;
  }
}

async function writeToDb(store: CuratorStore): Promise<void> {
  const data = toJson(store);
  await prisma.curatorStoreState.upsert({
    where: { id: STORE_ID },
    create: { id: STORE_ID, data },
    update: { data },
  });
}

export async function readCuratorStore(): Promise<CuratorStore> {
  try {
    return await readFromDb();
  } catch (err) {
    warnFallback(err);
    return readFromDisk();
  }
}

export async function writeCuratorStore(store: CuratorStore): Promise<void> {
  try {
    await writeToDb(store);
  } catch (err) {
    warnFallback(err);
    await writeToDisk(store);
  }
}

export async function updateCuratorStore(
  updater: (store: CuratorStore) => CuratorStore
): Promise<CuratorStore> {
  try {
    return await prisma.$transaction(async (tx) => {
      const row = await tx.curatorStoreState.findUnique({
        where: { id: STORE_ID },
      });

      let current: CuratorStore;
      if (!row) {
        current = await loadInitialFromDisk();
        const next = updater(current);
        await tx.curatorStoreState.create({
          data: { id: STORE_ID, data: toJson(next) },
        });
        return next;
      }

      current = normalizeStore(row.data);
      const next = updater(current);
      await tx.curatorStoreState.update({
        where: { id: STORE_ID },
        data: { data: toJson(next) },
      });
      return next;
    });
  } catch (err) {
    warnFallback(err);
    const current = await readFromDisk();
    const next = updater(current);
    await writeToDisk(next);
    return next;
  }
}
