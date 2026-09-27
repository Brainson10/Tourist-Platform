#!/usr/bin/env node
/**
 * End-to-end smoke test against a running server.
 *
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/smoke-test.mjs
 *
 * It creates (and cleans up) its own content and a throwaway tourist account.
 * It writes data, so point it at a development or test database only.
 */
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@tourism-platform.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@123";
const RUN = Date.now().toString(36);
// 1×1 transparent PNG.
const PNG = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"));

let passed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`  ✗ ${name}\n      ${error.message.split("\n").join("\n      ")}`);
  }
}

class Session {
  constructor(label) {
    this.label = label;
    this.cookies = new Map();
  }

  cookieHeader() {
    return [...this.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  }

  store(response) {
    for (const header of response.headers.getSetCookie?.() ?? []) {
      const [pair, ...attributes] = header.split(";");
      const index = pair.indexOf("=");
      const name = pair.slice(0, index).trim();
      const value = pair.slice(index + 1).trim();
      const expired = attributes.some((attribute) => /max-age=0/i.test(attribute)) || value === "";
      if (expired) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }

  async request(path, { method = "GET", body, redirect = "manual" } = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      redirect,
      headers: {
        Origin: BASE_URL,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(this.cookies.size ? { Cookie: this.cookieHeader() } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    this.store(response);
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      // HTML page
    }
    return { status: response.status, json, text, location: response.headers.get("location") };
  }

  async upload(folder, bytes, filename = "photo.png", type = "image/png") {
    const form = new FormData();
    form.append("folder", folder);
    form.append("file", new Blob([bytes], { type }), filename);
    const response = await fetch(`${BASE_URL}/api/uploads`, {
      method: "POST",
      headers: { Origin: BASE_URL, ...(this.cookies.size ? { Cookie: this.cookieHeader() } : {}) },
      body: form,
    });
    this.store(response);
    return { status: response.status, json: await response.json().catch(() => null) };
  }

  async signUp(fullName, email, password) {
    return this.request("/api/auth/sign-up/email", { method: "POST", body: { name: fullName, email, password } });
  }

  async signIn(email, password) {
    return this.request("/api/auth/sign-in/email", { method: "POST", body: { email, password } });
  }
}

const anonymous = new Session("anonymous");
const tourist = new Session("tourist");
const admin = new Session("admin");
const touristEmail = `smoke-${RUN}@example.test`;
const created = {};

console.log(`Smoke testing ${BASE_URL}\n`);

console.log("Public pages");
for (const path of ["/", "/destinations", "/destinations?q=lake&sort=rating", "/destinations?featured=false&page=99", "/experiences", "/festivals", "/festivals?when=past", "/stories", "/about", "/contact", "/login", "/signup"]) {
  await check(`GET ${path} renders`, async () => {
    const response = await anonymous.request(path);
    assert.equal(response.status, 200);
    assert.doesNotMatch(response.text, /Unhandled Runtime Error|Application error/);
  });
}
await check("unknown destination returns 404", async () => {
  assert.equal((await anonymous.request("/destinations/does-not-exist")).status, 404);
});
await check("unknown page returns 404", async () => {
  assert.equal((await anonymous.request("/nope-not-here")).status, 404);
});

console.log("\nPublic API");
let destination;
await check("GET /api/destinations lists destinations with pagination meta", async () => {
  const response = await anonymous.request("/api/destinations?limit=2");
  assert.equal(response.status, 200);
  assert.ok(response.json.data.length > 0, "expected seeded destinations");
  assert.ok(response.json.meta.total >= response.json.data.length);
  destination = response.json.data[0];
  assert.ok(destination.village?.state, "destination location comes from its village");
});
await check("search matches by state", async () => {
  const response = await anonymous.request(`/api/destinations?search=${encodeURIComponent(destination.village.state)}`);
  assert.ok(response.json.data.some((item) => item.id === destination.id));
});
await check("invalid query parameters return 422", async () => {
  assert.equal((await anonymous.request("/api/destinations?limit=5000")).status, 422);
  assert.equal((await anonymous.request("/api/destinations?sort=bogus")).status, 422);
});
await check("destination detail page renders with reviews, map and planning info", async () => {
  const response = await anonymous.request(`/destinations/${destination.slug}`);
  assert.equal(response.status, 200);
  assert.match(response.text, /Traveler reviews/);
  assert.match(response.text, /Nearby &amp; map/);
  assert.match(response.text, /When to go/);
});
await check("nearby places endpoint validates the type", async () => {
  assert.equal((await anonymous.request(`/api/destinations/${destination.id}/nearby-places?type=casino`)).status, 422);
  const response = await anonymous.request(`/api/destinations/${destination.id}/nearby-places?type=hospital`);
  assert.equal(response.status, 200);
  assert.equal(typeof response.json.data.available, "boolean");
});
await check("public content endpoints are read-only", async () => {
  for (const path of ["/api/experiences", "/api/festivals", "/api/stories", "/api/destinations"]) {
    const response = await anonymous.request(path, { method: "POST", body: { title: "x" } });
    assert.equal(response.status, 405, `${path} should not accept POST`);
  }
});

console.log("\nAuthorization boundaries (signed out)");
for (const path of ["/dashboard", "/trips", "/trips/new", "/saved", "/profile", "/admin", "/admin/users"]) {
  await check(`${path} redirects to login`, async () => {
    const response = await anonymous.request(path);
    assert.ok([302, 307, 308].includes(response.status), `status ${response.status}`);
    assert.match(response.location, /\/login\?redirectTo=/);
  });
}
await check("tourist APIs require sign-in", async () => {
  assert.equal((await anonymous.request("/api/trips")).status, 401);
  assert.equal((await anonymous.request(`/api/destinations/${destination.id}/save`, { method: "PUT" })).status, 401);
  assert.equal((await anonymous.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: { rating: 5, comment: "Lovely place to visit" } })).status, 401);
});
await check("admin APIs require sign-in", async () => {
  assert.equal((await anonymous.request("/api/admin/users")).status, 401);
  assert.equal((await anonymous.request("/api/admin/stats")).status, 401);
});

console.log("\nSign up and sign in");
await check("weak signup is rejected by Better Auth", async () => {
  const response = await new Session("weak").signUp("Weak", `weak-${RUN}@example.test`, "short");
  assert.ok(response.status >= 400);
});
await check("tourist can sign up and is signed in", async () => {
  const response = await tourist.signUp("Smoke Tourist", touristEmail, "travel2026");
  assert.equal(response.status, 200, response.text);
  assert.equal(response.json.user.role, "TOURIST");
  const session = await tourist.request("/api/auth/get-session");
  assert.equal(session.json.user.email, touristEmail);
});
await check("clients cannot choose their own role at signup", async () => {
  const sneaky = new Session("sneaky");
  const response = await sneaky.request("/api/auth/sign-up/email", {
    method: "POST",
    body: { name: "Sneaky", email: `sneaky-${RUN}@example.test`, password: "travel2026", role: "ADMIN", isBlocked: false },
  });
  assert.ok(response.status >= 400 || response.json?.user?.role === "TOURIST", `role escalated: ${response.text}`);
  created.sneakyEmail = `sneaky-${RUN}@example.test`;
});
await check("duplicate email is rejected", async () => {
  const response = await new Session("dup").signUp("Dup", touristEmail, "travel2026");
  assert.ok(response.status >= 400);
});
await check("wrong password is rejected", async () => {
  const response = await new Session("wrong").signIn(touristEmail, "not-the-password");
  assert.equal(response.status, 401);
});
await check("admin can sign in", async () => {
  const response = await admin.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
  assert.equal(response.status, 200, response.text);
  assert.equal(response.json.user.role, "ADMIN");
});

console.log("\nAuthorization boundaries (tourist)");
await check("tourist sees a 403 screen on /admin", async () => {
  const response = await tourist.request("/admin");
  assert.equal(response.status, 200);
  assert.match(response.text, /You don(&#x27;|')t have access to this area/);
});
await check("tourist cannot open admin sub-pages", async () => {
  const response = await tourist.request("/admin/users");
  assert.match(response.text, /You don(&#x27;|')t have access to this area/);
  assert.doesNotMatch(response.text, new RegExp(ADMIN_EMAIL.replace(/[.@]/g, "\\$&")), "admin data must not be rendered");
});
await check("tourist cannot call admin APIs", async () => {
  assert.equal((await tourist.request("/api/admin/users")).status, 403);
  assert.equal((await tourist.request("/api/admin/categories", { method: "POST", body: { name: "Hack", slug: "hack" } })).status, 403);
  assert.equal((await tourist.request(`/api/admin/destinations/${destination.id}`, { method: "DELETE" })).status, 403);
  assert.equal((await tourist.request("/api/admin/settings", { method: "PUT", body: {} })).status, 403);
});
await check("tourist cannot promote themselves through Better Auth", async () => {
  await tourist.request("/api/auth/update-user", { method: "POST", body: { role: "ADMIN", isBlocked: false } });
  const session = await tourist.request("/api/auth/get-session");
  assert.equal(session.json.user.role, "TOURIST");
});

console.log("\nTourist flows");
await check("account pages render", async () => {
  for (const path of ["/dashboard", "/trips", "/trips/new", "/saved", "/profile"]) {
    const response = await tourist.request(path);
    assert.equal(response.status, 200, `${path} → ${response.status}`);
  }
});
await check("save and unsave a destination", async () => {
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/save`, { method: "PUT" })).status, 200);
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/save`, { method: "PUT" })).status, 200, "saving twice is idempotent");
  assert.match((await tourist.request("/saved")).text, new RegExp(destination.name));
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/save`, { method: "DELETE" })).status, 200);
  assert.equal((await tourist.request("/api/destinations/nope/save", { method: "PUT" })).status, 404);
  await tourist.request(`/api/destinations/${destination.id}/save`, { method: "PUT" });
});
await check("uploads: auth, folder permissions, type and size checks", async () => {
  assert.equal((await anonymous.upload("reviews", PNG)).status, 401);
  assert.equal((await tourist.upload("destinations", PNG)).status, 403, "content folders are admin-only");
  assert.equal((await tourist.upload("secrets", PNG)).status, 400, "unknown folder");
  const fake = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>");
  assert.equal((await tourist.upload("reviews", fake, "evil.png")).status, 415, "renamed SVG is rejected by content");
  const huge = new Uint8Array(9 * 1024 * 1024);
  huge.set(PNG);
  assert.equal((await tourist.upload("reviews", huge)).status, 413, "too large");
  const ok = await tourist.upload("reviews", PNG, "../../etc/passwd.png");
  assert.equal(ok.status, 201, JSON.stringify(ok.json));
  assert.match(ok.json.data.url, /^(\/uploads\/reviews\/[a-f0-9]+\.png|https:\/\/res\.cloudinary\.com\/)/, "server picks the name");
  created.reviewPhoto = ok.json.data.url;
  if (created.reviewPhoto.startsWith("/uploads/")) assert.equal((await anonymous.request(created.reviewPhoto)).status, 200, "uploaded file is served");
});
await check("invalid reviews are rejected", async () => {
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: { rating: 9, comment: "Great!!!!!!!" } })).status, 422);
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: { rating: 4, comment: "short" } })).status, 422);
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: "not json" })).status, 400);
});
await check("review is created as pending and is one per traveler", async () => {
  const first = await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: { rating: 4, title: "Worth it", comment: "Go early in the morning for the best light." } });
  assert.equal(first.status, 201, first.text);
  assert.equal(first.json.data.status, "PENDING");
  const second = await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: { rating: 5, comment: "Updated: even better the second time." } });
  assert.equal(second.json.data.id, first.json.data.id, "editing updates the same review");
  created.reviewId = first.json.data.id;
  const publicList = await anonymous.request(`/api/destinations/${destination.id}/reviews`);
  assert.ok(!publicList.json.data.reviews.some((review) => review.id === created.reviewId), "pending reviews are not public");
});
await check("review photos are saved with the review and validated", async () => {
  const withPhoto = await tourist.request(`/api/destinations/${destination.id}/reviews`, {
    method: "POST",
    body: { rating: 5, comment: "Updated: even better the second time.", photos: [created.reviewPhoto] },
  });
  assert.equal(withPhoto.status, 201, withPhoto.text);
  const mine = (await tourist.request(`/api/destinations/${destination.id}/reviews`)).json.data.userReview;
  assert.deepEqual(mine.photos, [created.reviewPhoto]);
  const bad = await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: { rating: 5, comment: "Lovely place to visit indeed", photos: ["javascript:alert(1)"] } });
  assert.equal(bad.status, 422);
  const tooMany = await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "POST", body: { rating: 5, comment: "Lovely place to visit indeed", photos: Array(5).fill(created.reviewPhoto) } });
  assert.equal(tooMany.status, 422);
});
await check("create a trip with a suggested itinerary", async () => {
  const response = await tourist.request("/api/trips", {
    method: "POST",
    body: { title: `Smoke trip ${RUN}`, destinationId: destination.id, startDate: "2027-03-01", endDate: "2027-03-03", suggestItinerary: true },
  });
  assert.equal(response.status, 201, response.text);
  created.tripId = response.json.data.id;
  const trip = await tourist.request(`/api/trips/${created.tripId}`);
  assert.equal(trip.json.data.itinerary.length, 3);
  assert.ok(trip.json.data.itinerary[0].items.length > 0, "day 1 should have the arrival");
});
await check("trip validation", async () => {
  assert.equal((await tourist.request("/api/trips", { method: "POST", body: { title: "Bad", startDate: "2027-03-05", endDate: "2027-03-01" } })).status, 422);
  assert.equal((await tourist.request("/api/trips", { method: "POST", body: { title: "Ghost", destinationId: "missing", startDate: "2027-03-01", endDate: "2027-03-02" } })).status, 404);
});
await check("add, edit, reorder and remove itinerary items", async () => {
  const add = await tourist.request(`/api/trips/${created.tripId}/items`, { method: "POST", body: { day: 2, title: "Sunset walk", time: "5 PM" } });
  assert.equal(add.status, 201, add.text);
  const itemId = add.json.data.id;
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items`, { method: "POST", body: { day: 9, title: "Out of range" } })).status, 400);
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/${itemId}`, { method: "PATCH", body: { day: 3, title: "Sunset walk by the lake" } })).status, 200);
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/${itemId}/move`, { method: "POST", body: { direction: "up" } })).status, 200);
  const trip = await tourist.request(`/api/trips/${created.tripId}`);
  const day3 = trip.json.data.itinerary[2].items.map((item) => item.id);
  assert.ok(day3.includes(itemId));
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/${itemId}`, { method: "DELETE" })).status, 200);
});
await check("shortening a trip drops items on removed days", async () => {
  await tourist.request(`/api/trips/${created.tripId}/items`, { method: "POST", body: { day: 3, title: "Last day plan" } });
  const response = await tourist.request(`/api/trips/${created.tripId}`, { method: "PATCH", body: { title: `Smoke trip ${RUN}`, destinationId: destination.id, startDate: "2027-03-01", endDate: "2027-03-02", status: "PLANNING" } });
  assert.equal(response.status, 200, response.text);
  const trip = await tourist.request(`/api/trips/${created.tripId}`);
  assert.equal(trip.json.data.itinerary.length, 2);
});
await check("drag-and-drop order is saved, and tampered orders are rejected", async () => {
  const trip = (await tourist.request(`/api/trips/${created.tripId}`)).json.data;
  const allIds = trip.itinerary.flatMap((day) => day.items.map((item) => item.id));
  assert.ok(allIds.length >= 2, "need at least two items to reorder");
  // Move everything onto day 2, reversed.
  const days = trip.itinerary.map((day) => ({ day: day.day, itemIds: day.day === 2 ? [...allIds].reverse() : [] }));
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/order`, { method: "PUT", body: { days } })).status, 200);
  const after = (await tourist.request(`/api/trips/${created.tripId}`)).json.data;
  assert.deepEqual(after.itinerary[1].items.map((item) => item.id), [...allIds].reverse());
  assert.equal(after.itinerary[0].items.length, 0);

  const missing = trip.itinerary.map((day) => ({ day: day.day, itemIds: day.day === 1 ? allIds.slice(1) : [] }));
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/order`, { method: "PUT", body: { days: missing } })).status, 400, "dropping an item");
  const foreign = [{ day: 1, itemIds: [...allIds, "not-in-this-trip"] }];
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/order`, { method: "PUT", body: { days: foreign } })).status, 400, "foreign id");
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/order`, { method: "PUT", body: { days: [{ day: 30, itemIds: allIds }] } })).status, 400, "day beyond this trip");
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/items/order`, { method: "PUT", body: { days: [{ day: 99, itemIds: allIds }] } })).status, 422, "day beyond any trip");
  assert.equal((await admin.request(`/api/trips/${created.tripId}/items/order`, { method: "PUT", body: { days } })).status, 404, "someone else's trip");
});
await check("packing checklist: suggestions, add, tick, remove", async () => {
  const suggest = await tourist.request(`/api/trips/${created.tripId}/checklist/suggest`, { method: "POST" });
  assert.equal(suggest.status, 200, suggest.text);
  assert.ok(suggest.json.data.added >= 5, "base suggestions");
  const again = await tourist.request(`/api/trips/${created.tripId}/checklist/suggest`, { method: "POST" });
  assert.equal(again.json.data.added, 0, "no duplicates on a second suggest");
  const added = await tourist.request(`/api/trips/${created.tripId}/checklist`, { method: "POST", body: { label: "Smoke test snacks" } });
  assert.equal(added.status, 201, added.text);
  const item = added.json.data.find((entry) => entry.label === "Smoke test snacks");
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/checklist/${item.id}`, { method: "PATCH", body: { done: true } })).json.data.done, true);
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/checklist`, { method: "POST", body: { label: "" } })).status, 422);
  assert.equal((await admin.request(`/api/trips/${created.tripId}/checklist/${item.id}`, { method: "DELETE" })).status, 404, "other users can't touch it");
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/checklist/${item.id}`, { method: "DELETE" })).status, 200);
});
await check("budget estimate uses travelers and daily spend", async () => {
  const trip = (await tourist.request(`/api/trips/${created.tripId}`)).json.data;
  const update = await tourist.request(`/api/trips/${created.tripId}`, {
    method: "PATCH",
    body: { title: trip.title, destinationId: trip.destinationId, startDate: "2027-03-01", endDate: "2027-03-02", status: "PLANNING", travelers: 2, dailyBudget: 3000, notes: "Private note: door code 1234" },
  });
  assert.equal(update.status, 200, update.text);
  const budget = (await tourist.request(`/api/trips/${created.tripId}`)).json.data.budget;
  assert.equal(budget.dailyTotal, 3000 * 2 * 2);
  assert.equal(budget.travelers, 2);
  assert.equal((await tourist.request(`/api/trips/${created.tripId}`, { method: "PATCH", body: { title: "x", startDate: "2027-03-01", endDate: "2027-03-02", travelers: 0 } })).status, 422);
});
await check("share link: public view hides private details; new link kills the old one", async () => {
  const enabled = await tourist.request(`/api/trips/${created.tripId}/share`, { method: "POST", body: {} });
  assert.equal(enabled.status, 200, enabled.text);
  const firstPath = enabled.json.data.sharePath;
  const page = await anonymous.request(firstPath);
  assert.equal(page.status, 200);
  assert.match(page.text, /shared a trip with you/);
  assert.doesNotMatch(page.text, /door code 1234/, "notes must stay private");
  assert.doesNotMatch(page.text, new RegExp(touristEmail), "owner email must stay private");
  assert.match(page.text, /noindex/);

  const regenerated = await tourist.request(`/api/trips/${created.tripId}/share`, { method: "POST", body: { regenerate: true } });
  assert.notEqual(regenerated.json.data.sharePath, firstPath);
  assert.equal((await anonymous.request(firstPath)).status, 404, "old link stops working");
  assert.equal((await anonymous.request(regenerated.json.data.sharePath)).status, 200);

  assert.equal((await admin.request(`/api/trips/${created.tripId}/share`, { method: "POST", body: {} })).status, 404, "only the owner can share");
  assert.equal((await tourist.request(`/api/trips/${created.tripId}/share`, { method: "DELETE" })).status, 200);
  assert.equal((await anonymous.request(regenerated.json.data.sharePath)).status, 404, "disabled link stops working");
  assert.equal((await anonymous.request("/t/definitely-not-a-real-token")).status, 404);
});
await check("trip detail page renders", async () => {
  const response = await tourist.request(`/trips/${created.tripId}`);
  assert.equal(response.status, 200);
  assert.match(response.text, /Itinerary/);
});
await check("other travelers cannot see or change the trip", async () => {
  assert.equal((await admin.request(`/api/trips/${created.tripId}`)).status, 404);
  assert.equal((await admin.request(`/api/trips/${created.tripId}`, { method: "DELETE" })).status, 404);
  assert.equal((await admin.request(`/trips/${created.tripId}`)).status, 404);
});

console.log("\nLocal guides");
const traveler2 = new Session("traveler2");
const traveler2Email = `smoke2-${RUN}@example.test`;
const GUIDE_PHONE = "+91 98765 00000";
const isoDay = (offset) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
await check("a traveler applies to be a guide and waits for review", async () => {
  const tooShort = await tourist.request("/api/guide/profile", { method: "PUT", body: { headline: "Guide", bio: "Short", languages: "English", areaIds: [destination.id] } });
  assert.equal(tooShort.status, 422);
  assert.equal((await tourist.request("/api/guide/profile", { method: "PUT", body: { headline: "Guide", bio: "x".repeat(60), languages: "English", areaIds: [] } })).status, 422, "needs an area");
  const applied = await tourist.request("/api/guide/profile", {
    method: "PUT",
    body: { headline: `Smoke guide ${RUN}`, bio: "I grew up here and love showing people the lakes and the markets at dawn.", languages: "English, Hindi", yearsExperience: 4, phone: GUIDE_PHONE, areaIds: [destination.id] },
  });
  assert.equal(applied.status, 200, applied.text);
  assert.equal(applied.json.data.status, "PENDING");
  created.guideId = applied.json.data.id;
  assert.ok(!(await anonymous.request("/api/guides?limit=100")).json.data.some((guide) => guide.id === created.guideId), "pending guides are hidden");
  assert.equal((await anonymous.request(`/guides/${created.guideId}`)).status, 404);
  assert.equal((await tourist.request("/api/auth/get-session")).json.user.role, "TOURIST");
  assert.equal((await tourist.request("/guide")).status, 200, "guide dashboard renders");
});
await check("admin approves: the guide is listed, role becomes GUIDE, phone stays private", async () => {
  assert.equal((await tourist.request(`/api/admin/guides/${created.guideId}`, { method: "PATCH", body: { status: "APPROVED" } })).status, 403);
  assert.equal((await admin.request(`/api/admin/guides/${created.guideId}`, { method: "PATCH", body: { status: "APPROVED" } })).status, 200);
  assert.equal((await tourist.request("/api/auth/get-session")).json.user.role, "GUIDE");
  const listed = (await anonymous.request(`/api/guides?destination=${destination.slug}`)).json.data;
  assert.ok(listed.some((guide) => guide.id === created.guideId));
  const profile = await anonymous.request(`/api/guides/${created.guideId}`);
  assert.equal(profile.status, 200);
  assert.doesNotMatch(profile.text, /98765/, "phone is not public");
  const page = await anonymous.request(`/guides/${created.guideId}`);
  assert.equal(page.status, 200);
  assert.doesNotMatch(page.text, /98765/);
  assert.doesNotMatch(page.text, new RegExp(touristEmail));
  assert.match((await anonymous.request(`/destinations/${destination.slug}`)).text, new RegExp(`Smoke guide ${RUN}`), "shown on the destination page");
});
await check("requests: validation, self-requests and spam are blocked", async () => {
  assert.equal((await traveler2.signUp("Second Traveler", traveler2Email, "travel2026")).status, 200);
  const body = { startDate: isoDay(20), endDate: isoDay(22), groupSize: 3, destinationId: destination.id, message: "We'd love a sunrise walk and help finding a homestay." };
  assert.equal((await anonymous.request(`/api/guides/${created.guideId}/requests`, { method: "POST", body })).status, 401);
  assert.equal((await tourist.request(`/api/guides/${created.guideId}/requests`, { method: "POST", body })).status, 400, "guides can't request themselves");
  assert.equal((await traveler2.request(`/api/guides/${created.guideId}/requests`, { method: "POST", body: { ...body, startDate: isoDay(-5) } })).status, 422, "past dates");
  const first = await traveler2.request(`/api/guides/${created.guideId}/requests`, { method: "POST", body });
  assert.equal(first.status, 201, first.text);
  created.guideRequestId = first.json.data.id;
  await traveler2.request(`/api/guides/${created.guideId}/requests`, { method: "POST", body });
  await traveler2.request(`/api/guides/${created.guideId}/requests`, { method: "POST", body });
  assert.equal((await traveler2.request(`/api/guides/${created.guideId}/requests`, { method: "POST", body })).status, 429, "max 3 open requests");
});
await check("contact details are shared only after the guide accepts", async () => {
  assert.doesNotMatch((await tourist.request("/guide")).text, new RegExp(traveler2Email), "guide can't see traveler email yet");
  assert.doesNotMatch((await traveler2.request("/dashboard")).text, /98765/, "traveler can't see guide phone yet");
  assert.equal((await admin.request(`/api/guide-requests/${created.guideRequestId}`, { method: "PATCH", body: { status: "ACCEPTED" } })).status, 404, "strangers get 404");
  assert.equal((await traveler2.request(`/api/guide-requests/${created.guideRequestId}`, { method: "PATCH", body: { status: "ACCEPTED" } })).status, 403, "travelers can't accept");
  assert.equal((await tourist.request(`/api/guide-requests/${created.guideRequestId}`, { method: "PATCH", body: { status: "ACCEPTED" } })).status, 200);
  assert.equal((await tourist.request(`/api/guide-requests/${created.guideRequestId}`, { method: "PATCH", body: { status: "DECLINED" } })).status, 400, "already answered");
  assert.match((await tourist.request("/guide")).text, new RegExp(traveler2Email), "guide now sees the traveler's email");
  assert.match((await traveler2.request("/dashboard")).text, /98765/, "traveler now sees the guide's phone");
  assert.equal((await traveler2.request(`/api/guide-requests/${created.guideRequestId}`, { method: "PATCH", body: { status: "CANCELLED" } })).status, 200);
});
await check("unlisting a guide hides them and reverts the role", async () => {
  assert.equal((await admin.request(`/api/admin/guides/${created.guideId}`, { method: "PATCH", body: { status: "REJECTED" } })).status, 200);
  assert.equal((await tourist.request("/api/auth/get-session")).json.user.role, "TOURIST");
  assert.equal((await anonymous.request(`/guides/${created.guideId}`)).status, 404);
  assert.equal((await admin.request(`/api/admin/guides/${created.guideId}`, { method: "DELETE" })).status, 200);
  assert.equal((await admin.request("/admin/guides")).status, 200);
});

console.log("\nAdmin flows");
await check("admin pages render", async () => {
  for (const path of ["/admin", "/admin/destinations", "/admin/destinations/new", `/admin/destinations/${destination.id}`, "/admin/villages", "/admin/categories", "/admin/experiences", "/admin/festivals", "/admin/stories", "/admin/reviews", "/admin/users", "/admin/settings"]) {
    const response = await admin.request(path);
    assert.equal(response.status, 200, `${path} → ${response.status}`);
  }
});
await check("stats endpoint", async () => {
  const response = await admin.request("/api/admin/stats");
  assert.equal(response.status, 200);
  assert.ok(response.json.data.counts.pendingReviews >= 1);
});
await check("admin user list never exposes secrets", async () => {
  const response = await admin.request("/api/admin/users?limit=50");
  assert.equal(response.status, 200);
  assert.doesNotMatch(response.text, /password|passwordHash|token/i);
});
await check("village CRUD", async () => {
  const create = await admin.request("/api/admin/villages", { method: "POST", body: { name: `Smoke Village ${RUN}`, district: "Test District", state: "Test State", latitude: 25.1, longitude: 91.9 } });
  assert.equal(create.status, 201, create.text);
  created.villageId = create.json.data.id;
  assert.equal((await admin.request("/api/admin/villages", { method: "POST", body: { name: "", district: "x", state: "y", latitude: 200, longitude: 0 } })).status, 422);
  assert.equal((await admin.request(`/api/admin/villages/${created.villageId}`, { method: "PUT", body: { name: `Smoke Village ${RUN}`, district: "Test District", state: "Test State", latitude: 25.2, longitude: 91.9 } })).status, 200);
});
await check("category CRUD", async () => {
  const create = await admin.request("/api/admin/categories", { method: "POST", body: { name: `Smoke ${RUN}`, slug: `smoke-${RUN}` } });
  assert.equal(create.status, 201, create.text);
  created.categoryId = create.json.data.id;
  assert.equal((await admin.request("/api/admin/categories", { method: "POST", body: { name: `Smoke ${RUN}`, slug: `smoke-${RUN}` } })).status, 409, "duplicate slug");
});
await check("destination CRUD derives location from the village", async () => {
  const body = {
    name: `Smoke Falls ${RUN}`,
    slug: `smoke-falls-${RUN}`,
    shortDescription: "A test waterfall.",
    description: "A test waterfall used by the smoke test.",
    villageId: created.villageId,
    latitude: 25.2,
    longitude: 91.9,
    categoryIds: [created.categoryId],
    photos: [{ url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9", caption: "The main falls" }],
    thingsToDo: ["Swim", "Picnic"],
    hotels: [{ name: "Test Lodge", type: "Lodge" }],
    emergencyContacts: [{ label: "Police", value: "100" }],
  };
  const create = await admin.request("/api/admin/destinations", { method: "POST", body });
  assert.equal(create.status, 201, create.text);
  created.destinationId = create.json.data.id;
  const detail = await anonymous.request(`/api/destinations/${body.slug}`);
  assert.equal(detail.json.data.village.district, "Test District");
  assert.equal(detail.json.data.categories[0].id, created.categoryId);
  assert.equal(detail.json.data.gallery.find((photo) => photo.caption)?.caption, "The main falls", "captions are stored");
  const adminUpload = await admin.upload("destinations", PNG);
  assert.equal(adminUpload.status, 201, "admins can upload content photos");
  assert.equal((await admin.request("/api/admin/destinations", { method: "POST", body })).status, 409, "duplicate slug");
  assert.equal((await admin.request("/api/admin/destinations", { method: "POST", body: { ...body, slug: `x-${RUN}`, villageId: "missing" } })).status, 400);
  assert.equal((await admin.request(`/api/admin/destinations/${created.destinationId}`, { method: "PUT", body: { ...body, name: `Smoke Falls Updated ${RUN}`, isFeatured: true } })).status, 200);
  assert.equal((await anonymous.request(`/destinations/${body.slug}`)).status, 200);
});
await check("permit rules appear on destinations in that state", async () => {
  const permit = await admin.request("/api/admin/permits", {
    method: "POST",
    body: { state: "Test State", required: true, permitName: `Smoke Permit ${RUN}`, whoNeedsIt: "Everyone from outside the state.", applyUrl: "https://example.gov/permit", lastVerifiedAt: "" },
  });
  assert.equal(permit.status, 201, permit.text);
  created.permitId = permit.json.data.id;
  assert.equal((await admin.request("/api/admin/permits", { method: "POST", body: { state: "Test State", required: false } })).status, 409, "one rule per state");
  assert.equal((await admin.request("/api/admin/permits", { method: "POST", body: { state: "Other", required: true, applyUrl: "javascript:alert(1)" } })).status, 422);
  assert.equal((await tourist.request("/api/admin/permits")).status, 403);
  const page = await anonymous.request(`/destinations/smoke-falls-${RUN}`);
  assert.match(page.text, new RegExp(`Smoke Permit ${RUN}`));
  assert.equal((await admin.request("/admin/permits")).status, 200);
});
await check("a village with destinations cannot be deleted", async () => {
  assert.equal((await admin.request(`/api/admin/villages/${created.villageId}`, { method: "DELETE" })).status, 409);
});
await check("experience CRUD", async () => {
  const create = await admin.request("/api/admin/experiences", { method: "POST", body: { destinationId: created.destinationId, title: "Smoke trek", description: "A short test trek.", category: "ADVENTURE", duration: "2 hours", price: null } });
  assert.equal(create.status, 201, create.text);
  created.experienceId = create.json.data.id;
  assert.equal((await anonymous.request(`/experiences/${created.experienceId}`)).status, 200);
  assert.equal((await admin.request("/api/admin/experiences", { method: "POST", body: { destinationId: created.destinationId, title: "Bad", description: "x", category: "PARTY" } })).status, 422);
  assert.equal((await admin.request(`/api/admin/experiences/${created.experienceId}`, { method: "PUT", body: { destinationId: created.destinationId, title: "Smoke trek", description: "Updated.", category: "ADVENTURE", price: 0 } })).status, 200);
});
await check("festival CRUD, including festivals without dates", async () => {
  const create = await admin.request("/api/admin/festivals", { method: "POST", body: { destinationId: created.destinationId, title: `Smoke Fest ${RUN}`, slug: `smoke-fest-${RUN}`, description: "A test festival.", startDate: "", endDate: "" } });
  assert.equal(create.status, 201, create.text);
  created.festivalId = create.json.data.id;
  const page = await anonymous.request(`/festivals/smoke-fest-${RUN}`);
  assert.equal(page.status, 200);
  assert.match(page.text, /Dates to be announced/);
  assert.equal((await admin.request("/api/admin/festivals", { method: "POST", body: { destinationId: created.destinationId, title: "Bad dates", slug: `bad-${RUN}`, description: "x", startDate: "2027-01-05", endDate: "2027-01-01" } })).status, 422);
});
await check("story CRUD", async () => {
  const create = await admin.request("/api/admin/stories", { method: "POST", body: { destinationId: created.destinationId, title: "Smoke story", slug: `smoke-story-${RUN}`, content: "First paragraph.\n\nSecond paragraph." } });
  assert.equal(create.status, 201, create.text);
  created.storyId = create.json.data.id;
  assert.equal((await anonymous.request(`/stories/smoke-story-${RUN}`)).status, 200);
});
await check("review moderation updates the public rating", async () => {
  assert.equal((await admin.request(`/api/admin/reviews/${created.reviewId}`, { method: "PATCH", body: { status: "APPROVED" } })).status, 200);
  const publicList = await anonymous.request(`/api/destinations/${destination.id}/reviews`);
  assert.ok(publicList.json.data.reviews.some((review) => review.id === created.reviewId));
  const listed = await anonymous.request(`/api/destinations/${destination.slug}`);
  assert.ok(listed.json.data.reviewCount >= 1);
  assert.equal((await admin.request(`/api/admin/reviews/${created.reviewId}`, { method: "PATCH", body: { status: "BOGUS" } })).status, 422);
  assert.equal((await admin.request(`/api/admin/reviews/${created.reviewId}`, { method: "PATCH", body: { status: "HIDDEN" } })).status, 200);
});
await check("settings save and appear on the contact page", async () => {
  const response = await admin.request("/api/admin/settings", { method: "PUT", body: { supportEmail: `help-${RUN}@example.test`, supportPhone: "", emergencyNumber: "112", touristHelpline: "1363", autoApproveReviews: false } });
  assert.equal(response.status, 200, response.text);
  assert.match((await anonymous.request("/contact")).text, new RegExp(`help-${RUN}@example.test`));
});
await check("admins cannot lock themselves out", async () => {
  const me = (await admin.request("/api/auth/get-session")).json.user;
  assert.equal((await admin.request(`/api/admin/users/${me.id}`, { method: "PATCH", body: { isBlocked: true } })).status, 400);
  assert.equal((await admin.request(`/api/admin/users/${me.id}`, { method: "PATCH", body: { role: "TOURIST" } })).status, 400);
});
await check("blocking a user signs them out and prevents sign-in", async () => {
  const touristId = (await tourist.request("/api/auth/get-session")).json.user.id;
  created.touristId = touristId;
  assert.equal((await admin.request(`/api/admin/users/${touristId}`, { method: "PATCH", body: { isBlocked: true } })).status, 200);
  const afterBlock = await tourist.request("/api/trips");
  assert.equal(afterBlock.status, 401, "existing session should be revoked");
  const signIn = await new Session("blocked").signIn(touristEmail, "travel2026");
  assert.equal(signIn.status, 403, signIn.text);
  assert.equal((await admin.request(`/api/admin/users/${touristId}`, { method: "PATCH", body: { isBlocked: false } })).status, 200);
  assert.equal((await tourist.signIn(touristEmail, "travel2026")).status, 200, "unblocked user can sign in again");
});
await check("role changes take effect immediately", async () => {
  assert.equal((await admin.request(`/api/admin/users/${created.touristId}`, { method: "PATCH", body: { role: "GUIDE" } })).status, 200);
  assert.equal((await tourist.request("/api/auth/get-session")).json.user.role, "GUIDE");
  assert.equal((await tourist.request("/api/admin/users")).status, 403, "guides are not admins");
});

console.log("\nCleanup");
await check("tourist deletes their review and trip", async () => {
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/reviews`, { method: "DELETE" })).status, 200);
  assert.equal((await tourist.request(`/api/trips/${created.tripId}`, { method: "DELETE" })).status, 200);
  assert.equal((await tourist.request(`/api/destinations/${destination.id}/save`, { method: "DELETE" })).status, 200);
});
await check("admin deletes test content", async () => {
  for (const [resource, id] of [["stories", created.storyId], ["festivals", created.festivalId], ["experiences", created.experienceId], ["destinations", created.destinationId], ["villages", created.villageId], ["categories", created.categoryId]]) {
    const response = await admin.request(`/api/admin/${resource}/${id}`, { method: "DELETE" });
    assert.equal(response.status, 200, `${resource}: ${response.text}`);
  }
  assert.equal((await admin.request(`/api/admin/permits/${created.permitId}`, { method: "DELETE" })).status, 200);
  assert.equal((await anonymous.request(`/destinations/smoke-falls-${RUN}`)).status, 404);
});
await check("sign out ends the session", async () => {
  await tourist.request("/api/auth/sign-out", { method: "POST", body: {} });
  assert.equal((await tourist.request("/api/trips")).status, 401);
});

console.log(`\n${passed} passed, ${failures.length} failed`);
console.log(`Test accounts created: ${touristEmail}, smoke2-${RUN}@example.test${created.sneakyEmail ? `, ${created.sneakyEmail}` : ""} (remove them from a shared database).`);
process.exit(failures.length ? 1 : 0);
