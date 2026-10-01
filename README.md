# SQUEALER

SQUEALER è un'applicazione web di tipo **social network**, sviluppata come progetto universitario.

La piattaforma permette agli utenti di pubblicare contenuti, interagire con altri utenti, partecipare a canali pubblici e privati, utilizzare una chat privata e ricevere notifiche relative alle proprie attività.

Il progetto è stato sviluppato utilizzando **Node.js, Express, EJS e Supabase**, con rendering lato server e gestione delle sessioni utente.

## Funzionalità

### 👤 Gestione degli utenti

* Registrazione e autenticazione degli utenti
* Login e logout
* Gestione delle sessioni
* Profili utente
* Modifica della password
* Gestione delle amicizie
* Rilevamento del browser e del dispositivo utilizzato

### 📝 Squeals

Gli utenti possono creare e visualizzare post, chiamati **Squeals**, e interagire con essi attraverso:

* Pubblicazione di contenuti testuali
* Commenti e risposte
* Reazioni **Cool / Cringe**
* Visualizzazioni
* Menzioni di altri utenti
* Condivisione dei contenuti tramite i canali

L'applicazione implementa inoltre limiti e quote relative al numero di caratteri utilizzabili dagli utenti.

### 📢 Canali

SQUEALER permette di organizzare i contenuti attraverso diversi canali pubblici e specializzati.

Tra i principali:

* **ALLS** – contenuti generali
* **TOP10** – contenuti più popolari
* **CONTROVERSIAL** – contenuti controversi
* **WORST10** – contenuti con le valutazioni più basse
* **RANDOM** – contenuti selezionati casualmente
* **NASA** – contenuti ottenuti tramite la NASA API

Gli utenti possono interagire con i contenuti dei canali e sottoscriversi ai canali disponibili.

### 💬 Chat privata

La piattaforma include un sistema di messaggistica privata tra utenti.

Sono supportati diversi tipi di messaggi:

* Messaggi testuali
* Immagini
* Posizione geografica

### 🔔 Notifiche

Il sistema gestisce notifiche relative alle attività degli utenti, tra cui:

* Menzioni
* Interazioni con i contenuti
* Interazioni sociali
* Messaggi privati

### 🛡️ Moderazione

SQUEALER dispone di funzionalità dedicate alla moderazione della piattaforma.

Gli utenti autorizzati possono gestire diversi elementi del sistema, tra cui:

* Utenti
* Squeals
* Canali
* Contenuti della piattaforma

### 🌐 Integrazione con API esterne

Il canale **NASA** utilizza la **NASA API** per recuperare contenuti da un servizio esterno.

Questa funzionalità permette di integrare dati provenienti da un'API di terze parti all'interno della piattaforma.

## Tecnologie utilizzate

| Tecnologia          | Utilizzo                              |
| ------------------- | ------------------------------------- |
| **Node.js**         | Runtime per il backend                |
| **Express.js**      | Framework web                         |
| **EJS**             | Rendering delle pagine lato server    |
| **JavaScript**      | Logica dell'applicazione              |
| **Supabase**        | Database e servizi backend            |
| **Express Session** | Gestione delle sessioni               |
| **Cookie Parser**   | Gestione dei cookie                   |
| **Node Cron**       | Gestione di attività pianificate      |
| **UUID**            | Generazione di identificativi univoci |
| **NASA API**        | Integrazione con un servizio esterno  |

## Architettura

L'applicazione utilizza un'architettura web basata su **Node.js ed Express**, con rendering delle pagine tramite EJS e accesso al database attraverso Supabase.

```text
                     ┌──────────────────┐
                     │     Browser      │
                     └────────┬─────────┘
                              │
                              │ HTTP
                              ▼
                     ┌──────────────────┐
                     │     Express      │
                     │      Server      │
                     └────────┬─────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌───────────────┐          ┌────────────────┐
        │      EJS      │          │ squealService  │
        │     Views     │          │    Services    │
        └───────────────┘          └───────┬────────┘
                                          │
                                          ▼
                                  ┌────────────────┐
                                  │    Supabase    │
                                  │    Database    │
                                  └────────────────┘

                                          │
                                          ▼
                                  ┌────────────────┐
                                  │    NASA API    │
                                  └────────────────┘
```

### `app.js`

È il punto di ingresso principale dell'applicazione.

Gestisce, tra le altre cose:

* Configurazione di Express
* Middleware
* Gestione delle sessioni
* Autenticazione
* Gestione degli utenti
* Squeals
* Canali
* Messaggi
* Notifiche
* Funzionalità di moderazione
* Avvio del server

### `squealService.js`

Contiene le funzioni dedicate alla gestione dei dati e alle operazioni sul database.

La separazione tra `app.js` e `squealService.js` permette di mantenere distinta la gestione delle richieste HTTP dalla logica relativa ai dati dell'applicazione.

### `package.json`

Contiene le informazioni del progetto e le dipendenze Node.js necessarie per eseguire l'applicazione.

### `.env.example`

Contiene un modello delle variabili d'ambiente necessarie per configurare l'applicazione senza esporre credenziali o informazioni sensibili.

## Configurazione delle variabili d'ambiente

Le informazioni sensibili vengono gestite tramite variabili d'ambiente.

Creare un file `.env` nella directory principale del progetto:

```env
SUPABASE_URL=
SUPABASE_KEY=
NASA_API_KEY=
SESSION_SECRET=
```

Il file `.env` **non deve essere caricato su GitHub**.

Il repository contiene invece `.env.example`, che può essere utilizzato come modello per la configurazione locale.

## Installazione

### 1. Clonare il repository

```bash
git clone https://github.com/marten24/SQUEALER.git
cd SQUEALER
```

### 2. Installare le dipendenze

```bash
npm install
```

### 3. Configurare le variabili d'ambiente

Creare il file `.env` partendo dal modello `.env.example` e inserire le configurazioni necessarie.

### 4. Avviare l'applicazione

```bash
node app.js
```

L'applicazione sarà disponibile all'indirizzo:

```text
http://localhost:3000
```

## Database

Il progetto utilizza **Supabase** come servizio per la gestione del database.

Le operazioni relative ai dati vengono gestite principalmente attraverso il client JavaScript di Supabase e le funzioni presenti in `squealService.js`.

Tra le informazioni gestite dal database troviamo:

* Utenti
* Squeals
* Commenti
* Reazioni
* Canali
* Amicizie
* Messaggi
* Notifiche
* Attività degli utenti

## Sicurezza

Il progetto è stato sviluppato principalmente per scopi universitari e didattici.

Le credenziali e le configurazioni sensibili vengono gestite tramite variabili d'ambiente e non devono essere inserite direttamente nel codice sorgente.

Prima di utilizzare l'applicazione in un ambiente di produzione sarebbero necessari ulteriori interventi di sicurezza, tra cui:

* Hashing sicuro delle password
* Gestione sicura dei secret di sessione
* Validazione e sanitizzazione degli input
* Protezione CSRF
* Rate limiting
* Controlli di autorizzazione più approfonditi
* Configurazione sicura dei cookie
* Configurazione delle policy di accesso al database
* Gestione degli errori orientata alla produzione
* Test di sicurezza approfonditi

## Obiettivi didattici

Lo sviluppo di SQUEALER ha permesso di approfondire diversi aspetti dello sviluppo di applicazioni web, tra cui:

* Sviluppo backend con Node.js
* Utilizzo del framework Express
* Rendering lato server con EJS
* Integrazione con database
* Autenticazione e gestione delle sessioni
* Gestione di contenuti generati dagli utenti
* Comunicazione tra utenti
* Integrazione di API esterne
* Progettazione della logica applicativa
* Gestione di ruoli e funzionalità di moderazione

## Progetto universitario

SQUEALER è stato realizzato nell'ambito di un progetto universitario con l'obiettivo di progettare e sviluppare una piattaforma social completa.

Il progetto ha richiesto l'integrazione di diverse componenti di un'applicazione web, dalla gestione degli utenti e delle sessioni fino alla gestione dei contenuti, delle interazioni sociali, della messaggistica e dei servizi esterni.

## Licenza

Il progetto è stato sviluppato per scopi universitari e didattici.

## Autori

- Marco Tenace @marten24
- Eugenio De Rosa @EugenioDeRosa
