# Reason

> **"Le decisioni dicono *cosa* si è scelto. Reason conserva e verifica *perché*."**

Reason è un feed di **schede di giudizio** (Reasoning Records) per community configurabili: comune, ufficio, progetto, pack compliance. Il metodo è fisso — domanda reale, opzioni scartate, incertezza, criterio di stop, esito, fonti — mentre etichette e argomenti sono pack della community.

| Lab pubblico | Decision Bank |
| :--- | :--- |
| Feed, fonti, community demo (Cormano, Agorà, …) | Bozze private, cattura, chiusura da sponsor |
| Spunti e consultazioni (filosofo / consulente) | Stesso schema a sei elementi, visibilità `private` |

Piano di evoluzione: [`docs/DECISION_OS_PLAN.md`](docs/DECISION_OS_PLAN.md).

---

## Documentazione

| Documento | Contenuto |
| :--- | :--- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architettura, stack, modello dati |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Checklist deploy (env, Postgres, OAuth, limiti) |
| [`docs/SETUP_AUTH.md`](docs/SETUP_AUTH.md) | Auth locale + registrazione |
| [`docs/SETUP_GOOGLE_OAUTH.md`](docs/SETUP_GOOGLE_OAUTH.md) | Google Cloud Console passo-passo |
| [`docs/CURATOR_GUIDE.md`](docs/CURATOR_GUIDE.md) | Standard metodologico per compilare schede |
| [`docs/AI_GOVERNANCE_PACK.md`](docs/AI_GOVERNANCE_PACK.md) | Pack compliance EU AI Act |
| [`docs/DECISION_OS_PLAN.md`](docs/DECISION_OS_PLAN.md) | Roadmap Capture → Bank → API |

---

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS**
- **Prisma** + **PostgreSQL** (Auth.js + overlay Editor in `curator_store`)
- **NextAuth.js v5 (Auth.js)** + Google OAuth
- **@xyflow/react** — grafo decisionale
- Corpus demo in `lib/`; override Editor in Postgres (non più file JSON in produzione)

---

## Avvio locale

### Prerequisiti

- Node.js ≥ 18
- PostgreSQL in esecuzione (locale o managed)

### Installazione

```bash
git clone https://github.com/Relatronica/Public-Reasoning.git
cd Public-Reasoning
npm install
cp .env.example .env
```

Compila `.env` (vedi sotto), poi:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000). Community via `?c=` (es. `cormano`, `agora`, `ai-governance`).

### Variabili d’ambiente

| Variabile | Uso |
| :--- | :--- |
| `DATABASE_URL` | Connection string PostgreSQL |
| `AUTH_URL` / `NEXTAUTH_URL` | Origine dell’app (`http://localhost:3000` in locale) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Secret sessione (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |

Dettagli: [`docs/SETUP_AUTH.md`](docs/SETUP_AUTH.md) e [`docs/SETUP_GOOGLE_OAUTH.md`](docs/SETUP_GOOGLE_OAUTH.md).

### Persistenza Editor

Community, team, spunti e override schede → PostgreSQL (`curator_store`).  
Seed iniziale: `data/curator-store.example.json` (o import one-shot da un eventuale `curator-store.json` locale).

---

## Struttura (sintesi)

```
app/                 # Route App Router (feed, records, curator, auth, API)
components/          # UI (Navbar, grafo, dock spunti, …)
contexts/            # CuratorDataProvider
lib/                 # Domain, communities, curator store, org RBAC
data/                # curator-store.example.json (seed); JSON locale solo per import
docs/                # Documentazione
prisma/              # Schema Auth + curator_store (+ modelli dominio legacy)
```

---

## Deploy

Vedi **[`docs/DEPLOY.md`](docs/DEPLOY.md)**.

In breve: Postgres + env di produzione + redirect Google. L’Editor persiste su Postgres (ok anche su Vercel + Neon free).

---

## Licenza

Vedi [`LICENSE`](LICENSE).
