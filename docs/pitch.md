# Take Home a Memory — Feature Pitch

## The Problem

Tourists finish their Northeast India adventure and ask: **"What special thing should I take home? Why does it matter? Who is it for? What does it cost? Where do I find it locally?"**

The tourism platform had no answer. Other platforms showed e-commerce checkout flows and stock photos, which:
- Miss the *story* behind authentic crafts
- Pressure travelers to buy online instead of supporting local makers
- Treat souvenirs as an afterthought, not a discovery journey
- Show generic products, not place-specific treasures

## The Solution

**Take Home a Memory** is a curated discovery platform for authentic local crafts, textiles, foods and more. It helps travelers:

1. **Discover** why something is special (cultural significance, artisan technique, local tradition)
2. **Learn** who it suits ("Great for bringing home memories of tea country", "Perfect for collectors of traditional textiles")
3. **Find** real prices and places to buy locally (on a map, with hours and directions)
4. **Remember** the story they'll tell about it

## Why It Matters

### For Travelers
- **Authentic experiences**: crafts tied to the destinations they visit, with their real story
- **Smart choices**: rule-based recommendations for their budget, trip length, and interests
- **Responsible tourism**: buy directly from makers and local markets, not e-commerce middlemen
- **Memorable keepsakes**: every souvenir comes with why it's special

### For the Platform
- **Increases trip value**: souvenirs are the final touchstone of a journey
- **Differentiates** from generic travel sites (Tripadvisor, TravelTriangle)
- **Builds sticky behavior**: tourists return to remember what they bought and why
- **Supports Northeast artisans** and local economies (verified sellers, no cut taken)

### For the Business
- **Content moat**: curated souvenir stories and seller networks (hard to copy)
- **Search amplification**: "gifts from Assam", "handmade textiles Manipur" rank naturally
- **Partnership potential**: artisans, cooperatives, heritage NGOs can verify/showcase items
- **Future revenue** (future phase): commission on verified seller referrals, or premium seller listings

## What It Includes

### For Tourists
- **Browse page** (`/souvenirs`): search, filters by state/destination/budget/category/interest, 4–6 cards per page
- **Help me choose**: answer 3 questions → ranked ideas with reasoning ("Made in Manipur", "Fits ₹500–₹1,000", "Great for family")
- **Detail page**: full story, price, up to 3 photos (product, making, market), where to buy on a map, related items
- **Destination integration**: "Take Home a Memory" section on every destination page, with the chooser
- **Home strip**: featured items across all destinations, only shown when data exists

### For Admins
- **Full CMS**: create, edit, publish, verify souvenirs; manage categories and sellers
- **Rich editing**: name, slug, story (why special, why take home, authenticity tips, carry tips), category, destinations, price, tags (who it's for, interests, qualities), photos with kinds (product/making/market), sellers with per-place tips, publish/featured/verification toggles
- **Seller management**: CRUD for markets, shops, workshops, with village lookup (district/state auto-filled), verified badge
- **Bulk flags**: "Needs verification", "No photo", "No destination" for planning work
- **Search & filters**: by destination, category, published status

### Starter Content
- **10 categories**: Handicrafts, Textiles, Clothing, Jewelry, Food, Tea, Art, Home Decor, Gifts, Traditional Products, Other
- **10 well-known items** tied to existing destinations (Longpi pottery, Muga silk, Assam tea, Monpa paper, Naga shawl, etc.), all flagged for verification
- **6 sellers**: well-known markets and cooperatives with approximate coordinates, also flagged for verification
- **No stock photos**: woven fallback pattern when a photo is unavailable, respecting local IP

## Discovery, Not E-Commerce

**Explicitly not included:**
- Cart or checkout
- Payment processing
- Shipping or delivery
- Inventory tracking
- Commission or margins

**Why**: Souvenirs are about supporting makers locally and learning their story, not about conversion funnels. Travelers buy on their trip, face-to-face. The platform's job ends with "here's where to find it."

## Key Metrics

- **Page views**: /souvenirs discovery, destination "Take Home a Memory" sections
- **Help me choose usage**: engagement rate, completion rate, click-through to detail
- **Destination affinity**: which destinations have the most souvenir views
- **Admin workflow**: time from upload to published (verification bottleneck)
- **Future**: seller performance (clicks to directions, tip helpfulness)

## Roadmap

### Phase 2 (future)
- Real product photos from artisans
- Verified seller badges after admin review
- Seller reviews and testimonials
- Video: artisans explaining their craft
- Souvenir ideas in the trip itinerary (AI suggestions for day X)

### Phase 3 (future)
- Commission-based seller partnerships (verified sellers get featured placement)
- Souvenir gifting: "send this to a friend back home"
- Souvenir tracking: "remember what you bought from each trip"
- Artisan stories: deep-dive interviews with makers

## Success Criteria (MVP)

✅ Admins can create, edit, publish and verify souvenirs and sellers  
✅ Tourists can browse, filter, search and get recommendations  
✅ Prices, locations and seller hours are displayed accurately  
✅ No stock photos; fallback pattern maintains brand  
✅ Mobile-first layout (filters in a bottom sheet)  
✅ Destination pages integrate naturally  
✅ Seed data is real, well-known Northeast items  
✅ All E2E tests pass (93/93); no console errors  
✅ Ready for admin data entry and photo uploads  

---

## Quick Links

- **Feature branch**: `platform-overhaul`
- **Schema migration**: `prisma/migrations/20260929000000_souvenirs/`
- **Admin UI**: `/admin/souvenirs`, `/admin/souvenir-categories`, `/admin/sellers`
- **Tourist UI**: `/souvenirs`, destination page section `#souvenirs`
- **API**: `GET /api/souvenirs`, `GET /api/souvenirs/[slug]`, `GET /api/souvenirs/recommend`
- **Tests**: `tests/souvenirs.test.mjs`, `scripts/smoke-test.mjs` (93 checks, 14 for souvenirs)
