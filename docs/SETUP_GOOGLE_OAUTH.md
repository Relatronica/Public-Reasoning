# Guida Completa: Setup Google OAuth

## Passo 1: Creare le Credenziali OAuth su Google Cloud Console

### 1.1 Accedi a Google Cloud Console
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Accedi con il tuo account Google

### 1.2 Crea o Seleziona un Progetto
1. Clicca sul menu a tendina in alto (dove c'è il nome del progetto)
2. Clicca su **"NEW PROJECT"** (o seleziona un progetto esistente)
3. Inserisci un nome (es: "Reasoning Records")
4. Clicca **"CREATE"**

### 1.3 Abilita Google+ API
1. Nel menu laterale, vai su **"APIs & Services"** > **"Library"**
2. Cerca **"Google+ API"** o **"Google Identity"**
3. Clicca su **"ENABLE"** (se non è già abilitata)

### 1.4 Crea le Credenziali OAuth
1. Vai su **"APIs & Services"** > **"Credentials"**
2. Clicca su **"+ CREATE CREDENTIALS"** in alto
3. Seleziona **"OAuth client ID"**

### 1.5 Configura il Consent Screen (se richiesto)
Se è la prima volta, ti chiederà di configurare il Consent Screen:
1. Seleziona **"External"** (per sviluppo/test)
2. Clicca **"CREATE"**
3. Compila i campi obbligatori:
   - **App name**: "Reasoning Records" (o il nome che preferisci)
   - **User support email**: la tua email
   - **Developer contact information**: la tua email
4. Clicca **"SAVE AND CONTINUE"**
5. Nelle schermate successive, clicca **"SAVE AND CONTINUE"** fino alla fine

### 1.6 Crea OAuth Client ID
1. **Application type**: Seleziona **"Web application"**
2. **Name**: "Reasoning Records Web Client"
3. **Authorized JavaScript origins**: Aggiungi:
   ```
   http://localhost:3000
   ```
4. **Authorized redirect URIs**: Aggiungi:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Clicca **"CREATE"**

### 1.7 Copia le Credenziali
Ti verranno mostrati:
- **Your Client ID** (es: `123456789-abc...xyz.apps.googleusercontent.com`)
- **Your Client Secret** (es: `GOCSPX-abc...xyz`)

IMPORTANTE: Copia queste credenziali, ti serviranno nel prossimo passo!

---

## Passo 2: Configurare le Variabili d'Ambiente

### 2.1 Crea/Modifica il file `.env`
Nella root del progetto, crea o modifica il file `.env`:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/reason?schema=public"

AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="INCOLLA_QUI_IL_SECRET_GENERATO"
NEXTAUTH_SECRET="INCOLLA_QUI_IL_SECRET_GENERATO"

# Google OAuth
GOOGLE_CLIENT_ID="INCOLLA_QUI_IL_TUO_CLIENT_ID"
GOOGLE_CLIENT_SECRET="INCOLLA_QUI_IL_TUO_CLIENT_SECRET"
```

### 2.2 Genera AUTH_SECRET / NEXTAUTH_SECRET
Esegui questo comando nel terminale per generare un secret sicuro:

```bash
openssl rand -base64 32
```

Copia l'output in **entrambi** `AUTH_SECRET` e `NEXTAUTH_SECRET` nel file `.env`.

### 2.3 Inserisci le Credenziali Google
Sostituisci:
- `INCOLLA_QUI_IL_TUO_CLIENT_ID` con il **Client ID** copiato da Google Cloud Console
- `INCOLLA_QUI_IL_TUO_CLIENT_SECRET` con il **Client Secret** copiato da Google Cloud Console

---

## Passo 3: Verificare la Configurazione

### 3.1 Verifica che il file `.env` esista
```bash
ls -la .env
```

### 3.2 Verifica il contenuto (senza mostrare i valori)
```bash
cat .env | grep -E "^[A-Z_]+" | cut -d'=' -f1
```

Dovresti vedere:
- `DATABASE_URL`
- `AUTH_URL` e/o `NEXTAUTH_URL`
- `AUTH_SECRET` e/o `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## Passo 4: Testare la Registrazione

### 4.1 Avvia il Server di Sviluppo
```bash
npm run dev
```

### 4.2 Testa il Flusso
1. Vai su `http://localhost:3000`
2. Clicca su **"Accedi"** nella toolbar
3. Dovresti essere reindirizzato a `/auth/register`
4. Inserisci un username e seleziona un avatar
5. Clicca **"Continua con Google"**
6. Dovresti essere reindirizzato a Google per l'autenticazione
7. Dopo l'autenticazione, verrai reindirizzato a `/auth/register/complete`
8. La registrazione dovrebbe completarsi automaticamente

---

## Troubleshooting

### Errore: "Invalid client"
- Verifica che `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` siano corretti
- Assicurati di non avere spazi extra o caratteri nascosti

### Errore: "Redirect URI mismatch"
- Verifica che l'URI in Google Cloud Console sia esattamente: `http://localhost:3000/api/auth/callback/google`
- Assicurati che `NEXTAUTH_URL` sia `http://localhost:3000`

### Errore: "NEXTAUTH_SECRET is missing"
- Assicurati di aver generato e inserito il secret nel file `.env`
- Riavvia il server dopo aver modificato `.env`

### La pagina di registrazione non carica
- Verifica che tutte le dipendenze siano installate: `npm install`
- Controlla la console del browser per errori
- Verifica che il server sia in esecuzione su `http://localhost:3000`

---

## Per Produzione

Quando sei pronto per il deploy:

1. **Aggiorna Google Cloud Console**:
   - Aggiungi i redirect URI di produzione:
     ```
     https://tuodominio.com/api/auth/callback/google
     ```
   - Aggiungi gli authorized origins:
     ```
     https://tuodominio.com
     ```

2. **Aggiorna le variabili d’ambiente** (hosting):
   ```
   AUTH_URL="https://tuodominio.com"
   NEXTAUTH_URL="https://tuodominio.com"
   ```

3. **Database**: `DATABASE_URL` PostgreSQL di produzione + `npm run db:deploy`

Vedi anche [`DEPLOY.md`](DEPLOY.md).

---

## Checklist Finale

- [ ] Progetto creato su Google Cloud Console
- [ ] Google+ API abilitata
- [ ] OAuth Client ID creato
- [ ] Redirect URI configurato: `http://localhost:3000/api/auth/callback/google`
- [ ] File `.env` creato con tutte le variabili
- [ ] `AUTH_SECRET` / `NEXTAUTH_SECRET` generati e inseriti
- [ ] `GOOGLE_CLIENT_ID` inserito
- [ ] `GOOGLE_CLIENT_SECRET` inserito
- [ ] Postgres migrato (`npm run db:migrate` in locale)
- [ ] Server avviato e testato
- [ ] Registrazione completata con successo
- [ ] Nessun `data/curator-store.json` con PII committato

---

## Note Importanti

- **NON committare il file `.env`** nel repository Git (dovrebbe essere già in `.gitignore`)
- Mantieni le credenziali segrete e non condividerle pubblicamente
- Se cambi le credenziali, riavvia il server di sviluppo
- Per testare su dispositivi mobili nella stessa rete, usa l'IP locale invece di `localhost`
