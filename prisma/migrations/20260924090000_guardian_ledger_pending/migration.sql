-- CreateTable
CREATE TABLE "guardian_ledger" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" JSONB NOT NULL,
    "decision" JSONB NOT NULL,
    "humanResolution" TEXT,
    "pendingId" TEXT,

    CONSTRAINT "guardian_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_pending" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" JSONB NOT NULL,
    "decision" JSONB NOT NULL,
    "escalateEntryId" TEXT,
    "resolvedAs" TEXT,
    "resolvedBy" TEXT,
    "resolveNote" TEXT,
    "notified" JSONB NOT NULL,

    CONSTRAINT "guardian_pending_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guardian_ledger_seq_key" ON "guardian_ledger"("seq");

-- CreateIndex
CREATE INDEX "guardian_ledger_timestamp_idx" ON "guardian_ledger"("timestamp");

-- CreateIndex
CREATE INDEX "guardian_pending_status_idx" ON "guardian_pending"("status");

-- CreateIndex
CREATE INDEX "guardian_pending_createdAt_idx" ON "guardian_pending"("createdAt");
