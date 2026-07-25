# Reasoning Records — Memoria del Giudizio Amministrativo e Pubblico

> **"Le delibere dicono *cosa* si è deciso. Reasoning Records conserva e verifica *perché* si è deciso."**

Reasoning Records è una piattaforma di trasparenza civica avanzata e analisi delle decisioni pubbliche (comunali, regionali, aziendali/istituzionali). A differenza dei portali di trasparenza tradizionali e degli Albi Pretori che si limitano ad archiviare il testo legale di un atto, Reasoning Records estrae ed analizza la struttura del giudizio umano ed amministrativo sottostante.

L'applicazione adotta un'interfaccia minimale, dinamica e pulita in stile Reddit feed (light mode), strutturata per la consultazione comunitaria, la falsificabilità delle scelte e l'esplorazione focalizzata sui territori locali (con primo polo pilota a Cormano - MI).

---

## Documentazione del Progetto (`docs/`)

La documentazione professionale completa è organizzata nella cartella [`docs/`](docs):

- **[Architettura & System Design](docs/ARCHITECTURE.md)**: Architettura applicativa, stack tecnologico, diagramma ER del database e flussi dati.
- **[Guida Operativa Curatori & Analisti](docs/CURATOR_GUIDE.md)**: Standard metodologico per estrarre domande reali, opzioni scartate e condizioni di falsificabilità dagli atti ufficiali.
- **[Setup Google OAuth](docs/SETUP_GOOGLE_OAUTH.md)**: Guida dettagliata per la configurazione del provider Google su Google Cloud Console e NextAuth v5.
- **[Note e Flow Autenticazione](docs/SETUP_AUTH.md)**: Flusso di registrazione integrata, configurazione `.env` e gestione del database Prisma.

---

## Incongruenze tra Vecchio Progetto (Adverarial) e Stato Attuale

Inizialmente il repository nasceva con il nome *Adverarial* per la gestione di board argumentative git-like su temi controversi generali. 

Il progetto è stato completamente riarchitettato e riorientato (pivot) per diventare Reasoning Records:

| Vecchio Progetto (Adverarial) | Nuovo Progetto (Reasoning Records) |
| :--- | :--- |
| Focus su temi controversi arbitrari e posizioni git-like | Focus su Atti Pubblici Ufficiali (Comuni, Regioni, Enti) |
| Card per posizioni, voti e proposte di merge | Schede di Giudizio: Domanda Reale, Opzioni Scartate, Falsificabilità, Incertezza |
| Layout scuro con board orizzontali | Reddit Feed Light Mode: Filtri per incertezza, verifiche, territori |
| Schema dati astratto | Modello relazionale Prisma per Atti Pubblici, Quotazioni Verbatim e Verification Review |

---

## Il Problema & La Soluzione

| Problema negli Atti Ufficiali | Soluzione di Reasoning Records |
| :--- | :--- |
| Linguaggio burocratico e opaco | **Domanda Reale**: Traduzione dell'atto nel vero problema amministrativo in rilievo |
| Motivazioni reali e opzioni scartate invisibili | **Opzioni Scartate**: Archivio delle alternative prese in considerazione e motivo dello scarto |
| Falsa certezza e mancanza di assunzioni | **Livello di Incertezza**: Valutazione e dichiarazione del rischio presunto |
| Impossibilità di ritrattare o valutare il giudizio | **Condizione di Falsificabilità**: *Cosa avrebbe fatto cambiare idea al decisore?* |
| Nessun controllo sugli esiti a lungo termine | **Ciclo di Verifica a Posteriori**: Monitoraggio degli esiti effettivi a 6-12-24 mesi |
| Ambiguità tra fonte ufficiale e interpretazione | **Separazione Rigida Fonti**: Distinzione tra citazione testuale verbatim e analisi del curatore |

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
│   ├── acts/                   # Pagine e dettagli Atti Pubblici
│   ├── records/                # Pagine schede di giudizio (Reasoning Records)
│   ├── auth/                   # Pagine autenticazione e registrazione utente
│   ├── settings/               # Impostazioni profilo utente
│   ├── layout.tsx              # Layout globale con Navbar e Sidebar
│   └── globals.css             # Stili globali e utilità Reddit-style
├── components/                 # Componenti UI React
│   ├── Navbar.tsx              # Barra di navigazione con ricerca e login
│   ├── Sidebar.tsx              # Navigazione sinistra (Territori, Categorie, Feed)
│   ├── CommunityRightSidebar.tsx# Sidebar destra con info territorio (Cormano) e statistica atti
│   ├── ReasoningRecordCard.tsx # Card feed per il record del giudizio
│   └── VerbatimVsInterpretationViewer.tsx # Matrice per separazione fonti ufficiali vs interpretazione
├── docs/                       # Documentazione tecnica e professionale del progetto
│   ├── ARCHITECTURE.md         # System design, diagrammi ER e flusso moduli
│   ├── CURATOR_GUIDE.md        # Standard di analisi ed estrazione per i curatori civici
│   ├── SETUP_GOOGLE_OAUTH.md   # Guida passo-passo configurazione Google OAuth
│   └── SETUP_AUTH.md           # Flussi di registrazione e configurazione NextAuth
├── prisma/                     # Database e Schemi
│   ├── schema.prisma           # Modello dati Prisma
│   └── prisma.config.ts        # Configurazione Prisma Client
├── lib/                        # Utilities e Mock Data
│   ├── data.ts                 # Dati di test per atti e record di Cormano (MI)
│   └── prisma.ts               # Istanza Prisma Client singleton
├── types/                      # Definizioni dei Tipi TypeScript
│   └── index.ts                # Interfacce dominio
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

Apri [http://localhost:3000](http://localhost:3000) per esplorare l'applicazione feed locale con i record di Cormano (MI).
