# Deploy — Reason

Checklist per pubblicare Reason (Vercel + Neon, VPS, Railway, …).

---

## Architettura persistenza

| Dati | Dove |
| :--- | :--- |
| Utenti / sessioni Auth.js | PostgreSQL (Prisma) |
| Editor: community, team, spunti, override schede | PostgreSQL tabella `curator_store` (JSON overlay) |
| Corpus demo (Cormano, Agorà, …) | Codice in `lib/` (seed di lettura) |

L’Editor è **production-ready su Postgres**: funziona anche su Vercel (niente disco locale obbligatorio).

---

## 1. Database

1. Crea un Postgres (es. [Neon](https://neon.tech) free).
2. Imposta `DATABASE_URL`.
3. In build/release:

```bash
npm run db:generate
npm run db:deploy
```

La migrazione `curator_store` crea la tabella overlay.

---

## 2. Variabili d’ambiente

```bash
DATABASE_URL="postgresql://..."
AUTH_URL="https://tuodominio.com"
NEXTAUTH_URL="https://tuodominio.com"
AUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_SECRET="<stesso valore>"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
# Super-admin (owner sempre). Email Google di login, separate da virgola.
ORG_ADMIN_EMAILS="tuo@email.com"
# Blob: di solito arriva da Storage → Connect (BLOB_STORE_ID). Token RW opzionale.
BLOB_STORE_ID="..."
BLOB_READ_WRITE_TOKEN="..." # opzionale

I **ruoli del team** (owner/admin/…) non stanno nella tabella `User`: vivono in `curator_store.organization.members`.  
`ORG_ADMIN_EMAILS` ti rende owner di piattaforma e, al primo bootstrap autenticato, ti scrive anche nella roster su Postgres. Sblocca anche **`/admin`** (console: utenti, roster, nascondi/mostra community).
---

## 3. Google OAuth

- Origins: `https://tuodominio.com`
- Redirect: `https://tuodominio.com/api/auth/callback/google`

Dettagli: [`SETUP_GOOGLE_OAUTH.md`](SETUP_GOOGLE_OAUTH.md).

---

## 4. Build e avvio

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run build
npm start
```

Su **Vercel**: imposta le env, collega il repo, build command default `next build` (aggiungi `prisma generate` in `postinstall` o nel build script se serve).

Consigliato in `package.json` (già presenti gli script `db:*`):

```bash
# build su CI
npx prisma generate && npx prisma migrate deploy && next build
```

Oppure configura il build command della piattaforma di conseguenza.

---

## 5. Checklist pre-go-live

- [ ] Postgres + migrazioni applicate (incluso `curator_store`)
- [ ] Secret Auth forti
- [ ] `AUTH_URL` / `NEXTAUTH_URL` = HTTPS pubblico
- [ ] Redirect Google di produzione
- [ ] Store Blob collegato (`BLOB_STORE_ID`; opzionale `BLOB_READ_WRITE_TOKEN`) per logo/banner
- [ ] Nessun store/env con PII nel repository
- [ ] Smoke test: login → Editor → salva community / upload logo → refresh → dati presenti

---

## 6. Migrazione da JSON locale

Se in locale esiste ancora `data/curator-store.json`, al **primo** avvio con DB vuoto viene importato automaticamente nella tabella `curator_store`. Dopo, il file non è più la source of truth.

---

## 7. Limiti residui (onesti)

1. Overlay JSON monolitico — ok per un tenant demo; multi-tenant vero richiederà tabelle relazionali.
2. Corpus seed in `lib/` — le schede demo non sono ancora tutte su Prisma come entità di dominio.
3. Logo/banner: con store Blob collegato (`BLOB_STORE_ID` + OIDC) usano **Vercel Blob**; senza (solo locale) restano in `public/communities/`.

### Setup Vercel Blob

1. Vercel Dashboard → progetto → **Storage** → **Blob** → Create / Connect
2. Conferma le env `BLOB_STORE_ID` (e, se presente, `BLOB_READ_WRITE_TOKEN`) su Production + Preview
3. Redeploy — su Vercel l’SDK usa OIDC (`VERCEL_OIDC_TOKEN`) in automatico

Roadmap dominio: [`DECISION_OS_PLAN.md`](DECISION_OS_PLAN.md).

---

## 8. Stack gratis consigliato

| Servizio | Ruolo |
| :--- | :--- |
| Vercel Hobby | App Next.js |
| Neon / Prisma Postgres | PostgreSQL |
| Vercel Blob | Logo e banner community |
| Google Cloud | OAuth |
