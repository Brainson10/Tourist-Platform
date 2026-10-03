import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { budgetBand, fromParam, AUDIENCES, toParam } from "@/lib/constants/souvenirs";
import { formatPriceRange } from "@/lib/utils/format";
import { budgetFit, rankSouvenirs } from "@/lib/utils/souvenir-rank";
import { sellerSchema, souvenirCategorySchema, souvenirQuerySchema, souvenirSchema } from "@/lib/validators/souvenir";
import { CATEGORIES, SELLERS, SOUVENIRS } from "../prisma/seed-souvenirs.js";

const item = (id, overrides = {}) => ({
  id,
  name: id,
  isFeatured: false,
  availability: "YEAR_ROUND",
  qualities: [],
  audiences: [],
  interests: [],
  priceMin: 500,
  priceMax: 900,
  destinations: [{ id: "loktak", name: "Loktak Lake", state: "Manipur" }],
  ...overrides,
});

describe("budget fit", () => {
  const band = budgetBand("500-1000");
  it("classifies prices against a band", () => {
    assert.equal(budgetFit({ priceMin: 600, priceMax: 900 }, band), "full");
    assert.equal(budgetFit({ priceMin: 800, priceMax: 1500 }, band), "partial");
    assert.equal(budgetFit({ priceMin: 1500, priceMax: 3000 }, band), "none");
    assert.equal(budgetFit({ priceMin: null, priceMax: null }, band), "unknown");
    assert.equal(budgetFit({ priceMin: 700, priceMax: null }, band), "full", "a single price counts as both ends");
    assert.equal(budgetFit({ priceMin: 5000, priceMax: 9000 }, budgetBand("2500-plus")), "full", "open-ended band");
    assert.equal(budgetFit({ priceMin: 100 }, null), null);
  });
});

describe("souvenir ranking", () => {
  const items = [
    item("regional", { destinations: [{ id: "shirui", name: "Shirui Hills", state: "Manipur" }] }),
    item("here"),
    item("elsewhere", { destinations: [{ id: "kaziranga", name: "Kaziranga", state: "Assam" }] }),
  ];

  it("puts this destination first, then the same state, and never other states", () => {
    const ranked = rankSouvenirs(items, { destinationId: "loktak", state: "Manipur" });
    assert.deepEqual(ranked.map((entry) => entry.item.id), ["here", "regional"]);
    assert.ok(ranked[0].reasons.includes("From Loktak Lake"));
    assert.ok(ranked[1].reasons.includes("Made in Manipur"));
  });

  it("includes every state when no place is chosen", () => {
    assert.equal(rankSouvenirs(items, {}).length, 3);
  });

  it("drops items outside the budget and rewards audience and interest matches", () => {
    const ranked = rankSouvenirs(
      [
        item("pricey", { priceMin: 4000, priceMax: 6000 }),
        item("family-food", { audiences: ["FAMILY"], interests: ["FOOD"] }),
        item("plain"),
      ],
      { state: "Manipur", band: budgetBand("500-1000"), audience: "FAMILY", interest: "FOOD" }
    );
    assert.deepEqual(ranked.map((entry) => entry.item.id), ["family-food", "plain"]);
    assert.ok(ranked[0].reasons.includes("Great for family"));
    assert.ok(ranked[0].reasons.includes("Fits ₹500–₹1,000"));
    assert.ok(ranked[0].reasons.includes("For food lovers"));
  });

  it("breaks ties by featured, then name, and respects the limit", () => {
    const ranked = rankSouvenirs([item("b"), item("a"), item("c", { isFeatured: true })], {}, { limit: 2 });
    assert.deepEqual(ranked.map((entry) => entry.item.id), ["c", "a"]);
  });

  it("caps the badge bonus", () => {
    const [plain] = rankSouvenirs([item("x")], {});
    const [badged] = rankSouvenirs([item("y", { qualities: ["TRADITIONAL", "HANDMADE", "REGIONAL_SPECIALTY", "ARTISAN_MADE"] })], {});
    assert.equal(badged.score - plain.score, 1.5);
  });
});

describe("price range wording", () => {
  it("always says prices are approximate", () => {
    assert.equal(formatPriceRange(800, 1500), "Approx. ₹800–₹1,500");
    assert.equal(formatPriceRange(500, 500), "Approx. ₹500");
    assert.equal(formatPriceRange(500, null), "From approx. ₹500");
    assert.equal(formatPriceRange(null, 1200), "Up to approx. ₹1,200");
    assert.equal(formatPriceRange(null, null), "Price varies");
  });
});

describe("souvenir validation", () => {
  const valid = {
    name: "Longpi pottery",
    slug: "longpi-pottery",
    shortDescription: "Black stone pottery.",
    description: "Hand-shaped without a wheel.",
    whySpecial: "A Tangkhul Naga craft.",
    whyTakeHome: "Durable and beautiful.",
    categoryId: "cat_1",
    destinationIds: ["dest_1"],
    priceMin: 500,
    priceMax: 3000,
    audiences: ["FAMILY"],
  };

  it("accepts a valid product and applies defaults", () => {
    const parsed = souvenirSchema.parse(valid);
    assert.equal(parsed.availability, "YEAR_ROUND");
    assert.equal(parsed.isPublished, true);
    assert.deepEqual(parsed.sellers, []);
  });

  it("rejects bad prices, missing destinations and unknown tags", () => {
    assert.equal(souvenirSchema.safeParse({ ...valid, priceMin: -5 }).success, false);
    assert.equal(souvenirSchema.safeParse({ ...valid, priceMin: 900, priceMax: 100 }).success, false);
    assert.equal(souvenirSchema.safeParse({ ...valid, destinationIds: [] }).success, false);
    assert.equal(souvenirSchema.safeParse({ ...valid, audiences: ["ALIENS"] }).success, false);
    assert.equal(souvenirSchema.safeParse({ ...valid, coverImage: "javascript:alert(1)" }).success, false);
    assert.equal(souvenirSchema.safeParse({ ...valid, slug: "recommend" }).success, false, "reserved slug");
    assert.equal(souvenirSchema.safeParse({ ...valid, name: "  " }).success, false);
  });

  it("allows an unknown price", () => {
    assert.equal(souvenirSchema.parse({ ...valid, priceMin: "", priceMax: null }).priceMin, null);
  });

  it("rejects duplicate sellers and bad seller data", () => {
    assert.equal(souvenirSchema.safeParse({ ...valid, sellers: [{ sellerId: "s1" }, { sellerId: "s1" }] }).success, false);
    assert.equal(sellerSchema.safeParse({ name: "Market", slug: "market", kind: "MARKET", latitude: 100, longitude: 0 }).success, false);
    assert.equal(sellerSchema.safeParse({ name: "Market", slug: "market", kind: "MARKET", latitude: 24, longitude: 93, website: "http://x.example" }).success, false);
  });

  it("maps readable URL params to enums and rejects unknown ones", () => {
    assert.equal(toParam("HOME_DECOR"), "home-decor");
    assert.equal(fromParam(AUDIENCES, "family"), "FAMILY");
    assert.equal(souvenirQuerySchema.parse({ for: "family" }).for, "FAMILY");
    assert.equal(souvenirQuerySchema.safeParse({ for: "aliens" }).success, false);
    assert.equal(souvenirQuerySchema.safeParse({ budget: "cheap" }).success, false);
  });
});

describe("starter souvenir data", () => {
  const fakeId = "c".padEnd(25, "a");

  it("passes the same validation as admin input", () => {
    for (const category of CATEGORIES) assert.ok(souvenirCategorySchema.safeParse(category).success, category.slug);
    for (const { village, ...seller } of SELLERS) assert.ok(sellerSchema.safeParse(seller).success, seller.slug);

    for (const { category, destinations, sellers, ...souvenir } of SOUVENIRS) {
      const result = souvenirSchema.safeParse({ ...souvenir, categoryId: fakeId, destinationIds: destinations.map(() => fakeId), sellers: sellers.map(() => ({ sellerId: fakeId })).slice(0, 1) });
      assert.ok(result.success, `${souvenir.slug}: ${JSON.stringify(result.error?.issues?.map((issue) => `${issue.path.join(".")} ${issue.message}`))}`);
      assert.ok(CATEGORIES.some((entry) => entry.slug === category), `${souvenir.slug} category`);
      for (const link of sellers) assert.ok(SELLERS.some((seller) => seller.slug === link.slug), `${souvenir.slug} seller ${link.slug}`);
    }
  });

  it("is flagged for verification and uses no stock photos", () => {
    for (const souvenir of SOUVENIRS) {
      assert.equal(souvenir.coverImage, undefined, souvenir.slug);
      assert.equal(souvenir.photos, undefined, souvenir.slug);
    }
    assert.equal(new Set(SOUVENIRS.map((souvenir) => souvenir.slug)).size, SOUVENIRS.length);
  });
});
