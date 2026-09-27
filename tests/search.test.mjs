import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchScore, rankMatches } from "@/lib/utils/search-rank";

describe("matchScore", () => {
  it("prefers exact, then prefix, then word start, then contains", () => {
    assert.equal(matchScore("Loktak Lake", "loktak lake"), 4);
    assert.equal(matchScore("Loktak Lake", "lok"), 3);
    assert.equal(matchScore("Kaziranga National Park", "national"), 2);
    assert.equal(matchScore("Shillong", "llon"), 1);
    assert.equal(matchScore("Shillong", "tawang"), 0);
  });

  it("requires every word of the query", () => {
    assert.ok(matchScore("Kaziranga National Park", "park kazi") > 0);
    assert.equal(matchScore("Kaziranga National Park", "park tawang"), 0);
  });

  it("ignores case and accents, and treats regex characters literally", () => {
    assert.equal(matchScore("Ziro Valley", "ZIRO"), 3);
    assert.equal(matchScore("Café Trail", "cafe"), 3);
    assert.equal(matchScore("Loktak (Manipur)", "(manipur"), 2);
  });
});

describe("rankMatches", () => {
  const places = [
    { name: "Shillong", state: "Meghalaya", rating: 4.1 },
    { name: "Loktak Lake", state: "Manipur", rating: 4.8 },
    { name: "Dzukou Valley", state: "Nagaland", rating: 4.6 },
    { name: "Shirui Hills", state: "Manipur", rating: 4.2 },
  ];
  const options = { fields: [(item) => item.name, (item) => item.state], popularity: (item) => item.rating };

  it("puts name matches before location matches", () => {
    const results = rankMatches(places, "shi", options);
    assert.deepEqual(results.map((item) => item.name), ["Shirui Hills", "Shillong"]);
  });

  it("finds places by state and orders ties by rating", () => {
    assert.deepEqual(rankMatches(places, "manipur", options).map((item) => item.name), ["Loktak Lake", "Shirui Hills"]);
  });

  it("respects the limit and drops non-matches", () => {
    assert.equal(rankMatches(places, "a", { ...options, limit: 2 }).length, 2);
    assert.equal(rankMatches(places, "zzz", options).length, 0);
  });
});

describe("surprise pick", async () => {
  const { pickSurprise } = await import("@/lib/services/search.service");
  const repository = await import("@/lib/repositories/search.repository");

  it("is exported for the /destinations/surprise route", () => {
    assert.equal(typeof pickSurprise, "function");
    assert.equal(typeof repository.listSurpriseCandidates, "function");
  });
});
