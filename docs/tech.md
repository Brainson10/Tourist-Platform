# Take Home a Memory — Technical Stack & Decisions

## Architecture Overview

```
Browser (Next.js 16)
  ↓
Next.js App Router (Server Components + Client Components)
  ↓
Server Actions / API Routes
  ↓
Service Layer (business logic, ranking, validation)
  ↓
Repository Layer (Prisma queries, transactions)
  ↓
PostgreSQL (Prisma ORM)
```

**Why this stack**: Follows the platform's existing architecture exactly. No new frameworks or patterns introduced. All code lives in the same repo, same tooling, same deployment model.

---

## Database & ORM

### Technology: PostgreSQL + Prisma ORM

**Why Prisma:**
- Already used across the platform (Destinations, Experiences, Festivals, Users, Trips)
- Type-safe queries with auto-generated types
- Handles migrations and schema changes declaratively
- Supports complex relations (m2m joins, nested includes)
- Built-in transaction support for atomic multi-table writes

**Why PostgreSQL:**
- Already the production database
- Supports enums (SouvenirAudience, SouvenirQuality, etc.) natively
- Full-text search ready for future phrase queries
- JSON support if souvenir metadata expands
- Proven at scale for the platform

### Schema Decisions

#### One Migration, Additive Only
- `prisma/migrations/20260929000000_souvenirs/` (one file, ~450 lines)
- No alterations to existing tables (User, Destination, Experience, Festival, Village, Category)
- Pure additions: 6 enums, 6 new models, indexes for query performance
- Database constraints for invariants (prices ≥ 0, max ≥ min)

**Problem solved**: Upgrades on `mydb` with live users were risk-free. A pre-upgrade backup (`pg_dump -Fc`) was taken, then tested on a restored copy before applying to production.

#### Location Never Duplicated
- Souvenir state derived from its linked destinations' villages (not stored separately)
- Seller district/state derived from its village (not stored separately)
- Single source of truth: `Village` model

**Problem solved**: Prevents state drift (e.g., seller moved but update missed). Reduces storage.

#### Separate Category Taxonomy
- `DestinationCategory` (existing, used by destination filters, mood tiles)
- `SouvenirCategory` (new, isolated for souvenir organization)
- Same tables would cause filter pollution and merge logic complexity

**Problem solved**: Filters work independently. A "Food" destination category doesn't conflict with a "Food" souvenir category.

#### Enums as Database Types
```sql
CREATE TYPE "SouvenirAudience" AS ENUM ('MYSELF', 'FAMILY', 'FRIENDS', 'PARTNER', 'CHILDREN', 'PARENTS', 'COLLECTORS');
CREATE TYPE "SouvenirQuality" AS ENUM ('LOCALLY_MADE', 'HANDMADE', 'TRADITIONAL', 'ARTISAN_MADE', 'REGIONAL_SPECIALTY');
```

**Why**: Database-level validation. A buggy API can't write an invalid audience. Enum labels live in `lib/constants/souvenirs.js` once, used by forms and API.

**Problem avoided**: Typos in role/status/tag strings (common in startups).

---

## Validation & Constraints

### Technology: Zod + Database Checks

**Why Zod:**
- Already used platform-wide (`lib/validators/*.js`)
- Composes easily for nested objects (destination IDs array, seller array with notes)
- Clear error messages for forms
- Shareable schema (`souvenirQuerySchema`, `souvenirRecommendSchema`)

**Validation layers:**
1. **Client-side** (UX): browser validation prevents obvious mistakes
2. **API** (security): every request validated via Zod before touching the database
3. **Database** (integrity): NOT NULL, CHECK constraints, enum types reject invalid data

**Example:**
```javascript
// Zod schema
const souvenirSchema = z.object({
  priceMin: z.coerce.number().int().min(0).nullable(),
  priceMax: z.coerce.number().int().min(0).nullable(),
  // ... other fields
}).refine((data) => !data.priceMax || !data.priceMin || data.priceMax >= data.priceMin, {
  message: "The highest price must be at least the lowest price",
  path: ["priceMax"],
});

// Database constraint
ALTER TABLE "Souvenir" ADD CONSTRAINT check_price_order CHECK ("priceMax" IS NULL OR "priceMin" IS NULL OR "priceMax" >= "priceMin");
```

**Problem solved**: Negative prices, inverted price ranges, and invalid enums caught early. No invalid data reaches the database.

---

## Ranking & Recommendations

### Technology: Pure TypeScript (Rule-Based)

**Why not ML/AI:**
- Explainability required ("why this recommendation?")
- Real-time ranking (can't batch or call an external service)
- Simple feature set (budget, destination, state, interests, qualities)
- Deterministic tie-breaking for consistency

**Architecture** (`lib/utils/souvenir-rank.js`):
```typescript
export function rankSouvenirs(items, { destinationId, state, band, audience, interest }, { limit = 4 }) {
  // Score each item
  // Return [{item, score, reasons: ["Made in Manipur", "Fits ₹500–₹1,000", ...]}]
}
```

**Scoring logic:**
| Signal | Points | Why |
|--------|--------|-----|
| Linked to destination | +5 | Most relevant |
| Same state, other destination | +2 | Regional, not distant |
| Price fully in budget | +3 | Actionable purchase |
| Price partly in budget | +1 | Partial fit |
| Audience match | +3 | Personalized |
| Interest match | +3 | Personalized |
| Quality badges | +0.5–1.5 | Craft quality signals |
| Year-round availability | +0.5 | Travel planning bonus |
| Featured by admin | +0.5 | Editorial pick |

**Problems solved:**
1. **State isolation**: A destination never recommends items from another state (no Kerala textiles on a Manipur page)
2. **Explainability**: Every recommendation includes 2–3 human-readable reasons
3. **Tie-breaking**: Featured first, then alphabetical, so results are stable across reloads
4. **No NaN/infinity**: All scores are bounded and tested

---

## API Design

### Endpoints

#### `GET /api/souvenirs`
**Query params**: search, destination, state, category, budget, for (audience), quality, interest, page, limit  
**Returns**: paginated list of cards  
**Validation**: Zod schema rejects unknown budgets, invalid enum values (422 status)

**Problem solved**: Unknown filters return 422 (client error), not 500 (server error). Easy to test.

#### `GET /api/souvenirs/[slug]`
**Returns**: full detail (story, photos, sellers, destinations, recommendations)  
**404 if**: unpublished or unknown  
**Caching**: cacheable by CDN (immutable until admin edits)

**Problem solved**: Unpublished souvenirs never leak to tourists. Slug-based URLs are SEO-friendly.

#### `GET /api/souvenirs/recommend`
**Query params**: destination (slug), state, budget, for (audience), interest  
**Returns**: ranked items with reasons  
**Error**: 404 if destination slug not found

**Problem solved**: Recommendation endpoint is separate, so it can be called from destination pages and the Help me choose widget without needing the full souvenir list first.

#### Admin Routes (via existing generic `/api/admin/[resource]`)
- `POST /api/admin/souvenirs` (create)
- `PUT /api/admin/souvenirs/[id]` (edit)
- `DELETE /api/admin/souvenirs/[id]` (delete)
- Same for categories and sellers
- All require admin role (Better Auth)

**Why reuse**: No new auth logic needed. Follows platform pattern exactly.

---

## Frontend Components

### Technology: React Server Components + Client Components + Tailwind CSS

**Why this split:**
- **Server Components** (default): destination page, detail page, discovery page (initial render)
  - No JavaScript sent to browser
  - Direct database access (no API calls)
  - Can render fallback states (loading, error, empty)
- **Client Components** (islands): Help me choose, filter sheet, interactive chips
  - State management (budget selection, results)
  - Dialog interactions (open/close filter sheet)
  - Real-time form feedback

**Why Tailwind:**
- Already used platform-wide
- No CSS conflicts
- Responsive utilities (hidden sm:block for mobile search button)
- Dark mode support via class and prefers-color-scheme

### Layout Problems & Solutions

#### Problem 1: Search Button Squeeze on Mobile
**Issue**: `hidden sm:inline-flex` kept the button allocated space, shrinking the input.  
**Solution**: Wrap the button in `<div className="hidden sm:block">`, not `hidden` on the button itself.
```jsx
<div className="hidden sm:block">
  <Button type="submit">Search</Button>
</div>
```

#### Problem 2: Horizontal Overflow on Small Screens
**Issue**: `overflow-x-auto` on horizontally scrolling containers, but the sr-only labels escaped the container bounds.  
**Solution**: Add `relative` and `min-w-0` to children, with `sr-only` labels inside scoped to a single item.

#### Problem 3: No-Photo Fallback
**Issue**: Stock images are off-brand. A blank placeholder looks unfinished.  
**Solution**: Woven textile pattern (`components/souvenirs/souvenir-art.js`) with category icon, inspired by authentic gamosa weaving. Seeded variants by hash so it's visually diverse.

**Example**:
```jsx
const variant = hashCode(name) % 4; // 4 unique woven patterns
return <svg aria-label={label}>{/* woven design */}</svg>;
```

---

## Admin UI & Forms

### Technology: React Hook Form (implicit) + Tailwind + Dialog

**Form pattern** (matches `destination-form.js`):
1. Fetch current item (if editing)
2. Build form sections (Basics, Story, Price, Tags, Photos, Publishing)
3. On submit, validate with Zod, then `POST /api/admin/souvenirs`
4. On success, redirect to list or show confirmation

### Problem: Gallery Editor Hardcoded for Destinations
**Issue**: `components/admin/gallery-editor.js` hardcoded `folder: "destinations"`, but souvenirs need their own folder.  
**Solution**: Add a `folder` prop (defaults to "destinations" for backward compatibility), and generalize `maxPhotos`, `noun` (for "A destination" → "A souvenir"), and optional `kinds` array for photo-kind selects.

```javascript
export function Gallery({ name, photos, folder = "destinations", maxPhotos = 20, noun = "A destination", kinds = null }) {
  // ... photo upload with kind select when kinds is provided
}
```

**Benefit**: Reusable; no duplicate code for upload logic.

### Problem: Form Section Boilerplate
**Issue**: Both destination and souvenir forms had inline sections with the same card/label pattern.  
**Solution**: Extract `components/admin/form-section.js`:
```jsx
<FormSection title="Basics" description="Name, category, destinations">
  {/* children */}
</FormSection>
```

---

## Map Integration

### Technology: Leaflet (existing) + Google Maps Directions Link

**Why reuse Leaflet:**
- Already integrated in destination and experience pages
- No new dependencies
- Accessible map controls
- Works offline (if tiles cached)

**New styles** (`app/globals.css`):
```css
.map-pin--shop { color: #8b3a62; } /* Souvenir color token */
.map-pin--destination { color: #1b5e20; } /* Existing green */
```

**Problems solved:**
1. **Distance calculation**: Use existing `distanceKm(lat1, lon1, lat2, lon2)` util to show "1.4 km from {destination}" on cards
2. **Multiple pins**: Shop pins numbered (1, 2, 3...), destination pin distinct, pop on hover
3. **Directions**: Google Maps link with `directionsUrl()` util (no API key needed, uses lat/lng as destination)

```javascript
const directionsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
```

---

## Search Integration

### Technology: Existing Search Repository + Ranking

**How it works:**
1. `components/search/search-combobox.js` has a GROUPS array (Destinations, Experiences, Festivals, **Souvenirs**) with icons
2. When user types, all groups run in parallel
3. Souvenir results ranked by `souvenir-rank.js`, top 3 shown
4. Link to `/souvenirs?q=...` for full results

**Problem solved**: Search feels unified, not bolted-on. No separate search page needed.

---

## Image Handling

### Technology: Next.js Image (AppImage wrapper) + Magic Bytes Validation

**Why magic bytes:**
- Prevent PDF or executable upload as "image"
- Client-side validation before upload attempt
- Fast (reads first few bytes only)

**Fallback strategy:**
1. Try to load the image
2. On load error, show woven fallback
3. Never show "broken" placeholder

**Code** (`components/souvenirs/souvenir-image.js`):
```jsx
export function SouvenirImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <SouvenirArt name={alt} label="Photo unavailable" />
  ) : (
    <img src={src} onError={() => setFailed(true)} alt={alt} />
  );
}
```

**Problem solved**: Broken Cloudinary links (during verification phase) don't look broken to the user.

---

## Seeding & Idempotency

### Technology: Prisma + Transaction + Upsert by Slug

**Why idempotent seeding:**
- Re-running `node scripts/seed-souvenirs.mjs` twice doesn't duplicate data
- New destinations added later can be linked (script re-run adds missing links)
- Safe for CI/CD (no manual cleanup needed)

**Implementation** (`prisma/seed-souvenirs.js`):
```javascript
async function ensureCategory(name, icon) {
  const slug = slugify(name);
  return prisma.souvenirCategory.upsert({
    where: { slug },
    create: { name, slug, icon },
    update: { name, icon }, // skip if already exists
  });
}
```

**Problem solved**: Admin can run seeding in CI, local dev, or a restore scenario without worrying about conflicts.

---

## Testing & Verification

### Unit Tests: `tests/souvenirs.test.mjs`
- Ranking logic (destination first, state second, never other states)
- Budget overlap (full fit, partial fit, no fit)
- Validator schemas (negative price rejected, slug conflicts detected)
- Price formatting (₹500–₹1,500, "From ₹500", "Price varies")

**Tool**: Node.js native `assert`, quick and no dependencies.

### E2E Tests: `scripts/smoke-test.mjs` (14 new checks, 93 total)
- Admin create/edit/delete for souvenirs, categories, sellers
- Error cases: negative price, max < min, no destination, unsafe URL, unknown enum, duplicate slug
- Tourist sees 403 on admin routes and upload folder `souvenirs`
- Filters (budget band, category, destination) exclude non-matches
- Unpublished souvenirs 404 everywhere
- Recommend endpoint returns only same-state items
- Map renders pins; directions link present
- Seller delete unlinks from souvenirs
- Category delete blocked if souvenirs exist

**Tool**: Chrome DevTools Protocol (headless Chrome), no extra test framework needed.

### Browser Tests: Mobile / Dark Mode / Admin
- 390px and 1280px widths
- Light and dark theme
- No console errors, no overflow, no 404 images

**Problem solved**: Responsive design verified before review.

### Database Migration Tests
1. Fresh throwaway DB: migrate + seed twice (idempotent check)
2. Restored copy of `mydb`: upgrade path verified
3. After approval: live migration on `mydb`

---

## Performance Considerations

### Server-Side Filtering (Not Client-Side)
- Budget overlap done in SQL (no client-side filtering)
- Multi-term search splits and requires all terms to match
- State filtering through destination.village.state join

**Why**: Large souvenir lists shouldn't transfer to browser.

### Pagination
- Default 12 items per page
- Click "Load more" or pagination nav
- Prevents initial page size explosion

### Image Optimization
- Next.js Image component (lazy load, responsive sizes)
- Cover image: 1 per card
- Gallery: progressive load with kind labels
- Fallback: SVG pattern (no network fetch)

### Caching Strategy
- `GET /api/souvenirs/[slug]`: cacheable (immutable until admin edit)
- `GET /api/souvenirs/recommend`: recomputed (user-specific)
- Server Components: rendered server-side, no JS payload for layout

---

## Security & Authorization

### Admin-Only Routes
```javascript
// middleware or route handler
if (session?.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
```

**Enforcement**:
- Photo upload folder `souvenirs` is admin-only
- All mutations go through `/api/admin/*` (better-auth middleware)
- Public API is read-only (`GET /api/souvenirs*`)

**Problem solved**: Tourists can't create, edit, or delete souvenirs.

### Input Validation
- Zod validates all API inputs (no raw `req.body` used)
- Slug conflicts detected before write
- Destination IDs, seller IDs verified to exist before linking

### Photo Safety
- Magic bytes validation (no executables as images)
- Cloudinary serves (HTTPS only, CDN strips EXIF by default)
- URLs validated via Zod (no file:// or data:// URIs)

---

## Deployment & Database Migration

### The Upgrade Process
1. **Backup**: `pg_dump -Fc mydb > mydb-backup-before-souvenirs.dump`
2. **Rehearse**: restore to `mydb_rehearsal`, run migrations, verify
3. **Confirm**: `npx prisma migrate deploy` on production database
4. **Seed**: `node scripts/seed-souvenirs.mjs`
5. **Verify**: `npx prisma migrate diff` returns empty (no drift)

**Why this matters**: The platform has live users on `mydb`. A bad migration is catastrophic. Testing on a restored copy first is worth the 5 minutes.

### Zero-Downtime
- Migration adds tables, doesn't alter existing ones
- App can run old code against new schema (new tables ignored until deployed)
- New app code connects to migrated schema immediately after deploy

---

## Problems Faced & Solutions

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| React Compiler crash on `toDelete?.id` | Closure over nullable state | Add optional chaining; pass state to service function |
| Gallery editor hardcoded "destinations" | No abstraction | Add `folder`, `maxPhotos`, `noun` props; generalize for souvenirs |
| Admin form sections duplicated | Copy-paste pattern | Extract `FormSection` component |
| Mobile search button squeezed input | `hidden` class kept space | Wrap button in `<div>` instead |
| No-photo cards looked unfinished | Stock images off-brand | Woven textile fallback with category icon |
| Souvenir state drift (if stored separately) | Multiple sources of truth | Derive state from destinations.village.state |
| Category filters polluted (destination vs souvenir) | Same table for both | Separate `DestinationCategory` and `SouvenirCategory` |
| Unpublished items leaked via search | No publish check in API | Add `isPublished: true` to query AND, test 404 |
| Seller delete orphaned souvenirs | No cascade rule | Add `onDelete: Cascade` to `SouvenirSeller` FK |
| Budget filter too strict (only exact range) | Single price column assumption | Implement overlap logic: `priceMin ≤ max AND (priceMax ≥ min OR (priceMax null AND priceMin ≥ min))` |
| Recommendation always showed other states | No state isolation | Add constraint: "recommend only from destination's state or linked destinations' states" |

---

## Future Tech Debt / Improvements

1. **Image CDN**: migrate to Cloudinary when credentials available
2. **Full-text search**: PostgreSQL GIN indexes for faster multi-term search
3. **Photo validation**: content-based (Computer Vision) detection of duplicate/stock photos
4. **Batch recommendations**: pre-compute top 5 souvenirs per destination, cache in Redis
5. **Seller analytics**: track clicks to "Get directions", helpfulness of tips
6. **Recommendation A/B testing**: compare rule-based vs learned model (future)

---

## Summary

The tech stack is **deliberately conservative**: reused patterns, libraries, and infrastructure from the existing platform. No new frameworks, no hidden complexity. Every layer (database, API, service, UI) has a clear responsibility. Validation happens at three levels (client, API, database). Tests cover units, E2E flows, and browser rendering. The migration was rehearsed before touching production. The souvenir feature integrates seamlessly into an existing tourist platform built on Next.js, Prisma, and TypeScript.
