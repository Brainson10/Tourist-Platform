# PROJECT_CONSTITUTION.md

# Smart Tourism Experience Intelligence Platform

> **Version:** 1.0 (Foundation)

This document is the single source of truth for the project.

## Vision

Build an AI-powered Smart Tourism Experience Intelligence Platform
focused on experiences rather than destinations.

## Mission

Transform tourism from destination-centric to experience-centric using
AI.

## Core Principles

-   Experience before destination
-   Sustainable tourism
-   AI-assisted planning
-   Promote local communities
-   Functional features over decorative UI

## User Roles

-   Tourist (default for new accounts)
-   Guide (same access as a tourist until guide tools exist)
-   Administrator

Roles are enforced on the server in every page, layout and API route.
Hiding UI is never the only protection.

## Core Modules

-   Authentication
-   Destination Intelligence
-   Village Intelligence
-   Tourism CMS
-   Experience Explorer
-   Festival Intelligence
-   Story Module
-   Local Souvenirs ("Take Home a Memory")
-   AI Trip Planner
-   Recommendation Engine
-   Tourist Dashboard
-   Guide Dashboard (future)
-   Admin Dashboard

## Tourism CMS

The Admin Dashboard is the internal Tourism CMS for managing the
platform's operational intelligence.

It must support:

-   Destination intelligence administration
-   Village and category management
-   Festival, experience, and story content management
-   Souvenirs, souvenir categories and places to buy
-   Review moderation
-   User role and account-status management
-   Platform settings

All CMS mutations must follow:

Controller

↓

Service

↓

Repository

↓

Prisma

Admin CMS pages must provide search, filters, pagination, loading
states, empty states, delete confirmation, and clear success/error
feedback.

## Search Engine

The search engine must understand:

-   Destinations
-   Experiences
-   Festivals
-   Food
-   Villages
-   Natural language queries

Examples:

-   Loktak Lake
-   Waterfalls near Imphal
-   Weekend trip under ₹5000
-   Best cultural experience

Search results should include destinations, experiences, festivals,
related places and AI suggestions.

## Destination Module

Every destination page should include:

-   Overview
-   Gallery
-   History
-   Culture
-   Religion
-   Traditions
-   Food
-   Things to do
-   Nearby attractions
-   Weather
-   Best season
-   Hotels
-   Homestays
-   Local guides
-   Festivals
-   Safety
-   Emergency contacts
-   AI itinerary
-   Reviews
-   Hidden gems
-   Local souvenirs (Take Home a Memory)

## AI Trip Planner

Inputs:

-   Budget
-   Travel days
-   Interests
-   Group type
-   Season

Outputs:

-   Personalized itinerary
-   Estimated cost
-   Packing list
-   Food recommendations
-   Festival recommendations
-   Safety advice

## Local guides

-   Anyone can apply; admins approve. Approval grants the GUIDE role,
    unlisting reverts it.
-   Contact details (phone, email) are exchanged only after a guide
    accepts a request. The platform takes no payments.

## Travel rules and planning data

-   Entry permits (e.g. Inner Line Permit) are stored per state and
    shown on every destination in that state, with a "last checked"
    date. Never present permit details as verified unless an admin
    has checked them.
-   `bestMonths` (1–12) is the structured best time to visit; the
    free-text `bestSeason` is kept for nuance.
-   Weather, nearby places and maps come from external services and
    must degrade to a friendly message, never an error page.

## Local souvenirs ("Take Home a Memory")

-   Discovery, not commerce: no cart, checkout, payments, orders,
    shipping or inventory. The flow is Discover → Learn → Find → Visit
    → Buy locally. Any future selling must be a separate, deliberate
    decision.
-   A souvenir tells its story first (why it's special, why take it
    home, how to spot the real thing), then who it suits, an
    approximate price range ("Approx. ₹800–₹1,500", never an exact
    price) and where to buy it.
-   A souvenir belongs to one or more destinations. Its state comes
    from those destinations' villages, and a place to buy
    (`LocalSeller`) takes its district and state from its village.
    Never store location twice.
-   Relevance: a destination shows its own souvenirs first, then
    others from the same state — never other states. "Help me choose"
    is rule-based (`lib/utils/souvenir-rank.js`) and every suggestion
    shows its reasons.
-   Souvenir categories are their own taxonomy, separate from
    destination categories.
-   Content that hasn't been checked is flagged `needsVerification`
    and shown with a note; places are only marked verified by an
    admin. Never use unrelated stock photos — without a real photo,
    show the woven fallback.
-   Only admins create, edit or delete souvenirs, categories and
    places to buy; public APIs return published souvenirs only.

## Uploads

-   Validate images by content (magic bytes), cap size, generate file
    names on the server. Content folders are admin-only.
-   Production storage is Cloudinary; local disk is development only.

## Data rules

-   A destination's district and state always come from its village.
    Never store them on the destination.
-   Ratings shown on destinations are cached from APPROVED reviews only
    (`ratingAverage`, `reviewCount`) and refreshed whenever a review changes.
-   One review per traveler per destination. New and edited reviews are
    PENDING unless "auto-approve reviews" is on in admin settings.
-   Recommendations are rule-based and must always show the reason.

## Architecture

Browser

↓

Next.js

↓

Server Components

↓

API / Server Actions

↓

Service Layer

↓

Repository Layer

↓

Prisma

↓

PostgreSQL

Never access Prisma directly from UI components.

Content mutations exist only in the admin API (`/api/admin/[resource]`),
which routes each resource to its domain service. Public API routes are
read-only.

## Coding Standards

-   Reusable components
-   Single Responsibility Principle
-   Zod validation
-   Responsive UI
-   Loading, empty and error states
-   Clean architecture

## Long-Term Vision

Future integrations:

-   AI assistant
-   Offline guide
-   AR tourism
-   Voice guide
-   Mobile app
-   Government analytics

This constitution is a living document and must be updated before
implementing new features.
