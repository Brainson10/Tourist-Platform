import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMonthSpans, monthRange, parseBestMonths } from "@/lib/utils/months";

describe("parseBestMonths", () => {
  it("parses a range that wraps over the new year", () => {
    assert.deepEqual(parseBestMonths("November to April"), [1, 2, 3, 4, 11, 12]);
  });

  it("parses several ranges", () => {
    assert.deepEqual(parseBestMonths("March to June and September to October"), [3, 4, 5, 6, 9, 10]);
  });

  it("accepts short names and dashes", () => {
    assert.deepEqual(parseBestMonths("Oct–Mar"), [1, 2, 3, 10, 11, 12]);
    assert.deepEqual(parseBestMonths("Sept - Nov"), [9, 10, 11]);
  });

  it("handles single months, seasons and all-year text", () => {
    assert.deepEqual(parseBestMonths("Best in December"), [12]);
    assert.deepEqual(parseBestMonths("Winter"), [1, 2, 11, 12]);
    assert.equal(parseBestMonths("Year-round").length, 12);
  });

  it("ignores text with no months and does not match inside words", () => {
    assert.deepEqual(parseBestMonths("Depends on weather"), []);
    assert.deepEqual(parseBestMonths(null), []);
    assert.deepEqual(parseBestMonths("mayflower marching"), []);
  });
});

describe("month helpers", () => {
  it("builds wrapping ranges", () => {
    assert.deepEqual(monthRange(11, 2), [11, 12, 1, 2]);
    assert.deepEqual(monthRange(5, 5), [5]);
  });

  it("formats spans, including one that wraps", () => {
    assert.equal(formatMonthSpans([11, 12, 1, 2, 3, 4]), "Nov – Apr");
    assert.equal(formatMonthSpans([3, 4, 5, 6, 9, 10]), "Mar – Jun, Sep – Oct");
    assert.equal(formatMonthSpans([7]), "Jul");
    assert.equal(formatMonthSpans([]), "");
    assert.equal(formatMonthSpans([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), "All year");
  });
});
