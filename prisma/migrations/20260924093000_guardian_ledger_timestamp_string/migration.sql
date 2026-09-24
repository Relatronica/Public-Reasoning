-- AlterTable: timestamp come stringa ISO (stabile per hash-chain)
ALTER TABLE "guardian_ledger" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Converti timestamp esistenti in testo ISO se presenti
ALTER TABLE "guardian_ledger" ALTER COLUMN "timestamp" TYPE TEXT USING to_char("timestamp" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

DROP INDEX IF EXISTS "guardian_ledger_timestamp_idx";
CREATE INDEX "guardian_ledger_createdAt_idx" ON "guardian_ledger"("createdAt");
