# Pack Governance IA — Registro decisioni

Registro delle decisioni sui sistemi di intelligenza artificiale: non un comunicato, ma una traccia verificabile.

## Cosa documenta

Ogni scheda risponde a quattro domande che un revisore o un responsabile della protezione dei dati possono leggere:

1. **Domanda reale** — il problema sotto il titolo del progetto di IA
2. **Opzione scartata** — cosa non si è fatto, e perché
3. **Decisione** — dove stanno i dati, chi decide, quale modello
4. **Criterio di stop** — cosa farebbe sospendere o ritirare il sistema

Senza il punto 4 la scheda non è un reasoning record.

## Casi coperti nel mock (`?c=ai-governance`)

| Caso | Ambito | Criterio di stop |
|------|--------|------------------|
| Modello linguistico su curriculum / Risorse umane | IA nelle risorse umane | Reclami al Garante o fuga di curriculum |
| Punteggio automatico fidi PMI | Prodotti verso i clienti | Tempi di risposta vs concorrenti + intervento umano |

## Flusso in prodotto (Fase A)

1. Incolla verbale o trascrizione in **Cattura decisione** (`/records/capture`)
2. Rivedi la bozza (domanda, scarto, criterio di stop)
3. Salva **bozza privata** (workspace enterprise)
4. Lo sponsor approva la chiusura dall’editor (`closed`)

## Destinatari

Legal, Rischio, responsabile protezione dati — non «chi ha tempo per compilare un template».

## Cosa non è

Non è etica automatizzata, non è un motore decisionale, non è un sostituto del comitato rischio.
