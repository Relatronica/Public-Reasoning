# `data/`

| File | Ruolo |
| :--- | :--- |
| `curator-store.example.json` | Seed iniziale (vuoto, senza PII). |
| `curator-store.json` | Solo **migrazione locale** opzionale → importato una volta in Postgres se la tabella è vuota. Gitignored. |

## Persistenza produzione

L’Editor (community, team, spunti, override schede) è salvato in PostgreSQL, tabella `curator_store` (modello Prisma `CuratorStoreState`): una riga JSON con l’intero overlay curator.

Al primo avvio:
1. se esiste già la riga in DB → si usa quella;
2. altrimenti, se c’è un `curator-store.json` locale → viene importato;
3. altrimenti → seed da `curator-store.example.json`.

Non committare `curator-store.json` con dati reali.
