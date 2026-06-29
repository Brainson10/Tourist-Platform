# Smart Tourism Platform – Project Constitution

## 1. Mission
Build a production-grade, AI-powered Smart Tourism Platform for Northeast India that helps tourists discover meaningful experiences, supports government planning with analytics, and gives administrators a reliable content and destination management layer.

This platform is an intelligent tourism experience system, not a hotel marketplace or travel booking platform.

## 2. Architectural Principles
- UI belongs only in components.
- Business logic belongs only in services.
- Database access belongs in Prisma and library modules.
- Keep components reusable and composable.
- Avoid duplicated logic across features.
- Follow SOLID principles and clean architecture boundaries.
- Prefer Server Components where they improve performance and simplicity.
- Use Server Actions only where they directly support mutation workflows.
- Optimize for mobile-first responsive experiences and accessible interfaces.

## 3. Core Technology Stack
- Next.js 15 with the App Router
- JavaScript
- React
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Better Auth
- Cloudinary
- Mapbox
- Recharts
- Zod
- Vercel

## 4. Repository Structure
- app/ – route-level pages and layouts
- components/ – reusable UI only
- services/ – modular business logic
- lib/ – shared infrastructure and utilities
- actions/ – server actions when needed
- hooks/ – reusable client hooks
- context/ – shared state providers
- constants/ – shared content and configuration
- utils/ – helper functions
- prisma/ – schema and database configuration
- public/ – static assets

## 5. Feature Domains
### Tourist Experience
- Landing experience
- Authentication
- Dashboard
- Explore
- AI Recommendations
- Trip Planner
- Experience Timeline
- Memories
- Profile
- Settings

### Government Intelligence
- Dashboard
- Visitor Analytics
- Crowd Heatmap
- Festival Analytics
- Eco Score
- Reports

### Administration
- Users
- Destinations
- Experiences
- Festivals
- Stories
- Villages
- Reports

## 6. AI Service Modules
The AI capabilities must remain modular and isolated under services/.

- services/recommendation/ – travel and experience recommendations
- services/planner/ – itinerary and trip planning logic
- services/context/ – tourist context and preference shaping
- services/story/ – storytelling and memory generation
- services/analytics/ – visitor and destination analytics
- services/maps/ – geographic and route intelligence

## 7. Data Model Baseline
The platform should be designed around the following entities:
- User
- Destination
- Experience
- Village
- Festival
- Story
- Trip
- Recommendation
- Analytics

## 8. Product Quality Standards
- Modern, premium, minimal visual language
- Earth-tone palette with glassmorphism where appropriate
- Smooth motion and polished transitions
- Professional typography and calm spacing
- Production-ready code with clear ownership boundaries

## 9. Delivery Rules for Future Tasks
- Explain the architecture before implementation.
- Create complete files rather than partial scaffolds.
- Keep new modules aligned with the existing structure.
- Reuse existing services and components before introducing duplicates.
- Do not invent missing dependencies; use the current stack unless a new dependency is explicitly approved.
- If a missing module is required, document it and implement it in the correct layer.

## 10. Implementation Status
The initial scaffold establishes the architecture foundation, reusable UI components, and modular service entry points for future feature work.
