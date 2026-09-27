import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_UPLOAD_BYTES, detectImageType, validateImageUpload } from "@/lib/utils/image-validation";
import { imageUrlSchema } from "@/lib/validators/common";

const bytes = (...values) => {
  const buffer = new Uint8Array(32);
  buffer.set(values.flat());
  return buffer;
};
const text = (value) => [...value].map((char) => char.charCodeAt(0));

describe("image type detection", () => {
  it("recognises JPEG, PNG, WebP and AVIF by their bytes", () => {
    assert.equal(detectImageType(bytes([0xff, 0xd8, 0xff, 0xe0])).ext, "jpg");
    assert.equal(detectImageType(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])).ext, "png");
    assert.equal(detectImageType(bytes(text("RIFF"), [0, 0, 0, 0], text("WEBP"))).ext, "webp");
    assert.equal(detectImageType(bytes([0, 0, 0, 0x1c], text("ftypavif"))).ext, "avif");
  });

  it("rejects look-alikes and other files", () => {
    assert.equal(detectImageType(bytes(text("<svg xmlns"))), null, "SVG can carry scripts");
    assert.equal(detectImageType(bytes(text("GIF89a"))), null);
    assert.equal(detectImageType(bytes(text("%PDF-1.7"))), null);
    assert.equal(detectImageType(bytes(text("RIFF"), [0, 0, 0, 0], text("WAVE"))), null);
    assert.equal(detectImageType(new Uint8Array(4)), null);
  });
});

describe("upload validation", () => {
  it("returns the right status for each problem", () => {
    assert.equal(validateImageUpload(new Uint8Array(0)).status, 400);
    assert.equal(validateImageUpload(bytes(text("hello world, not an image"))).status, 415);
    const huge = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    huge.set([0xff, 0xd8, 0xff]);
    assert.equal(validateImageUpload(huge).status, 413);
    assert.equal(validateImageUpload(bytes([0xff, 0xd8, 0xff, 0xdb])).ok, true);
  });
});

describe("image URL rules", () => {
  it("accepts https links and our own uploads, nothing else", () => {
    assert.equal(imageUrlSchema.safeParse("https://res.cloudinary.com/demo/image/upload/x.jpg").success, true);
    assert.equal(imageUrlSchema.safeParse("/uploads/reviews/abc123.webp").success, true);
    assert.equal(imageUrlSchema.safeParse("/uploads/../../etc/passwd").success, false);
    assert.equal(imageUrlSchema.safeParse("/etc/passwd").success, false);
    assert.equal(imageUrlSchema.safeParse("http://insecure.example/x.jpg").success, false);
    assert.equal(imageUrlSchema.safeParse("javascript:alert(1)").success, false);
  });
});
