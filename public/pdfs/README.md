# Archivio PDF Atti Pubblici — Comune di Cormano

Questa cartella contiene copie archiviate dei PDF degli atti ufficiali del Comune di Cormano,
scaricati dall'Albo Pretorio per garantire la disponibilità permanente dei documenti anche
se il portale originale rimuovesse o spostasse i file.

## ⚖️ Base legale

La copia e la conservazione di questi documenti è legittima ai sensi del:
- **D.Lgs. 33/2013** (Decreto Trasparenza): gli atti dell'Albo Pretorio sono pubblici per legge
- **Art. 7 D.Lgs. 82/2005** (CAD): i documenti della PA in formato digitale sono liberamente accessibili

## 📁 File presenti

| File | Atto | Data | Fonte originale |
|------|------|------|-----------------|
| `delibera-cc-66-2024.pdf` | Delibera C.C. n. 66/2024 — Bilancio Previsione 2025-2027 | 19/12/2024 | [Albo Pretorio Cormano](https://cormano.trasparenza-valutazione-merito.it/web/trasparenza/papca-ap?p_p_id=jcitygovalbo_WAR_jcitygovalboportlet&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_jcitygovalboportlet_action=dettaglio&_jcitygovalboportlet_codiceEnte=CORMANO&_jcitygovalboportlet_tipoAtto=CC&_jcitygovalboportlet_numero=66&_jcitygovalboportlet_anno=2024) |

## 🔄 Come aggiungere un nuovo PDF

1. Vai alla pagina dell'atto sul portale ufficiale (link nella colonna "Fonte originale")
2. Clicca sul pulsante "Scarica PDF" o "Allegato"
3. Rinomina il file con il pattern: `delibera-cc-{numero}-{anno}.pdf` o `delibera-gc-{numero}-{anno}.pdf`
4. Metti il file in questa cartella `/public/pdfs/`
5. Aggiorna `localPdfPath` nel file `/lib/data.ts` per quell'atto

## ⚠️ Note

- Il portale Liferay del Comune richiede un token CSRF di sessione per i download automatici
  — per questo il download è manuale (una tantum, poi il file è servito dalla nostra app)
- I PDF non vengono committati su Git di default (vedi `.gitignore`):
  è consigliabile usare Git LFS o uno storage esterno (es. Vercel Blob, Supabase Storage)
  per i file binari grandi
