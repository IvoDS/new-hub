# KNOWLEDGE BASE: ARCHITETTURA E LINEE GUIDA DI SVILUPPO

**Progetto:** Hub Personale & Deployment Manager (`ivandestefani.it`)
**Utente/Proprietario:** Ivan De Stefani

Questa knowledge base definisce le specifiche tecniche, architetturali e stilistiche per lo sviluppo del portfolio interattivo e del sistema di gestione dei deployment. Tutti i modelli AI, sviluppatori o script incaricati dello sviluppo di componenti, layout, o logiche di business per questo progetto DEVONO attenersi rigorosamente ai seguenti parametri.

## 1. Stack Tecnologico Principale
- **Frontend Pubblico e Admin:** React (Next.js raccomandato per ottimizzazione SEO/SSR della parte pubblica).
- **Backend & API:** Node.js con architettura REST.
- **Gestione Stato Asincrono:** TanStack Query (React Query) per il frontend.
- **Database:** MariaDB.
- **ORM:** Sequelize.

## 2. Direzione Artistica e UI/UX
- **Stile Visivo:** "Glassmorphism" (pannelli traslucidi, effetti di sfocatura dello sfondo, gradienti morbidi su interfacce a strati). Il design deve risultare "leading-edge", dinamico e fluido sia su desktop che su mobile.
- **Palette Colori (Brand Identity):**
  - **Sfondo principale:** Nero Corvino (`#0A0A0A`) - Dark mode nativa obbligatoria per esaltare i contrasti.
  - **Accenti e gradienti Glass:** Blu Zaffiro (`#0F52BA`) e Verde Smeraldo (`#50C878`).
- **Librerie UI:**
  - **Core e Layout:** Tailwind CSS.
  - **Pannello Admin:** `shadcn/ui` per avere componenti accessibili, modulari e facilmente personalizzabili. I componenti devono essere integrati con il tema scuro e il glassmorphism.
  - **Animazioni (Consigliato):** Framer Motion per transizioni di pagina fluide e interazioni degli elementi UI.

## 3. Infrastruttura, CI/CD e Deployment
Il sistema gestisce il sito principale e funge da centro di controllo per i repository GitHub collegati, gestendo i rilasci in produzione.
- **Orchestrazione:** Docker (container separati per Frontend, Backend, Database e Caddy).
- **Web Server / Reverse Proxy:** Caddy.
- **Pipeline e Continuous Integration (GitHub Actions):** 
  - L'azione di `push` sul branch `main` dei repository tracciati innesca una pipeline. 
  - La pipeline compila l'applicativo, crea la nuova immagine Docker e la trasferisce al server.
- **Blue/Green Deployment (Zero Downtime):**
  1. Il server riceve la build e avvia la nuova versione in un container inattivo (es. *Green*).
  2. Il deployment entra in stato di attesa per approvazione manuale (Gating).
  3. L'utente approva il rilascio dalla sezione Admin dell'hub.
  4. Il backend Node.js comunica con le API di Caddy per effettuare uno switch istantaneo del traffico dal container attivo (es. *Blue*) al nuovo container (*Green*).
  5. **Rollback:** In caso di criticità, deve essere possibile innescare un rollback istantaneo (inversione del proxy verso il container precedente) tramite l'interfaccia Admin o in modo automatico se fallisce l'health-check post-deploy.

## 4. Pannello di Amministrazione e Sicurezza
- **Accesso e Autenticazione:** Single Sign-On (SSO) tramite provider esterni (Google e/o Apple). 
- **Policy:** Nessuna gestione locale delle password. L'accesso è strettamente limitato all'amministratore del sistema.
- **Funzionalità Admin Richieste:**
  - Gestione CRUD dei contenuti dinamici del sito principale (sezione "I miei lavori", bio, link, progetti).
  - Monitoraggio in tempo reale dello stato dei deployment e delle pipeline GitHub Actions.
  - Interfaccia di comando per approvazione rilasci (trigger switch Caddy) e rollback.
  - Gestione (upload/aggiornamento) di asset e file statici.

## 5. Gestione Asset e File
- **Archiviazione:** Volume locale Docker persistente, montato sul container del backend Node.js.
- **Distribuzione:** I file (come il PDF del curriculum scaricabile o le immagini di copertina dei progetti) vengono caricati tramite form nell'area Admin e serviti staticamente dal backend Node.js o direttamente da Caddy.