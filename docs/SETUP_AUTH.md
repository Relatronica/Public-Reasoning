# Setup Autenticazione e Database

## 1. Variabili d’ambiente

```bash
cp .env.example .env
```

Valori tipici in locale:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/reason?schema=public"

AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_SECRET="stesso-valore-di-AUTH_SECRET"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Genera il secret:

```bash
openssl rand -base64 32
```

## 2. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → Credentials → OAuth client ID (Web)
2. Origins: `http://localhost:3000`
3. Redirect: `http://localhost:3000/api/auth/callback/google`
4. Copia Client ID e Secret in `.env`

Guida estesa: [`SETUP_GOOGLE_OAUTH.md`](SETUP_GOOGLE_OAUTH.md).

## Database

Lo schema Prisma usa **PostgreSQL**. Se vedi l’errore `P3019` (lock sqlite vs postgresql), la history delle migrazioni è stata ripartita per Postgres: usa `npm run db:deploy` o `npm run db:migrate` su un DB pulito / gestito.

```bash
npm run db:generate
npm run db:migrate
```

In produzione: `npm run db:deploy` (vedi [`DEPLOY.md`](DEPLOY.md)).

## 4. Flusso di registrazione

1. `/auth/register` — username e avatar
2. Continua con Google
3. `/auth/register/complete` completa il profilo

## 5. Persistenza Editor

Auth (utenti/sessioni) e overlay Editor (community, team, spunti, override) → **PostgreSQL**  
(`curator_store`). Seed: `data/curator-store.example.json`. Un eventuale `curator-store.json` locale
viene importato solo al primo avvio se il DB è vuoto.

## Note produzione

- Aggiorna `AUTH_URL` / `NEXTAUTH_URL` al dominio HTTPS
- Aggiungi i redirect OAuth di produzione
- Non committare `.env` né store JSON con dati reali
- Guida deploy: [`DEPLOY.md`](DEPLOY.md)
