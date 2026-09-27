import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateBudget } from "@/lib/utils/budget";
import { suggestPackingList } from "@/lib/utils/packing";

describe("packing suggestions", () => {
  it("always includes the basics", () => {
    const items = suggestPackingList({});
    assert.ok(items.some((item) => item.startsWith("Photo ID")));
  });

  it("adds rain gear for monsoon trips and warm layers for winter", () => {
    const monsoon = suggestPackingList({ startDate: "2026-07-10", endDate: "2026-07-12" });
    assert.ok(monsoon.includes("Rain jacket or umbrella"));
    assert.ok(!monsoon.includes("Warm layers and a jacket"));

    const winter = suggestPackingList({ startDate: "2026-12-20", endDate: "2026-12-24" });
    assert.ok(winter.includes("Warm layers and a jacket"));
    assert.ok(!winter.includes("Rain jacket or umbrella"));
  });

  it("covers trips that span seasons", () => {
    const items = suggestPackingList({ startDate: "2026-09-28", endDate: "2026-11-02" });
    assert.ok(items.includes("Rain jacket or umbrella"));
    assert.ok(items.includes("Warm layers and a jacket"));
  });

  it("adds items for interests and permits, without duplicates", () => {
    const items = suggestPackingList({ categories: ["wildlife", "nature"], permit: { required: true, permitName: "Inner Line Permit (ILP)" } });
    assert.ok(items.includes("Binoculars"));
    assert.equal(items.filter((item) => item === "Insect repellent").length, 1);
    assert.ok(items.includes("Inner Line Permit (ILP) — printed and digital copies"));
  });

  it("ignores unknown categories and permits that aren't required", () => {
    const items = suggestPackingList({ categories: ["mystery"], permit: { required: false } });
    assert.ok(!items.some((item) => item.includes("permit")));
  });
});

describe("budget estimate", () => {
  it("multiplies daily spend by days and travelers and adds experience prices", () => {
    const budget = estimateBudget({ days: 3, travelers: 2, dailyBudget: 2500, experiences: [{ price: 1200 }, { price: 600 }] });
    assert.equal(budget.dailyTotal, 15000);
    assert.equal(budget.experiencesTotal, 3600);
    assert.equal(budget.total, 18600);
    assert.equal(budget.perPerson, 9300);
  });

  it("counts experiences without a price instead of guessing, and treats free as zero", () => {
    const budget = estimateBudget({ days: 1, dailyBudget: 1000, experiences: [{ price: null }, { price: 0 }] });
    assert.equal(budget.unpricedExperiences, 1);
    assert.equal(budget.total, 1000);
  });

  it("guards against bad input", () => {
    const budget = estimateBudget({ days: 0, travelers: 0, dailyBudget: -5 });
    assert.equal(budget.days, 1);
    assert.equal(budget.travelers, 1);
    assert.equal(budget.total, 0);
  });
});
