import fs from 'fs/promises';
import path from 'path';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CuratorStore, EMPTY_CURATOR_STORE } from '@/lib/curator/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'curator-store.json');
const EXAMPLE_PATH = path.join(DATA_DIR, 'curator-store.example.json');
const STORE_ID = 'default';

function normalizeStore(data: unknown): CuratorStore {
  if (!data || typeof data !== 'object') return { ...EMPTY_CURATOR_STORE };
  return { ...EMPTY_CURATOR_STORE, ...(data as CuratorStore) };
}

function toJson(store: CuratorStore): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(store)) as Prisma.InputJsonValue;
}

/** Import one-shot da file locale (migrazione da JSON → Postgres). */
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

async function ensureStoreRow(): Promise<CuratorStore> {
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

export async function readCuratorStore(): Promise<CuratorStore> {
  return ensureStoreRow();
}

export async function writeCuratorStore(store: CuratorStore): Promise<void> {
  const data = toJson(store);
  await prisma.curatorStoreState.upsert({
    where: { id: STORE_ID },
    create: { id: STORE_ID, data },
    update: { data },
  });
}

export async function updateCuratorStore(
  updater: (store: CuratorStore) => CuratorStore
): Promise<CuratorStore> {
  return prisma.$transaction(async (tx) => {
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
}
