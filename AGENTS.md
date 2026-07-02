# AGENTS.md

# AI Coding Agent Instructions

This repository contains the **Smart Tourism Experience Intelligence Platform**.

This document defines how every AI coding assistant (Codex, GitHub Copilot, Claude Code, Cursor, Windsurf, ChatGPT, etc.) must contribute to this repository.

Failure to follow these instructions may result in inconsistent architecture, duplicated logic, security issues, or degraded user experience.

---

# 1. Project Identity

This project is NOT:

- a hotel booking website
- an online travel agency
- a simple tourism directory

This project IS:

An AI-powered Smart Tourism Experience Intelligence Platform.

Its purpose is to help travelers

Dream

↓

Discover

↓

Understand

↓

Plan

↓

Travel

↓

Experience

↓

Remember

↓

Share

Tourism should become an intelligent journey.

---

# 2. Read Before Coding

Before implementing any feature always read

PROJECT_CONSTITUTION.md

This file is the project's single source of truth.

Never invent architecture that conflicts with the constitution.

---

# 3. Primary Goal

Every feature must solve a real tourism problem.

Never implement UI without functionality.

Never implement functionality without considering user experience.

Every module must have clear business value.

---

# 4. Architecture

Always follow

Browser

↓

Next.js App Router

↓

Server Components

↓

Server Actions / API Routes

↓

Service Layer

↓

Repository Layer

↓

Prisma ORM

↓

PostgreSQL

Never bypass the architecture.

---

# 5. Prisma

Never access Prisma directly from

React Components

Client Components

Pages

Layouts

Always use

Repository

↓

Service

↓

API / Server Action

↓

UI

---

# 6. Authentication

Authentication uses Better Auth.

Never authenticate inside middleware using Prisma.

Middleware may only

Read cookies

Redirect

Continue request

Authentication validation belongs to

Server Components

Server Actions

API Routes

---

# 7. Component Rules

Components must have one responsibility.

Good

Hero

SearchBar

QuickFilters

DestinationCard

ExperienceCard

Bad

HomePage.jsx

3000 lines

Never build gigantic components.

---

# 8. UI Philosophy

The platform should feel

Modern

Premium

Minimal

Fast

Accessible

Beautiful

The UI should be comparable to

Airbnb

Apple

Notion

Linear

Avoid clutter.

Whitespace is valuable.

---

# 9. Reusability

Always prefer reusable components.

Never duplicate UI.

If code appears twice

Extract a component.

---

# 10. Folder Naming

Use

kebab-case

Folders

kebab-case

Files

PascalCase

React Components

camelCase

Functions

---

# 11. Styling

Tailwind CSS

No inline styling unless absolutely necessary.

Prefer reusable utility components.

---

# 12. Destination Module

Every destination page should contain

Gallery

Overview

History

Culture

Religion

Language

Food

Things To Do

Nearby Attractions

Experiences

Hotels

Homestays

Transportation

Weather

Best Time

Safety

Emergency

Reviews

AI Recommendation

Related Destinations

Hidden Gems

Photo Spots

Offline Guide

Never create incomplete destination pages.

---

# 13. Search

The search system must understand

Destination

District

Village

Experience

Festival

Food

Nature

Wildlife

Natural Language

Examples

"Weekend trip"

"Camping"

"Waterfalls"

"Photography"

Search results should combine

Destinations

Experiences

Festivals

AI Suggestions

Nearby Attractions

---

# 14. AI Recommendation

The recommendation engine should consider

Budget

Travel Days

Weather

Season

Companions

Interests

Travel History

Safety

Festival Calendar

AI output should include

Recommended Destination

Activities

Budget

Hotels

Restaurants

Packing List

Transportation

Daily Schedule

---

# 15. API Rules

Every API must

Validate input

Authenticate user

Authorize user

Call service

Handle errors

Return consistent JSON

Never expose Prisma errors.

---

# 16. Database

Every feature must have

Prisma Model

Repository

Service

API

Validation

UI

No hardcoded business logic.

---

# 17. Error Handling

Every page must include

Loading state

Error state

Empty state

Success state

Skeleton loading where appropriate.

---

# 18. Security

Never expose secrets.

Never trust client input.

Always validate using Zod.

Use parameterized database queries through Prisma.

Never bypass authorization.

---

# 19. Performance

Prefer

Server Components

Lazy Loading

Image Optimization

Pagination

Caching

Streaming

Avoid unnecessary client-side JavaScript.

---

# 20. Accessibility

Use semantic HTML.

Buttons must be buttons.

Inputs must have labels.

Keyboard navigation should work.

Maintain sufficient color contrast.

---

# 21. Documentation

Whenever implementing a new feature

Update

PROJECT_CONSTITUTION.md

if architecture or business logic changes.

Document important decisions.

---

# 22. Code Quality

Always write production-quality code.

Prefer readability over cleverness.

Keep functions short.

Use descriptive variable names.

Avoid duplication.

---

# 23. Future Proofing

The architecture must support

AI Chat Assistant

Offline Mode

Voice Guide

AR Navigation

Recommendation Engine

Government Analytics

Mobile App

without major refactoring.

---

# 24. If Requirements Are Unclear

Do not invent features.

Do not guess.

Prefer asking for clarification or following PROJECT_CONSTITUTION.md.

---

# 25. Definition of Done

A feature is complete only when it includes

✔ Business logic

✔ Database integration

✔ Validation

✔ API

✔ Responsive UI

✔ Error handling

✔ Loading state

✔ Accessibility

✔ Documentation

✔ Clean architecture

A beautiful UI without functionality is NOT complete.

A working backend without a usable UI is NOT complete.

Both are required.

---

# Final Instruction

You are not building pages.

You are building an intelligent tourism platform.

Every line of code should contribute toward making travel

Smarter

Safer

More personalized

More sustainable

More enjoyable

When multiple implementations are possible

Choose the one that

Improves maintainability

Improves scalability

Improves developer experience

Improves user experience

Follow the constitution.

Protect the architecture.

Think like a senior software architect.