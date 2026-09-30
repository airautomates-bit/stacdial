import { describe, expect, it } from "vitest";
import { assetSchema, normalizePhone, orderSchema, preOrderSchema, productSchema, settingsSchema } from "@/lib/schemas";
import { defaults, orderedFeaturedProducts, samples } from "@/lib/catalog";

describe("content validation", () => {
  it("accepts stable internal media and trusted Vercel Blob URLs", () => {
    expect(assetSchema.safeParse("/api/assets/12345678-1234-1234-1234-123456789abc").success).toBe(true);
    expect(assetSchema.safeParse("https://store.public.blob.vercel-storage.com/watch.webp").success).toBe(true);
  });

  it("rejects arbitrary media hosts and external CTA URLs", () => {
    expect(assetSchema.safeParse("https://example.com/watch.webp").success).toBe(false);
    expect(settingsSchema.safeParse({ ...defaults, heroButtonLink: "https://evil.example" }).success).toBe(false);
  });

  it("accepts the complete default CMS document", () => {
    expect(settingsSchema.safeParse(defaults).success).toBe(true);
  });
});

describe("featured section ordering", () => {
  it("uses the administrator order and ignores missing products", () => {
    expect(orderedFeaturedProducts(samples, [samples[2].id, "missing", samples[0].id]).map(product => product.id)).toEqual([samples[2].id, samples[0].id]);
  });

  it("keeps legacy featured flags when no explicit order has been saved", () => {
    expect(orderedFeaturedProducts(samples, [])).toHaveLength(6);
  });
});

describe("order input", () => {
  it("normalizes local Sri Lankan phone numbers", () => {
    expect(normalizePhone("076 043 6776")).toBe("94760436776");
  });

  it("rejects malformed idempotency keys", () => {
    expect(orderSchema.safeParse({ name: "Customer", phone: "94760436776", productId: "watch-1", requestKey: "short" }).success).toBe(false);
  });

  it("requires complete contact details for an interest registration", () => {
    const input = { productId: "watch-1", firstName: "Asha", lastName: "Perera", email: "asha@example.com", phone: "94760436776", contactPreference: "email", requestKey: "12345678-1234-1234-1234-123456789abc" };
    expect(preOrderSchema.safeParse(input).success).toBe(true);
    expect(preOrderSchema.safeParse({ ...input, email: "not-an-email" }).success).toBe(false);
    expect(preOrderSchema.safeParse({ ...input, contactPreference: "post" }).success).toBe(false);
  });

  it("allows image-free drafts but requires an image before publishing", () => {
    const draft = { ...samples[0], price: 36_000, images: [], status: "draft" as const };
    expect(productSchema.safeParse(draft).success).toBe(true);
    expect(productSchema.safeParse({ ...draft, status: "published" }).success).toBe(false);
  });
});
