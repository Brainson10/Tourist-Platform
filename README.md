This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
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

* bcrypt
* JWT (where applicable)

---

# 📂 Project Structure

```
app/
actions/
components/
constants/
context/
hooks/
lib/
prisma/
public/
services/
styles/
utils/
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

## Government

* Tourism analytics
* Reports
* Visitor trends
* Destination insights
* Sustainable tourism metrics

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
