import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginSchema, signupSchema } from "@/lib/auth/validators";
import { settingsSchema, userAdminSchema } from "@/lib/validators/admin";
import { optionalImageUrl, queryBoolean, stringList } from "@/lib/validators/common";
import { festivalSchema } from "@/lib/validators/content";
import { destinationQuerySchema, destinationSchema } from "@/lib/validators/destination";
import { reviewSchema } from "@/lib/validators/review";
import { createTripSchema, tripItemSchema } from "@/lib/validators/trip";

describe("auth validators", () => {
  it("accepts a valid signup and normalises the email", () => {
    const result = signupSchema.parse({ fullName: " Asha Devi ", email: " Asha@Example.COM ", password: "travel2026", confirmPassword: "travel2026" });
    assert.equal(result.email, "asha@example.com");
    assert.equal(result.fullName, "Asha Devi");
  });

  it("rejects mismatched or weak passwords", () => {
    assert.equal(signupSchema.safeParse({ fullName: "Asha", email: "a@b.co", password: "travel2026", confirmPassword: "travel2027" }).success, false);
    assert.equal(signupSchema.safeParse({ fullName: "Asha", email: "a@b.co", password: "short1", confirmPassword: "short1" }).success, false);
    assert.equal(signupSchema.safeParse({ fullName: "Asha", email: "a@b.co", password: "lettersonly", confirmPassword: "lettersonly" }).success, false);
  });

  it("requires an email and password to sign in", () => {
    assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success, false);
    assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "" }).success, false);
  });
});

describe("query booleans", () => {
  // Regression: z.coerce.boolean() used to turn the string "false" into true.
  it("parses 'false' as false", () => {
    assert.equal(queryBoolean.parse("false"), false);
    assert.equal(queryBoolean.parse("true"), true);
    assert.equal(destinationQuerySchema.parse({ featured: "false" }).featured, false);
  });
});

describe("shared field rules", () => {
  it("only accepts https image links", () => {
    assert.equal(optionalImageUrl.parse("https://images.unsplash.com/photo"), "https://images.unsplash.com/photo");
    assert.equal(optionalImageUrl.parse(""), null);
    assert.equal(optionalImageUrl.safeParse("http://insecure.example/x.jpg").success, false);
    assert.equal(optionalImageUrl.safeParse("javascript:alert(1)").success, false);
  });

  it("splits and de-duplicates list input", () => {
    assert.deepEqual(stringList().parse("Boating, Birding\nBoating\n  "), ["Boating", "Birding"]);
    assert.deepEqual(stringList().parse(undefined), []);
  });
});

describe("reviews", () => {
  it("accepts whole ratings from 1 to 5 only", () => {
    const base = { comment: "Beautiful at sunrise, go early." };
    assert.equal(reviewSchema.safeParse({ ...base, rating: 5 }).success, true);
    assert.equal(reviewSchema.safeParse({ ...base, rating: 0 }).success, false);
    assert.equal(reviewSchema.safeParse({ ...base, rating: 6 }).success, false);
    assert.equal(reviewSchema.safeParse({ ...base, rating: 3.5 }).success, false);
  });

  it("requires a meaningful comment", () => {
    assert.equal(reviewSchema.safeParse({ rating: 4, comment: "ok" }).success, false);
  });
});

describe("trips", () => {
  it("rejects an end date before the start date", () => {
    const result = createTripSchema.safeParse({ title: "Trip", startDate: "2026-12-10", endDate: "2026-12-01" });
    assert.equal(result.success, false);
    assert.equal(result.error.issues[0].path[0], "endDate");
  });

  it("caps trip length", () => {
    assert.equal(createTripSchema.safeParse({ title: "Long", startDate: "2026-01-01", endDate: "2026-12-31" }).success, false);
  });

  it("treats an empty destination as no destination", () => {
    assert.equal(createTripSchema.parse({ title: "Trip", destinationId: "", startDate: "2026-12-01", endDate: "2026-12-02" }).destinationId, null);
  });

  it("requires a day and a title for itinerary items", () => {
    assert.equal(tripItemSchema.safeParse({ day: 0, title: "Boat ride" }).success, false);
    assert.equal(tripItemSchema.safeParse({ day: 1, title: "  " }).success, false);
  });
});

describe("admin content", () => {
  const destination = {
    name: "Loktak Lake",
    slug: "loktak-lake",
    shortDescription: "Floating islands.",
    description: "A large freshwater lake.",
    villageId: "village_1",
    latitude: "24.55",
    longitude: "93.8",
  };

  it("accepts a minimal destination", () => {
    const result = destinationSchema.parse(destination);
    assert.equal(result.latitude, 24.55);
    assert.deepEqual(result.hotels, []);
  });

  it("rejects bad slugs and coordinates", () => {
    assert.equal(destinationSchema.safeParse({ ...destination, slug: "Loktak Lake!" }).success, false);
    assert.equal(destinationSchema.safeParse({ ...destination, latitude: 120 }).success, false);
  });

  it("requires every stay to have a name", () => {
    assert.equal(destinationSchema.safeParse({ ...destination, hotels: [{ type: "Hotel" }] }).success, false);
  });

  it("allows festivals without dates but not end-before-start", () => {
    const festival = { destinationId: "d1", title: "Sangai", slug: "sangai", description: "Culture festival" };
    assert.equal(festivalSchema.parse(festival).startDate, undefined);
    assert.equal(festivalSchema.safeParse({ ...festival, startDate: "2026-11-21", endDate: "2026-11-20" }).success, false);
  });

  it("does not accept unknown roles", () => {
    assert.equal(userAdminSchema.safeParse({ role: "GOVERNMENT" }).success, false);
    assert.equal(userAdminSchema.safeParse({}).success, false);
  });

  it("validates settings", () => {
    assert.equal(settingsSchema.safeParse({ supportEmail: "", emergencyNumber: "112", autoApproveReviews: false }).success, true);
    assert.equal(settingsSchema.safeParse({ supportEmail: "nope", emergencyNumber: "112", autoApproveReviews: false }).success, false);
  });
});
