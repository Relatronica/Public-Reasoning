# Deploy — Reason

Checklist per pubblicare Reason su un server o un hosting Node (VPS, Railway, Render, Fly.io, ecc.).

---

## Cosa è pronto / cosa no

| Pronto | Attenzione |
| :--- | :--- |
| App Next.js 14, Auth Google, Prisma su PostgreSQL | Persistenza **Editor / team / spunti / override** su file `data/curator-store.json` |
| Community e schede demo in codice (`lib/`) | Su **serverless** (es. Vercel senza volume) le scritture al JSON non restano |
| `.env.example` allineato allo schema Postgres | I Reasoning Record di prodotto non sono ancora tutti su Prisma |

Per una demo pubblica stabile: preferisci un **VPS o container con filesystem persistente**, oppure accetta un deploy read-mostly (feed demo) senza affidarti all’Editor.

---

## 1. Database

1. Crea un database PostgreSQL.
2. Imposta `DATABASE_URL` (connection string completa).
3. In build o release:

```bash
npm run db:generate
npm run db:deploy
```

(`db:deploy` = `prisma migrate deploy`)

---

## 2. Variabili d’ambiente

Copia da `.env.example` e valorizza in produzione:

```bash
DATABASE_URL="postgresql://..."
AUTH_URL="https://tuodominio.com"
NEXTAUTH_URL="https://tuodominio.com"
AUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_SECRET="<stesso valore di AUTH_SECRET>"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Auth.js v5 legge preferibilmente `AUTH_*`; gli alias `NEXTAUTH_*` restano utili.

---

## 3. Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/):

- **Authorized JavaScript origins**: `https://tuodominio.com`
- **Authorized redirect URIs**: `https://tuodominio.com/api/auth/callback/google`

Guida dettagliata: [`SETUP_GOOGLE_OAUTH.md`](SETUP_GOOGLE_OAUTH.md).

---

## 4. Build e avvio

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run build
npm start
```

Assicurati che il processo possa **scrivere** in `data/` (directory presente o creabile). Al primo avvio, se manca `curator-store.json`, viene creato da `curator-store.example.json`.

---

## 5. Checklist pre-go-live

- [ ] Postgres raggiungibile e migrazioni applicate
- [ ] `AUTH_SECRET` / `NEXTAUTH_SECRET` forti e univoci
- [ ] `AUTH_URL` / `NEXTAUTH_URL` = URL pubblico HTTPS
- [ ] Redirect Google di produzione configurati
- [ ] `data/` scrivibile (se usi Editor / team / consultazioni)
- [ ] Nessun `.env` o store con email reali nel repository
- [ ] HTTPS terminato (reverse proxy o piattaforma)

---

## 6. Limiti noti (onesti)

1. **Curator store su file** — non multi-istanza: due replica che scrivono lo stesso JSON non sono supportate.
2. **Serverless** — filesystem effimero: override e roster si perdono al cold start / redeploy.
3. **Prisma** — oggi serve soprattutto Auth (User / Account / Session); il corpus decisionale demo vive ancora in `lib/` + store JSON.
4. **Roadmap** — migrazione record/org su Postgres: [`DECISION_OS_PLAN.md`](DECISION_OS_PLAN.md).

---

## 7. Suggerimenti hosting

| Opzione | Note |
| :--- | :--- |
| VPS (Docker / systemd) | Consigliato per Editor completo + disco persistente |
| Railway / Render / Fly | Ok con volume o accept-demo senza scritture critiche |
| Vercel | Ok per UI/demo; non affidarti a `curator-store.json` senza Blob/DB esterno |

Per CI: build `npm run build` dopo `prisma generate`; secret solo nelle env della piattaforma, mai in git.
