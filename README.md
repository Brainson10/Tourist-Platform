# Smart Tourism

Discover places, explore experiences and plan trips across Northeast India.

## Getting started

Requirements: Node.js 20+, PostgreSQL 14+.

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in the values (see below)
npm run db:migrate          # apply all migrations
npm run db:seed             # sample destinations, experiences, festivals, stories, souvenirs
npm run dev                 # http://localhost:3000
```

To also create demo accounts (`admin@tourism-platform.com` / `Admin@123`, `tourist@tourism-platform.com` / `Tourist@123`),
seed with `SEED_DEMO_ACCOUNTS=true npm run db:seed`. **Never do this on a production database.**

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | yes (production) | Signs session cookies. Generate with `openssl rand -base64 32`. The app refuses to start in production without it. |
| `BETTER_AUTH_URL` | yes | Public base URL of the site, e.g. `https://example.com` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | no | Comma-separated extra origins allowed to call the auth API |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | yes (production uploads) | Photo storage. Without them, development saves uploads to `public/uploads/` and production refuses uploads (image links still work). |
| `NEXT_PUBLIC_MAP_TILE_URL`, `NEXT_PUBLIC_MAP_ATTRIBUTION` | no | Map tiles. Defaults to OpenStreetMap, which is fine for light use; use a tile provider for real traffic. |
| `OPEN_METEO_API_KEY` | commercial use | Weather forecasts. Open-Meteo is free for non-commercial use; set a key for the commercial endpoint. |
| `OVERPASS_API_URL` | no | Override the OpenStreetMap Overpass endpoint used for nearby places |

No API keys are needed to run it: maps use OpenStreetMap tiles, nearby places come from the Overpass API (cached a day), and weather from Open-Meteo (cached 30 minutes). Each fails gracefully with a retry message rather than breaking the page.

### Upgrading an existing database

Migration `20260926000000_platform_overhaul` moves authentication to Better Auth and cleans up the schema. It keeps existing data:

* existing password hashes are moved into Better Auth credential accounts, so everyone can still sign in with their current password;
* destination state/district now come from the village (they already matched);
* `fullDescription` and `heroImage` are merged into `description` and `coverImage`;
* users with the removed `GOVERNMENT` role become `TOURIST`;
* duplicate reviews by the same traveler for the same destination are reduced to the newest one.

Everyone has to sign in again after upgrading (old JWT cookies are no longer accepted).

Migration `20260927000000_heritage_features` is additive only (best months, entry permits, trip budgets/sharing/checklists, review photos, local guides). Afterwards, fill in best months from each destination's existing "best season" text:

```bash
pg_dump "$DATABASE_URL" -Fc -f backup-before-upgrade.dump
npm run db:migrate
node scripts/backfill-best-months.mjs --dry   # preview
node scripts/backfill-best-months.mjs          # apply (safe to re-run)
```

Migration `20260929000000_souvenirs` is additive only (souvenir categories, souvenirs, places to buy). To add the starter
"Take Home a Memory" content to an existing database without touching anything already there:

```bash
pg_dump "$DATABASE_URL" -Fc -f backup-before-upgrade.dump
npm run db:migrate
node scripts/seed-souvenirs.mjs                # safe to re-run; never overwrites
```

The starter souvenirs are well-known local crafts and foods with **approximate** prices and places, so each is flagged
"needs verification" and no place is marked verified. Check them, add real photos, and untick the flag in the admin panel.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js development server, production build, production server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Node's built-in test runner, no extra dependencies) |
| `node scripts/smoke-test.mjs` | End-to-end check of pages, APIs, auth and permissions against a running server. It writes data, so use a dev/test database. Set `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. |
| `npm run db:migrate` / `db:seed` | Apply migrations / seed content and baseline permit rules |
| `node scripts/backfill-best-months.mjs` | Fill `bestMonths` from free-text best seasons (`--dry` to preview) |
| `node scripts/seed-souvenirs.mjs` | Add the starter souvenirs, categories and places to buy that are missing (never overwrites) |

## How it's built

```
Browser → Next.js App Router (server components, route handlers, server actions)
        → services (business rules)  → repositories (Prisma queries) → PostgreSQL
```

* `app/(site)` — public pages (destinations, experiences, festivals, souvenirs, stories, guides, shared trips at `/t/[token]`) and the signed-in area (`(account)`: dashboard, trips, saved places, profile, guide dashboard).
* `app/admin` — the admin panel, with its own layout. Every admin page and API checks the `ADMIN` role on the server.
* `app/api` — JSON API. Public endpoints are read-only; all content changes go through `/api/admin/[resource]`.
  Souvenirs: `/api/souvenirs`, `/api/souvenirs/[slug]`, `/api/souvenirs/recommend` (read-only).
  Tourist actions: `/api/trips…`, `/api/destinations/[id]/save`, `/api/destinations/[id]/reviews`.
  Authentication: `/api/auth/*` (Better Auth).
* `lib/services`, `lib/repositories`, `lib/validators` (Zod), `lib/auth` (Better Auth config and session helpers).
* `components/ui` — shared design system (buttons, fields, cards, dialogs, toasts, empty/error states).
* `proxy.js` — redirects signed-out visitors away from account/admin pages early; real checks happen on the server.

Roles: `TOURIST` (default), `GUIDE` and `ADMIN`. Anyone can apply to be a guide; approving the application in the admin panel makes the account a `GUIDE`, and unlisting turns it back into a `TOURIST`. Only admins can change roles; admins can't remove their own access or the last admin.

Privacy rules worth knowing:
* A guide's phone and email, and a traveler's email and phone, are shared with each other only after the guide accepts a request.
* Shared trip links (`/t/…`) show the itinerary and route only — never notes, budget, checklist or the owner's contact details — and are not indexed. Regenerating or turning off sharing kills the old link.
* Uploads are checked by their actual bytes (JPEG, PNG, WebP, AVIF, ≤ 8 MB), stored under server-generated names, and content folders are admin-only.

Design: the "Handloom Heritage" system lives in `app/globals.css` (light/dark tokens), `components/ui/weave.js` (woven-textile accents) and Fraunces display type. Components use semantic colour names (`surface`, `ink`, `line`, `link`…), so both themes come from the tokens.

Recommendations are rule-based and explained on screen ("Because you saved Kaziranga · Wildlife"): shared interests with places a traveler saved, planned or rated highly, the same state, and overall ratings.

Souvenirs ("Take Home a Memory") are discovery, not shopping: each local product has its story, an approximate price,
who it suits, and the markets or workshops that sell it (on the map, with directions). There is no cart, checkout or
payment. "Help me choose" ranks products with the rules in `lib/utils/souvenir-rank.js` and shows why each was picked
("Made in Manipur · Fits under ₹500 · Great for family"). A destination only suggests souvenirs from its own state.

# Tourist-Platform

# 🌏 Smart Tourism Experience Intelligence Platform

> **AI-Powered Tourism Platform for Northeast India**
>
> *Reimagining tourism from destination discovery to personalized experience intelligence.*

---

# 📖 Overview

The **Smart Tourism Experience Intelligence Platform** is an AI-powered tourism ecosystem designed to enhance the travel experience while empowering governments with tourism intelligence.

Unlike conventional tourism applications that primarily focus on hotel booking or navigation, this platform delivers **personalized travel experiences** based on each tourist's interests, travel style, budget, location, weather conditions, seasonal events, and cultural preferences.

The platform also provides a **Government Analytics Dashboard** that helps authorities understand visitor behavior, identify tourism trends, promote lesser-known destinations, and support sustainable tourism development.

---

# 🚀 Vision

Transform tourism from **destination-centric** to **experience-centric**.

Instead of asking:

> "Where do you want to go?"

our platform asks:

> "What kind of experience are you looking for?"

Every traveler receives recommendations that are unique to them rather than generic tourist suggestions.

---

# 🎯 Problem Statement

Existing tourism platforms mainly focus on:

* Hotel booking
* Transportation
* Navigation
* Generic reviews
* Fixed itineraries

These platforms do not understand:

* Individual travel preferences
* Budget constraints
* Travel style
* Local festivals
* Weather conditions
* Hidden attractions
* Cultural immersion

Similarly, governments often lack actionable insights such as:

* Tourist movement patterns
* Popular and under-visited destinations
* Festival impact
* Seasonal tourism trends
* Sustainable tourism indicators

---

# 💡 Proposed Solution

Our platform introduces an **AI-driven Tourism Intelligence System** capable of:

* Understanding traveler preferences
* Creating a Tourism DNA profile
* Recommending personalized experiences
* Generating intelligent travel itineraries
* Promoting hidden destinations
* Supporting sustainable tourism
* Providing tourism analytics for governments

---

# ⭐ Core Innovations

## 1. Tourism DNA

Every traveler receives a personalized profile built from:

* Interests
* Budget
* Travel style
* Group type
* Preferred activities
* Adventure level
* Cultural interests
* Travel pace

The recommendation engine uses this profile to personalize every suggestion.

---

## 2. Experience-Based Tourism

Traditional apps recommend **places**.

Our platform recommends **experiences**.

Example:

Instead of simply recommending **Loktak Lake**, the platform recommends:

* Sunrise Boat Ride
* Floating Village Tour
* Local Fishing Experience
* Bird Watching
* Photography Trail
* Floating Homestay

Each experience includes:

* Duration
* Difficulty
* Budget
* Best season
* Suitable traveler type
* Safety information

---

## 3. Context-Aware Recommendation Engine

Recommendations change dynamically based on:

* Weather
* Time
* Season
* Festivals
* User location
* Budget
* Travel history
* Tourist preferences

No two users receive exactly the same itinerary.

---

## 4. Story Engine

Every destination tells a story.

Instead of only showing facts, the platform presents:

* History
* Local legends
* Cultural significance
* Traditional customs
* Heritage information

This transforms sightseeing into cultural storytelling.

---

## 5. Government Intelligence Dashboard

Authorities receive real-time insights including:

* Tourist flow
* Destination popularity
* Festival impact
* Tourism growth
* Under-visited villages
* Sustainable tourism metrics
* Visitor analytics

---

## 6. Sustainable Tourism

The platform promotes balanced tourism by recommending hidden gems alongside popular attractions, helping distribute visitors more evenly and support local communities.

---

# 🧠 AI Modules

The platform is designed as multiple specialized AI engines.

## Tourism DNA Engine

Builds traveler profiles.

---

## Recommendation Engine

Ranks destinations and experiences.

---

## Context Engine

Analyzes:

* Weather
* Time
* Season
* Festivals
* Budget
* Current location

---

## Planner Engine

Generates personalized itineraries.

---

## Story Engine

Provides cultural narratives and historical context.

---

## Memory Engine

Learns from previous trips to improve future recommendations.

---

# ⚙️ System Architecture

```
User
 │
 ▼
Authentication
 │
 ▼
Tourism DNA
 │
 ▼
Context Engine
 │
 ├── Weather
 ├── Festivals
 ├── Season
 ├── Budget
 ├── Location
 │
 ▼
Recommendation Engine
 │
 ▼
Trip Planner
 │
 ▼
Tourist Dashboard
 │
 ▼
Government Analytics
```
---

# 🏗️ Technology Stack

## Frontend

* Next.js 16
* React 19
* Tailwind CSS

## Backend

* Next.js Route Handlers
* Server Actions

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* Better Auth

## Validation

* Zod

## Security

* Better Auth sessions (database-backed, httpOnly cookies)
* bcrypt password hashing (kept for compatibility with existing accounts)

---

# 📂 Project Structure

```
app/(site)/        public pages + (account) tourist area
app/admin/         admin panel
app/api/           JSON API (public read-only, tourist, admin, auth)
actions/auth/      sign-in, sign-up, sign-out, profile server actions
components/        ui/ (design system), cards/, destination/, trips/, admin/, layout/
lib/auth/          Better Auth config, session and role helpers
lib/services/      business rules
lib/repositories/  Prisma queries
lib/validators/    Zod schemas
lib/utils/         formatting, geo, API client helpers
prisma/            schema, migrations, seed
scripts/           smoke test
tests/             unit tests
```

The project follows a modular architecture where business logic is separated from UI components.

---

# 👥 User Roles

## Tourist

* Explore destinations
* View recommendations
* Create trips
* Save memories
* Receive AI itineraries

---

## Admin

* Manage destinations
* Manage festivals
* Manage experiences
* Manage stories
* Manage users

---

## Guide (Future)

* Manage guided experiences
* Update availability
* Receive tourist requests

---

# 📊 Core Modules

* Authentication
* Destination Management
* Experience Management
* Festival Management
* Story Management
* Trip Planner
* Recommendation Engine
* Government Dashboard
* Admin Panel
* Tourism Analytics

---

# 🌱 Future Scope

* Offline support
* AI voice assistant
* AR tourism experiences
* Crowd prediction
* Smart event recommendations
* Local guide verification
* IoT integration
* Predictive tourism analytics

---

# 🎯 Project Goals

* Enhance tourist experience through AI
* Promote hidden destinations
* Support local communities
* Encourage sustainable tourism
* Help governments make data-driven decisions
* Preserve cultural heritage through storytelling

---

# 📈 Current Development Status

### ✅ Completed

* Project architecture
* Folder structure
* Database foundation
* Authentication foundation
* Backend architecture
* Modular services

### 🚧 In Progress

* Destination Module
* Experience Module
* API Layer

### 📅 Planned

* AI Recommendation Engine
* Government Dashboard
* Tourist Dashboard
* Trip Planner
* Story Engine
* Maps Integration
* Analytics

---

# 🤝 Contribution

This project follows a modular architecture with reusable components and services.

Contributions should maintain:

* Clean Architecture
* Modular Design
* Reusable Components
* Production-ready Code
* Consistent API Standards

---

# 📄 License

This project is being developed as part of a Smart India Hackathon initiative and is intended for educational and research purposes.

---

# 🌟 Project Philosophy

> "Tourism is not about visiting places.
>
> It is about experiencing culture, stories, people, and memories."

Our mission is to build an intelligent tourism ecosystem where every journey is unique, every destination has a story, and every recommendation is personalized.
