import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreCandidates } from "@/lib/services/recommendation.service";
import { buildStarterItinerary, tripPhase } from "@/lib/services/trip.service";
import { formatDateRange, formatPrice, tripLength } from "@/lib/utils/format";
import { distanceKm } from "@/lib/utils/geo";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

const card = (id, { state = "Assam", categories = [], ratingAverage = 0, reviewCount = 0, isFeatured = false } = {}) => ({
  id,
  name: id,
  village: { state },
  categories: categories.map((slug) => ({ slug, name: slug[0].toUpperCase() + slug.slice(1) })),
  ratingAverage,
  reviewCount,
  isFeatured,
});

describe("recommendations", () => {
  it("ranks shared interests above a shared state, and explains why", () => {
    const signals = [{ verb: "saved", name: "Kaziranga", state: "Assam", categorySlugs: ["wildlife"] }];
    const [first, second] = scoreCandidates([card("same-state", { state: "Assam" }), card("same-interest", { state: "Meghalaya", categories: ["wildlife"] })], signals);

    assert.equal(first.id, "same-interest");
    assert.match(first.reason, /Because you saved Kaziranga · Wildlife/);
    assert.match(second.reason, /Also in Assam/);
  });

  it("falls back to popularity without any signals", () => {
    const [top] = scoreCandidates([card("low", { ratingAverage: 3, reviewCount: 2 }), card("high", { ratingAverage: 4.8, reviewCount: 9 })], []);
    assert.equal(top.id, "high");
    assert.match(top.reason, /Rated 4.8/);
  });
});

describe("trips", () => {
  const destination = {
    id: "d1",
    name: "Loktak Lake",
    transportation: "Road from Imphal",
    experiences: [{ id: "e1", title: "Boat ride", duration: "2 hours" }],
    thingsToDo: ["Sendra viewpoint", "Keibul Lamjao", "Island homestay", "Fish market"],
  };

  it("builds a starter plan that starts with arrival and stays within the trip", () => {
    const items = buildStarterItinerary(destination, 2);
    assert.equal(items[0].title, "Arrive at Loktak Lake");
    assert.ok(items.every((item) => item.day >= 1 && item.day <= 2));
    assert.equal(items.find((item) => item.title === "Boat ride").experienceId, "e1");
  });

  it("keeps positions unique within each day", () => {
    const items = buildStarterItinerary(destination, 3);
    for (const day of [1, 2, 3]) {
      const positions = items.filter((item) => item.day === day).map((item) => item.position);
      assert.equal(new Set(positions).size, positions.length);
    }
  });

  it("classifies trips by date and status", () => {
    const now = new Date("2026-06-15T10:00:00Z");
    assert.equal(tripPhase({ status: "PLANNING", startDate: "2026-07-01", endDate: "2026-07-03" }, now), "upcoming");
    assert.equal(tripPhase({ status: "PLANNING", startDate: "2026-06-14", endDate: "2026-06-16" }, now), "ongoing");
    assert.equal(tripPhase({ status: "PLANNING", startDate: "2026-06-01", endDate: "2026-06-03" }, now), "past");
    assert.equal(tripPhase({ status: "CANCELLED", startDate: "2026-07-01", endDate: "2026-07-03" }, now), "cancelled");
  });
});

describe("formatting and helpers", () => {
  it("formats dates, prices and trip length", () => {
    assert.equal(formatDateRange(null, null), "Dates to be announced");
    assert.equal(formatPrice(0), "Free");
    assert.equal(formatPrice(null), null);
    assert.equal(tripLength("2026-10-01", "2026-10-03"), 3);
  });

  it("measures distance", () => {
    const km = distanceKm({ latitude: 24.817, longitude: 93.936 }, { latitude: 24.5, longitude: 93.8 });
    assert.ok(km > 30 && km < 40, `expected ~37 km, got ${km}`);
  });

  it("blocks open redirects", () => {
    assert.equal(safeRedirectPath("/trips/abc"), "/trips/abc");
    assert.equal(safeRedirectPath("//evil.example"), "/dashboard");
    assert.equal(safeRedirectPath("https://evil.example"), "/dashboard");
    assert.equal(safeRedirectPath("/\\evil.example"), "/dashboard");
    assert.equal(safeRedirectPath(undefined, "/"), "/");
  });
});
