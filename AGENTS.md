<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Smart Tourism Platform Agent Guide

## Project Mission
Build a production-grade, AI-powered Smart Tourism Platform for Northeast India. The product helps tourists discover meaningful experiences, supports government planning with analytics, and gives administrators a reliable destination and content management layer.

This is an intelligent tourism experience platform. It is not a hotel marketplace, booking marketplace, or generic travel clone.

## Current Stack
- Next.js App Router, installed version is controlled by `package.json`.
- JavaScript and React.
- Tailwind CSS.
- Prisma ORM with PostgreSQL.
- Better Auth.
- Zod.
- Planned integrations include Cloudinary, Mapbox, Recharts, and Vercel deployment.

Before changing framework behavior, read the relevant local Next.js documentation under `node_modules/next/dist/docs/`. For this installed Next.js version, prefer current conventions from those docs over assumptions from older versions.

## Architecture Rules
- Do not regenerate the project.
- Do not replace the architecture.
- Do not rewrite working code unless the task explicitly requires it.
- UI belongs in `components/`.
- Route-level pages and layouts belong in `app/`.
- Business logic belongs in `services/`.
- Database access belongs in Prisma, `lib/db.js`, and focused library modules.
- Server Actions belong in `actions/` only when they directly support mutation workflows.
- Shared infrastructure belongs in `lib/`.
- Shared configuration belongs in `constants/`.
- Reusable helpers belong in `utils/`.
- Shared client state belongs in `context/`.
- Reusable client hooks belong in `hooks/`.
- Static assets belong in `public/`.

Keep modules aligned with these boundaries. Prefer reusing existing components, services, validators, and helpers before adding new ones.

## Feature Domains
Tourist experience:
- Landing experience.
- Authentication.
- Dashboard.
- Explore.
- AI recommendations.
- Trip planner.
- Experience timeline.
- Memories.
- Profile.
- Settings.

Government intelligence:
- Dashboard.
- Visitor analytics.
- Crowd heatmap.
- Festival analytics.
- Eco score.
- Reports.

Administration:
- Users.
- Destinations.
- Experiences.
- Festivals.
- Stories.
- Villages.
- Reports.

## Service Modules
AI and domain intelligence must remain modular and isolated under `services/`.

Expected service areas:
- `services/recommendation/` for travel and experience recommendations.
- `services/planner/` for itinerary and trip planning logic.
- `services/context/` for tourist context and preference shaping.
- `services/story/` for storytelling and memory generation.
- `services/analytics/` for visitor and destination analytics.
- `services/maps/` for geographic and route intelligence.

If a required service module is missing, document it and implement it in the correct layer rather than mixing business logic into pages or components.

## Data Model Baseline
The platform is designed around these core entities:
- User.
- Destination.
- Experience.
- Village.
- Festival.
- Story.
- Trip.
- Recommendation.
- Analytics.

When changing Prisma, keep relationships, indexes, ownership rules, and seed data in sync. Do not add database fields only because a component needs display text; model the domain clearly.

## Authentication Rules
- Better Auth is the intended authentication layer.
- Keep authentication storage, actions, route handlers, and Prisma models consistent with Better Auth requirements.
- Do not mix incompatible custom password/session flows with Better Auth provider flows.
- Protect sensitive pages at the page/data layer as well as through request routing.
- Never rely on client-side navigation hiding for authorization.
- Do not ship fallback production secrets.

## Frontend Standards
- Build the actual product surface, not a marketing-only shell, unless the task specifically asks for marketing content.
- Use Server Components by default where they simplify data access and reduce client JavaScript.
- Use Client Components only for interactivity, browser APIs, or client state.
- Keep UI mobile-first, accessible, and polished.
- Preserve the project’s calm, premium, minimal visual direction.
- Avoid duplicating card, section, shell, button, and form patterns when existing primitives can be extended.

## Implementation Workflow
- Inspect existing code before making changes.
- Explain the relevant architecture before implementation when starting substantial work.
- Create complete, coherent files rather than partial scaffolds.
- Keep edits scoped to the task.
- Do not invent missing dependencies. Use the current stack unless a new dependency is explicitly approved.
- If adding dependencies is necessary, explain why and wait for approval.
- Run relevant validation after changes when feasible, such as lint, build, or focused tests.
- If validation cannot be run, state why.

## Known Project State
- The repository is currently a foundation scaffold with reusable UI, Prisma schema, seed data, auth-related helpers/actions, and placeholder route surfaces.
- Several planned feature areas are not implemented yet.
- Before working on authentication, verify Better Auth route handlers and Prisma auth models are complete and consistent.
- Before working on Next.js request routing, check the installed Next.js docs for current `proxy`/middleware conventions.
