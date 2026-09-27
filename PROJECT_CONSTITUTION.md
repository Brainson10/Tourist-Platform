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
