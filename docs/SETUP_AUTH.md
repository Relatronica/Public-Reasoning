# Setup Autenticazione e Database

## 1. Configurazione Variabili d'Ambiente

Crea un file `.env` nella root del progetto partendo da `.env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-random-qui"

# Google OAuth
GOOGLE_CLIENT_ID="il-tuo-client-id"
GOOGLE_CLIENT_SECRET="il-tuo-client-secret"
```

## 2. Setup Google OAuth

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Vai a "APIs & Services" > "Credentials"
4. Clicca "Create Credentials" > "OAuth client ID"
5. Seleziona "Web application"
6. Aggiungi:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copia `Client ID` e `Client Secret` nel file `.env`

## 3. Genera NEXTAUTH_SECRET

Puoi generare un secret random con:

```bash
openssl rand -base64 32
```

Oppure usa questo comando Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 4. Database

Il database SQLite viene creato automaticamente quando esegui la prima migrazione:

```bash
npx prisma migrate dev
```

## 5. Flow di Registrazione

1. L'utente va su `/auth/register`
2. Inserisce username e seleziona un avatar
3. Clicca "Continua con Google"
4. Completa l'OAuth con Google
5. Viene reindirizzato a `/auth/register/complete` che completa la registrazione

## Note

- Per produzione, cambia `DATABASE_URL` a PostgreSQL o MySQL
- Aggiorna `NEXTAUTH_URL` con il tuo dominio di produzione
- Aggiungi i redirect URI di produzione in Google Cloud Console
