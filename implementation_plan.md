# S.G.A.S.A. - Implementation Plan
**Student Group Academic & Sports Assistant**  
*Interfaccia moderna e centralizzata per il gruppo studenti S.G.A.S.A.*

---

## 1. Visione del Prodotto e Requisiti

### 1.1 Obiettivo
Fornire al gruppo studenti **S.G.A.S.A.** una web app rapida, elegante e reattiva per coordinare la vita universitaria e le attività ricreative del gruppo:
1. **Login & Selezione Studenti**: identificazione rapida dello studente attivo tra i membri del gruppo S.G.A.S.A.
2. **Calendario Lezioni Day-by-Day**: orario settimanale e giornaliero con aule, orari, materie, docenti, tipologie e note.
3. **Appelli d'Esame**: calendario delle prove scritte e orali, countdown all'esame, tracciamento CFU e voti, calcolo medie.
4. **Organizzazione Calciotto**: gestione partite 8 vs 8, convocazioni con RSVP (Presente / In forse / Assente), generatore automatico squadre bilanciate (Maglia Chiara vs Scura), divisione quote campo al centesimo e pulsante WhatsApp.
5. **Dashboard & Bacheca**: riassunto "prossimi eventi" e avvisi rapidi del gruppo.

### 1.2 Target e Tone of Voice
- **Utenti**: Studenti universitari del gruppo S.G.A.S.A.
- **Stile**: Minimalista, rapido e pulito (ispirato a Linear, Notion, Airbnb).
- **Palette**: Dark Mode di default (sfondo scuro profondo `zinc-950` / `zinc-900`, bordi sottili `zinc-800`), con **accenti arancioni vibranti** (`orange-500`, `amber-500`) che richiamano lo spirito sportivo ed energico del gruppo. Toggle per switch Tema Chiaro / Tema Scuro.
- **Layout Responsive**: Sidebar laterale a scomparsa su desktop e Bottom Bar ergonomica per smartphone.

---

## 2. Architettura Tecnica

### 2.1 Stack Tecnologico
- **Framework**: Next.js 15 (React 19 / TypeScript / App Router)
- **Styling**: Tailwind CSS con tema custom dark-first e accento arancione (`#f97316`)
- **Icone**: Lucide React
- **Persistenza Dati**: `LocalStorage` con fallback e pre-popolamento automatico con mock data realistici in italiano al primo avvio.
- **Utilità**: Formattazione date in italiano, esportazione CSV/PDF e formattatore messaggi WhatsApp.

### 2.2 Struttura Cartelle del Progetto

```
sgasa.webapp/
├── implementation_plan.md
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── public/
│   ├── favicon.ico
│   └── logo-sgasa.svg
└── src/
    ├── app/
    │   ├── layout.tsx                # Root layout con Sidebar + BottomNav + Header
    │   ├── page.tsx                  # Dashboard & Hub Riepilogo
    │   ├── lezioni/
    │   │   └── page.tsx              # Calendario lezioni giorno per giorno
    │   ├── esami/
    │   │   └── page.tsx              # Appelli d'esame, countdown e voti
    │   ├── calciotto/
    │   │   └── page.tsx              # Organizzatore partite, formazioni e quote
    │   ├── bacheca/
    │   │   └── page.tsx              # Annunci e avvisi del gruppo
    │   └── profilo/
    │       └── page.tsx              # Gestione studente e switch utente
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx           # Sidebar desktop
    │   │   ├── BottomNav.tsx         # Barra navigazione mobile
    │   │   ├── Header.tsx            # Header con breadcrumb, switch profilo e dark mode toggle
    │   │   └── ThemeProvider.tsx     # Gestore tema dark/light
    │   ├── dashboard/
    │   │   ├── NextUpWidget.tsx      # Prossima lezione, esame e partita
    │   │   ├── QuickStats.tsx        # Statistiche sintetiche (CFU, presenze, partite)
    │   │   └── NoticeBoard.tsx       # Bacheca annunci veloci
    │   ├── lezioni/
    │   │   ├── DayFilter.tsx         # Filtro Lunedì-Venerdì
    │   │   ├── LessonCard.tsx        # Card singola lezione con orari e aula
    │   │   └── LessonModal.tsx       # Modale aggiungi/modifica lezione
    │   ├── esami/
    │   │   ├── ExamCard.tsx          # Card esame con countdown e badge stato
    │   │   ├── ExamStats.tsx         # Media ponderata, CFU totali
    │   │   └── ExamModal.tsx         # Modale aggiungi/modifica appello
    │   ├── calciotto/
    │   │   ├── MatchHeader.tsx       # Info campo, data, orario e quota
    │   │   ├── RosterList.tsx        # Lista studenti con toggle RSVP (Presente/Assente/Forse)
    │   │   ├── SquadBuilder.tsx      # Generatore/Visualizzatore formazioni Chiara vs Scura
    │   │   ├── CostCalculator.tsx    # Calcolo quote a persona in tempo reale
    │   │   └── WhatsAppShare.tsx     # Generatore messaggio copia-incolla WhatsApp
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Badge.tsx
    │       ├── Modal.tsx
    │       ├── Input.tsx
    │       └── Card.tsx
    ├── context/
    │   └── AppContext.tsx            # Context globale per sincronizzazione LocalStorage
    ├── lib/
    │   ├── types.ts                  # Definizioni TypeScript (Student, Lesson, Exam, Match, Notice)
    │   ├── mockData.ts               # Dati realistici in italiano per S.G.A.S.A.
    │   ├── storage.ts                # Wrapper tipizzato per LocalStorage
    │   └── utils.ts                  # Helper date, valuta, WhatsApp format
```

---

## 3. Schema Dati (TypeScript Types)

1. **Student**
   - `id`: string
   - `name`: string (es. "Marco Rossi")
   - `nickname`: string (es. "Il Capitano")
   - `matricola`: string
   - `course`: string (es. "Ingegneria Informatica")
   - `role`: "Presidente" | "Membro" | "Organizzatore Calciotto"
   - `footballRole`: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante"
   - `avatar`: string

2. **Lesson**
   - `id`: string
   - `dayOfWeek`: 1 | 2 | 3 | 4 | 5 (Lunedì-Venerdì)
   - `startTime`: string ("09:00")
   - `endTime`: string ("11:00")
   - `subject`: string (es. "Sistemi Operativi")
   - `professor`: string (es. "Prof. Bianchi")
   - `room`: string (es. "Aula Magna A")
   - `type`: "Teoria" | "Esercitazione" | "Laboratorio"
   - `notes`: string

3. **Exam**
   - `id`: string
   - `subject`: string (es. "Basi di Dati")
   - `date`: string (ISO "YYYY-MM-DD")
   - `time`: string ("09:30")
   - `room`: string (es. "Aula 3B")
   - `type`: "Scritto" | "Orale" | "Scritto + Orale"
   - `cfu`: number (es. 9)
   - `status`: "Da preparare" | "In corso" | "Iscritto" | "Superato" | "Respinto"
   - `grade`: number | null (es. 28, 30L)
   - `session`: "Invernale" | "Estiva" | "Autunnale"

4. **FootballMatch (Calciotto)**
   - `id`: string
   - `date`: string (ISO)
   - `time`: string ("21:00")
   - `location`: string (es. "Centro Sportivo Green Club - Campo 2")
   - `totalPitchCost`: number (es. 96.00 €)
   - `targetPlayers`: number (16 per 8vs8)
   - `status`: "Convocazioni aperte" | "Squadre pronte" | "Giocata"
   - `roster`: Array<{ studentId: string, status: "confirmed" | "maybe" | "declined", paid: boolean }>
   - `teamA`: { name: "Maglia Chiara", playerIds: string[] }
   - `teamB`: { name: "Maglia Scura", playerIds: string[] }
   - `score`: { teamA: number, teamB: number } | null
   - `notes`: string

5. **Notice (Bacheca)**
   - `id`: string
   - `author`: string
   - `date`: string
   - `title`: string
   - `content`: string
   - `tag`: "Urgente" | "Studio" | "Calcetto" | "Generale"

---

## 4. Fasi di Sviluppo

- [ ] **Fase 1**: Inizializzazione progetto Next.js con Tailwind CSS, Lucide Icons e configurazione tema (Dark default con accenti arancioni).
- [ ] **Fase 2**: Implementazione modelli dati TypeScript, dati mock realistici in italiano e store reattivo LocalStorage.
- [ ] **Fase 3**: Creazione Layout globale responsive (Sidebar desktop + BottomNav mobile + Header con profilo switcher).
- [ ] **Fase 4**: Sviluppo Dashboard con widget riassuntivi, prossimi impegni e bacheca.
- [ ] **Fase 5**: Sviluppo Calendario Lezioni giorno per giorno con filtri e gestione CRUD.
- [ ] **Fase 6**: Sviluppo Sezione Appelli d'Esame con countdown tempo reale, calcolo CFU/media e stati.
- [ ] **Fase 7**: Sviluppo Organizzatore Calciotto (RSVP convocazioni, bilanciamento squadre, calcolo quote, export WhatsApp).
- [ ] **Fase 8**: Sviluppo Profilo Studente e switch rapido profilo.
- [ ] **Fase 9**: Avvio server locale e test approfondito nel browser per validare navigazione, interazioni, salvataggio e console senza errori.
