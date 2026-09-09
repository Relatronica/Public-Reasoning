# Reason

> **"Le decisioni dicono *cosa* si è scelto. Reason conserva e verifica *perché*."**

Reason è un feed in stile Reddit per le schede di giudizio. Una community è un luogo di decisione: un **comune**, un **ufficio** o un **progetto**. Il dominio (civico o aziendale) è configurazione, non un secondo prodotto. Il metodo è fisso: domanda reale, opzioni scartate, incertezza, condizioni di cambio idea, verifica a posteriori, verbatim vs interpretazione.

Il mock attuale mostra tre community nello stesso selettore: Comune di Cormano, Ufficio People (Officine Moretti) e Progetto Capex 2027.

---

## Documentazione del Progetto (`docs/`)

La documentazione professionale completa è organizzata nella cartella [`docs/`](docs):

- **[Architettura & System Design](docs/ARCHITECTURE.md)**: Architettura applicativa, community configurabili, stack e modello dati.
- **[Guida Operativa Curatori & Analisti](docs/CURATOR_GUIDE.md)**: Standard metodologico per estrarre domande reali, opzioni scartate e condizioni di falsificabilità da qualsiasi fonte (atto, verbale, deck).
- **[Setup Google OAuth](docs/SETUP_GOOGLE_OAUTH.md)**: Guida dettagliata per la configurazione del provider Google su Google Cloud Console e NextAuth v5.
- **[Note e Flow Autenticazione](docs/SETUP_AUTH.md)**: Flusso di registrazione integrata, configurazione `.env` e gestione del database Prisma.

---

## Incongruenze tra Vecchio Progetto (Adverarial) e Stato Attuale

Inizialmente il repository nasceva con il nome *Adverarial* per la gestione di board argumentative git-like su temi controversi generali. 

Il progetto è stato riarchitettato in Reasoning Records:

| Vecchio Progetto (Adverarial) | Nuovo Progetto (Reasoning Records) |
| :--- | :--- |
| Focus su temi controversi arbitrari e posizioni git-like | Focus sul giudizio situato, in community configurabili |
| Card per posizioni, voti e proposte di merge | Schede di Giudizio: Domanda Reale, Opzioni Scartate, Falsificabilità, Incertezza |
| Layout scuro con board orizzontali | Reddit Feed Light Mode: filtri per incertezza e verifiche, selettore community |
| Schema dati astratto | Community + fonte + Reasoning Record (verbatim, scarti, review) |

---

## Il Problema & La Soluzione

| Problema nella fonte (atto, verbale, deck) | Soluzione di Reasoning Records |
| :--- | :--- |
| Linguaggio opaco o di circostanza | **Domanda Reale**: il problema sostanziale a cui si rispondeva |
| Motivazioni reali e opzioni scartate invisibili | **Opzioni Scartate**: alternative considerate e motivo dello scarto |
| Falsa certezza e assunzioni implicite | **Livello di Incertezza**: rischio e premesse rese esplicite |
| Impossibilità di ritrattare il giudizio | **Condizione di Falsificabilità**: *Cosa avrebbe fatto cambiare idea?* |
| Nessun controllo sugli esiti | **Ciclo di Verifica a Posteriori**: 6-12-24 mesi |
| Ambiguità tra fonte e lettura | **Separazione Rigida**: citazione verbatim vs interpretazione |

---

## Stack Tecnologico

- **Framework Web**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Client Hooks)
- **Linguaggio**: [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) (Reddit-style light mode, card minimali, badge cromatici)
- **Iconografia & Animazioni**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) (Supporto SQLite per sviluppo locale `dev.db` e PostgreSQL per produzione)
- **Autenticazione**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/) con adattatore Prisma e provider Google OAuth

---

## Architettura del Codice e Struttura della Directory

```
├── app/                        # Next.js App Router
│   ├── page.tsx                # Homepage Feed stile Reddit (Filtri per incertezza/verifiche)
│   ├── acts/                   # Archivio fonti della community attiva
│   ├── records/                # Pagine schede di giudizio (Reasoning Records)
│   ├── auth/                   # Pagine autenticazione e registrazione utente
│   ├── settings/               # Impostazioni profilo utente
│   ├── layout.tsx              # Layout globale con Navbar e Sidebar
│   └── globals.css             # Stili globali e utilità Reddit-style
├── components/                 # Componenti UI React
│   ├── Navbar.tsx              # Barra di navigazione, selettore community, ricerca
│   ├── Sidebar.tsx              # Navigazione sinistra (feed, categorie della community)
│   ├── CommunityRightSidebar.tsx# Sidebar destra: pack e stats della community attiva
│   ├── ReasoningRecordCard.tsx # Card feed per il record del giudizio
│   └── VerbatimVsInterpretationViewer.tsx # Matrice fonte vs interpretazione
├── docs/                       # Documentazione tecnica e professionale del progetto
│   ├── ARCHITECTURE.md         # System design, community, diagrammi ER
│   ├── CURATOR_GUIDE.md        # Standard di analisi ed estrazione
│   ├── SETUP_GOOGLE_OAUTH.md   # Guida passo-passo configurazione Google OAuth
│   └── SETUP_AUTH.md           # Flussi di registrazione e configurazione NextAuth
├── prisma/                     # Database e Schemi
│   ├── schema.prisma           # Modello dati Prisma
│   └── prisma.config.ts        # Configurazione Prisma Client
├── lib/                        # Utilities e Mock Data
│   ├── communities.ts          # Pack delle community (comune, ufficio, progetto)
│   ├── data.ts                 # Fonti e record mock agganciati alle community
│   └── prisma.ts               # Istanza Prisma Client singleton
├── hooks/                      # Client hooks
│   └── useActiveCommunity.ts   # Community attiva da query `?c=`
├── types/                      # Definizioni dei Tipi TypeScript
│   └── index.ts                # Interfacce dominio (Community, ReasoningRecord)
├── auth.ts                     # Configurazione NextAuth.js v5
├── middleware.ts               # Middleware di protezione rotte NextAuth
└── README.md                   # README principale del repository
```

---

## Guida Rapida di Avvio Locale

### 1. Prerequisiti
- Node.js >= 18.x
- npm / pnpm / yarn

### 2. Installazione
```bash
git clone https://github.com/giuseppeaceto/Adverarial.git
cd Adverarial
npm install
```

### 3. Configurazione Ambiente (`.env`)
Copia il file di esempio `.env.example` in `.env`:

```bash
cp .env.example .env
```

Modifica `.env` inserendo il tuo secret casuale e le credenziali Google OAuth.

### 4. Database Setup
Genera il client Prisma e applica le migrazioni al database SQLite locale:

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Avvio Server di Sviluppo
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) per il feed. Il selettore in navbar passa da una community all’altra (`?c=cormano`, `?c=people-moretti`, `?c=capex-2027`).
