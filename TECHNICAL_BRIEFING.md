# H-OUSING — Technical Briefing
### Documento preparatorio per incontro tecnico
---

## 1. Panoramica del Progetto

**H-OUSING** è una Progressive Web App (PWA) per la gestione delle richieste di manutenzione della residenza universitaria H-Farm Campus Marina.

| Dato | Valore |
|------|--------|
| Utenti target | ~160 studenti + team accommodation |
| Stanze | 80 (40 per edificio, edifici A e B) |
| Piattaforma | PWA installabile (mobile-first) |
| Lingue | Italiano (default) + Inglese |
| Stato attuale | **In produzione** (Vercel + Convex Cloud) |

---

## 2. Architettura Tecnica

### Stack tecnologico

| Layer | Tecnologia | Versione | Ruolo |
|-------|-----------|----------|-------|
| **Frontend** | Next.js (App Router) | 16.1.6 | Framework React con SSR/SSG, routing, TypeScript |
| **Backend** | Convex | Cloud | Database real-time, serverless functions, file storage |
| **Autenticazione** | Clerk | v6.37.3 | Gestione utenti, sessioni JWT, login email/password |
| **UI** | Tailwind CSS + shadcn/ui | v4 + latest | Design system iOS-inspired, componenti accessibili |
| **Internazionalizzazione** | next-intl | latest | i18n client-side senza prefisso URL |
| **Grafici** | Recharts | latest | Visualizzazione dati analytics |
| **Hosting** | Vercel | - | CDN edge network, deploy automatico da GitHub |

### Diagramma architetturale

```
┌─────────────────────────────────────────────┐
│           Client (Next.js PWA)              │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Student  │ │  Staff   │ │   Shared    │  │
│  │  Pages   │ │  Pages   │ │ Components  │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ HTTPS + WebSocket
          ┌────────┴────────┐
          │                 │
    ┌─────▼─────┐    ┌─────▼─────┐
    │   Clerk   │◄──►│  Convex   │
    │   Auth    │JWT │  Backend  │
    └───────────┘    └─────┬─────┘
                           │
                    ┌──────┴──────┐
                    │  Database   │
                    │  + Storage  │
                    └─────────────┘
```

### Infrastruttura di deploy

| Servizio | Regione | URL |
|----------|---------|-----|
| Vercel (frontend) | Edge global | *.vercel.app |
| Convex (backend) | EU West 1 | brazen-rook-781.eu-west-1.convex.cloud |
| Clerk (auth) | - | proven-hamster-99.clerk.accounts.dev |
| GitHub (repo) | - | github.com/aiagents2000/H-OUSING (privato) |

**Pipeline CI/CD:** Push su GitHub → Vercel auto-build → deploy automatico in produzione.

---

## 3. Schema Database (Convex)

### Tabelle

#### `users`
| Campo | Tipo | Note |
|-------|------|------|
| clerkId | string | ID univoco da Clerk |
| email | string | |
| fullName | string | |
| role | "student" \| "staff" | Determina l'interfaccia visualizzata |
| roomNumber | string? | Solo studenti |
| building | "A" \| "B"? | Solo studenti |
| courseOfStudy | string? | Solo studenti |
| studentId | string? | Matricola |
| photoUrl | string? | Foto profilo |
| createdAt | number | Timestamp |

**Indici:** `by_clerk_id`, `by_email`, `by_role`

#### `rooms`
| Campo | Tipo | Note |
|-------|------|------|
| roomNumber | string | 1-40 |
| building | "A" \| "B" | |
| occupants | Id<"users">[] | Array di riferimenti utenti |
| createdAt | number | |

**Indici:** `by_room_number`, `by_building`, `by_room_and_building`

**Pre-seed:** 80 stanze create automaticamente (40 per edificio).

#### `maintenanceRequests`
| Campo | Tipo | Note |
|-------|------|------|
| studentId | Id<"users"> | Chi ha creato la richiesta |
| roomNumber | string | Auto-compilato dal profilo |
| building | "A" \| "B" | Auto-compilato |
| category | "plumbing" \| "electrical" \| "cleaning" \| "other" | Categoria del problema |
| priority | "low" \| "medium" \| "high" \| "urgent" | Livello di urgenza |
| description | string | Min 20 caratteri |
| photoStorageId | Id<"_storage">? | Foto allegata (compressa client-side) |
| status | "open" \| "in_progress" \| "completed" \| "rejected" | Stato corrente |
| rejectionReason | string? | Motivazione del rifiuto |
| createdAt | number | |
| updatedAt | number | |
| completedAt | number? | Timestamp completamento |

**Indici:** `by_student`, `by_status`, `by_room`, `by_building`, `by_created`, `by_status_and_building`

#### `notifications`
| Campo | Tipo | Note |
|-------|------|------|
| userId | Id<"users"> | Destinatario |
| requestId | Id<"maintenanceRequests"> | Richiesta collegata |
| type | "status_change" \| "new_request" | |
| message | string | |
| read | boolean | |
| createdAt | number | |

**Indici:** `by_user`, `by_user_and_read`

---

## 4. Funzionalità Implementate

### Flusso Studente

| Funzionalità | Stato | Descrizione |
|--------------|-------|-------------|
| Registrazione/Login | ✅ | Clerk email/password, onboarding con scelta ruolo |
| Dashboard | ✅ | Statistiche, richieste recenti, pulsante apertura porta |
| Apertura porta | ✅ (mock) | Bottone con animazione, predisposto per API control room |
| Crea richiesta | ✅ | Form con categoria, priorità, descrizione, foto compressa |
| Lista richieste | ✅ | Filtri scrollabili per stato, ricerca testuale |
| Dettaglio richiesta | ✅ | Modal con foto, stato, timeline, motivo rifiuto |
| Stanza | ✅ | Info stanza, coinquilini, richieste attive della stanza |
| Profilo | ✅ | Dati personali + link a Info & Aiuto |
| Notifiche | ✅ | Campanella con contatore non-letti, real-time |
| FAQ/Regolamento/Contatti | ✅ | Accordion, contatti con deep link tel:/mailto: |
| Bottom navigation | ✅ | 5 tab: Dashboard, Richieste, Porta, Stanza, Profilo |
| PWA | ✅ | Installabile, standalone, Service Worker |
| i18n IT/EN | ✅ | Toggle lingua, persistenza localStorage |

### Flusso Staff

| Funzionalità | Stato | Descrizione |
|--------------|-------|-------------|
| Dashboard | ✅ | KPI: aperte, in corso, completate, tempo medio risoluzione |
| Gestione richieste | ✅ | Tabella completa con filtri etichettati + chip attivi |
| Cambio stato | ✅ | Dialog di conferma, textarea motivo rifiuto |
| Analytics | ✅ | Grafici: per stato, categoria, edificio, priorità, trend 30gg |
| Contatto studente | ✅ | Link email diretto dal dettaglio richiesta |
| Vista mobile | ✅ | Card layout su mobile, tabella su desktop |

### Funzionalità Trasversali

| Feature | Dettaglio |
|---------|-----------|
| **Real-time** | Ogni query Convex è una subscription WebSocket. Cambio stato staff → studente vede aggiornamento istantaneo |
| **Compressione immagini** | Client-side via canvas API, max 1920px, qualità 0.8 |
| **Protezione ruoli** | Middleware Clerk + redirect client-side. Studente non accede a /staff/*, staff non accede a pagine studente |
| **Responsive** | Mobile-first. Breakpoint: mobile (default), sm (640px), md (768px), lg (1024px) |
| **Accessibilità** | ARIA labels, touch target 44px, keyboard navigation, semantic HTML |

---

## 5. Apertura Porta — Dettaglio Tecnico

### Stato attuale: Mock/Placeholder

Il pulsante di apertura porta è implementato sia nella dashboard che nella bottom navigation:

```
Utente tocca → Loading (1.5s simulato) → Stato "Aperta" (3s) → Reset
```

### Predisposizione per integrazione reale

Il codice è pronto per essere collegato a un'API del control room:

```typescript
// Attuale (mock):
// TODO: Connect to control room API
setTimeout(() => {
  setDoorState("opened");
}, 1500);

// Futuro (reale):
const response = await fetch('/api/door/unlock', {
  method: 'POST',
  body: JSON.stringify({
    building: currentUser.building,
    userId: currentUser._id,
  }),
});
```

**Requisiti per l'integrazione:**
1. Endpoint API del sistema di controllo accessi (REST o WebSocket)
2. Autenticazione (API key, token, o certificato)
3. Identificazione porta (per edificio/ingresso)
4. Tempo di sblocco configurabile
5. Logging degli accessi (chi, quando, quale porta)

**Domande per il tecnico:**
- Qual è il protocollo del sistema di controllo accessi attuale? (REST API, MQTT, proprietario?)
- Esiste già un'API esposta o serve sviluppare un middleware?
- Serve autenticazione per l'API? Che tipo?
- Il sistema supporta feedback real-time (porta effettivamente aperta)?
- Ci sono requisiti di sicurezza specifici (VPN, certificati, IP whitelist)?

---

## 6. Scelte Architetturali e Motivazioni

### Perché Convex invece di un backend tradizionale?

| Aspetto | Convex | Backend tradizionale (Express + PostgreSQL) |
|---------|--------|---------------------------------------------|
| Real-time | Nativo (ogni query = subscription WebSocket) | Richiede implementazione custom (Socket.io) |
| Infrastruttura | Zero-ops, serverless | Server da gestire, scaling manuale |
| Type safety | Schema tipizzato, API generate automaticamente | ORM + tipi manuali |
| File storage | Integrato | Serve S3 o simile |
| Costo | Free tier generoso (~1M function calls/mese) | Costo hosting + database |

### Perché PWA invece di app nativa?

| Aspetto | PWA | App nativa (React Native) |
|---------|-----|---------------------------|
| Deploy | Istantaneo via web | App Store review (giorni) |
| Sviluppo | Singolo codebase | Possibili differenze iOS/Android |
| Installazione | "Aggiungi a Home" | Download da store |
| Aggiornamenti | Automatici | Richiede update da store |
| Costo | Zero (hosting web) | Account developer Apple/Google |
| Accesso hardware | Limitato (no Bluetooth, NFC) | Completo |

**Nota:** Per l'apertura porta, se il sistema usa NFC/Bluetooth, servirà valutare il passaggio a React Native.

### Perché Clerk invece di auth custom?

- Gestione sicura password, sessioni, JWT senza codice custom
- Integrazione nativa con Convex (JWT validation)
- Dashboard per gestire utenti senza scrivere un admin panel
- Sessioni configurabili (attualmente: 30 giorni consigliati)
- Possibilità di aggiungere SSO, 2FA, magic link in futuro

---

## 7. Performance e Sicurezza

### Performance
- **First Contentful Paint:** < 1.5s (Vercel edge + static generation)
- **Service Worker:** Cache-first per asset statici, network-first per navigazione
- **Immagini:** Compressione client-side prima dell'upload (riduzione ~70%)
- **Bundle:** Next.js code splitting automatico per route

### Sicurezza
- **Autenticazione:** Clerk gestisce hashing password, sessioni, CSRF
- **Autorizzazione:** Server-side via `ctx.auth.getUserIdentity()` in ogni funzione Convex
- **Route protection:** Middleware Next.js + redirect client-side per ruoli
- **Input validation:** Convex `v.string()`, `v.union()` su tutte le mutation
- **HTTPS:** Enforced ovunque (Vercel + Convex)
- **CORS:** Gestito automaticamente da Convex
- **File upload:** Validazione tipo e dimensione (max 5MB, solo JPEG/PNG/WebP)

---

## 8. Stato di Produzione Attuale

### Cosa è live
- ✅ Frontend su Vercel (auto-deploy da GitHub)
- ✅ Backend su Convex Cloud (EU West 1)
- ✅ Auth su Clerk (attualmente chiavi di sviluppo `pk_test_`)
- ✅ 80 stanze pre-seed nel database
- ✅ PWA installabile

### Cosa manca per il go-live completo

| Task | Priorità | Effort | Note |
|------|----------|--------|------|
| Chiavi Clerk di produzione | Alta | 30 min | Switch da `pk_test_` a `pk_live_` nel dashboard Clerk |
| Restrizione dominio email | Alta | 15 min | Solo @h-farm.com (configurabile da Clerk) |
| Dominio custom | Media | 1h | Es. housing.h-farm.com su Vercel |
| Integrazione porta reale | Media | Variabile | Dipende dall'API del sistema di controllo accessi |
| Notifiche email | Bassa | 2-3h | Integrazione con Resend/SendGrid per email su cambio stato |
| Push notifications | Bassa | 3-4h | Web Push API via Service Worker |
| Dark mode | Bassa | 2h | Toggle chiaro/scuro |
| Error monitoring (Sentry) | Bassa | 1h | Tracking errori runtime in produzione |

---

## 9. Struttura del Codice

```
H-OUSING/
├── app/
│   ├── (auth)/                    # Pagine login/registrazione
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── onboarding/
│   ├── (student)/                 # Interfaccia studente
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── room/
│   │   ├── requests/
│   │   ├── info/faq|rules|contacts/
│   │   └── layout.tsx             # Layout con bottom nav + sidebar desktop
│   ├── staff/                     # Interfaccia staff
│   │   ├── dashboard/
│   │   ├── requests/
│   │   ├── analytics/
│   │   └── layout.tsx
│   ├── layout.tsx                 # Root layout (PWA meta, font)
│   ├── providers.tsx              # Clerk + Convex + i18n providers
│   └── globals.css                # Design system iOS-inspired
├── components/
│   ├── shared/                    # Navbar, sidebar, bottom-nav, notifications
│   ├── student/                   # Dashboard stats, request cards/forms
│   ├── staff/                     # Request table, analytics charts, status updater
│   └── ui/                        # shadcn/ui components
├── convex/
│   ├── schema.ts                  # Schema database
│   ├── users.ts                   # CRUD utenti
│   ├── rooms.ts                   # Gestione stanze + seed
│   ├── maintenanceRequests.ts     # Logica richieste + stats + analytics
│   ├── notifications.ts           # Sistema notifiche
│   └── files.ts                   # Upload/download file
├── lib/
│   ├── constants.ts               # Categorie, stati, priorità con colori/icone
│   ├── i18n.ts                    # Gestione locale IT/EN
│   ├── image-compression.ts       # Compressione immagini client-side
│   └── utils.ts                   # Utility generiche
├── messages/
│   ├── en.json                    # Traduzioni inglese
│   └── it.json                    # Traduzioni italiano
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   ├── icons/                     # Icone PWA (SVG)
│   └── favicon.svg
└── middleware.ts                   # Route protection Clerk
```

---

## 10. Metriche e Scalabilità

### Limiti attuali (free tier)

| Servizio | Limite Free | Sufficiente per H-OUSING? |
|----------|-------------|---------------------------|
| Convex | 1M function calls/mese | ✅ (160 utenti) |
| Convex storage | 1GB | ✅ (foto compresse) |
| Vercel | 100GB bandwidth/mese | ✅ |
| Clerk | 10.000 monthly active users | ✅ |

### Scalabilità futura
- **Orizzontale:** Convex e Vercel scalano automaticamente
- **Multi-campus:** La struttura building A/B è estendibile a N edifici
- **Multi-residenza:** Possibile con tenant isolation a livello di Convex deployment

---

## 11. Domande Preparatorie per il Tecnico

### Sul sistema di controllo accessi
1. Che sistema usate attualmente per i badge? (marca/modello)
2. C'è un'API REST o un protocollo specifico per comandare l'apertura da remoto?
3. Il sistema è in rete locale o accessibile da internet?
4. Servono credenziali specifiche per ogni porta o c'è un controller centralizzato?
5. Qual è il tempo di sblocco standard del badge? (es. 5 secondi)

### Sull'infrastruttura
6. C'è un server locale nel campus che potrebbe fare da ponte (middleware)?
7. Ci sono restrizioni di rete (VPN, firewall) per accedere ai sistemi interni?
8. Avete già un sistema di logging degli accessi?

### Sulla sicurezza
9. Quali requisiti di sicurezza per l'apertura remota? (2FA, geolocalizzazione, orari)
10. Serve un audit trail degli accessi via app?
11. Chi autorizza l'apertura? (qualsiasi studente registrato, solo quelli assegnati all'edificio?)

### Sul rollout
12. È possibile fare un pilot con un edificio solo?
13. Quanti terminali/controller ci sono per edificio?
14. C'è assistenza tecnica del fornitore del sistema badge?

---

## 12. Demo Rapida — Cosa Mostrare

### Flusso da mostrare in 5 minuti:

1. **Apertura app PWA** — mostrare che si apre fullscreen come app nativa
2. **Dashboard studente** — pulsante porta + statistiche
3. **Creare una richiesta** — selezionare categoria, priorità, aggiungere foto
4. **Passare a vista staff** — mostrare la stessa richiesta nella tabella
5. **Cambiare stato** — da "Aperta" a "In Lavorazione" → notifica real-time
6. **Analytics** — grafici per stato, categoria, trend
7. **Cambio lingua** — IT → EN con un click
8. **Bottom navigation** — navigazione fluida tra le sezioni

---

*Documento generato il 16/02/2026 — H-OUSING v1.0*
