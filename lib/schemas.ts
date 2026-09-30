import { z } from "zod";

const relativeAsset = /^\/(images|videos)\/[a-zA-Z0-9_.-]+$/;
const mediaAsset = /^\/api\/media\/[a-zA-Z0-9-]+\.(jpg|png|webp|mp4|webm)$/;
const libraryAsset = /^\/api\/assets\/[a-f0-9-]{36}$/;

export const assetSchema = z.string().refine((value) => {
  if (relativeAsset.test(value) || mediaAsset.test(value) || libraryAsset.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.hash === "" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}, "Use an uploaded Stacdial media URL");

export const cropSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  zoom: z.number().min(1).max(3),
  fit: z.enum(["cover", "contain"]),
});

export const productSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,70}$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100).optional(),
  name: z.string().trim().min(2).max(100),
  collection: z.string().trim().min(1).max(50),
  price: z.number().min(1).max(100_000_000),
  description: z.string().trim().max(3_000),
  specs: z.string().trim().max(3_000),
  images: z.array(assetSchema).max(12),
  featured: z.boolean(),
  active: z.boolean(),
  inStock: z.boolean().default(true),
  status: z.enum(["draft", "published"]).default("draft"),
  currency: z.string().regex(/^[A-Z]{3}$/).default("LKR"),
  fullDescription: z.string().trim().max(10_000).default(""),
  video: z.union([assetSchema, z.literal("")]).default(""),
  sku: z.string().trim().max(100).default(""),
  stockQuantity: z.number().int().min(0).max(1_000_000).default(0),
  availabilityStatus: z.enum(["in_stock", "pre_order", "out_of_stock"]).default("pre_order"),
  modelReference: z.string().trim().max(150).default(""),
  movementType: z.string().trim().max(150).default(""),
  caseMaterial: z.string().trim().max(150).default(""),
  caseDiameter: z.string().trim().max(80).default(""),
  caseThickness: z.string().trim().max(80).default(""),
  braceletMaterial: z.string().trim().max(150).default(""),
  dialColour: z.string().trim().max(100).default(""),
  crystalMaterial: z.string().trim().max(150).default(""),
  waterResistance: z.string().trim().max(100).default(""),
  powerReserve: z.string().trim().max(100).default(""),
  warranty: z.string().trim().max(2_000).default(""),
  shipping: z.string().trim().max(2_000).default(""),
  care: z.string().trim().max(2_000).default(""),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(170).default(""),
  socialImage: z.union([assetSchema, z.literal("")]).default(""),
  paymentPlan: z.string().trim().max(2_000),
}).superRefine((product, context) => {
  if (product.status === "published" && product.images.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["images"],
      message: "Published products require at least one image",
    });
  }
});

export const settingsSchema = z.object({
  heroEnabled: z.boolean(),
  heroEyebrow: z.string().trim().min(1).max(50),
  heroHeadline: z.string().trim().min(1).max(120),
  heroText: z.string().trim().max(300),
  heroButtonLabel: z.string().trim().min(1).max(50),
  heroButtonLink: z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_?=&%#.-]*$/),
  featuredEnabled: z.boolean(),
  featuredEyebrow: z.string().trim().min(1).max(50),
  featuredTitle: z.string().trim().min(1).max(100),
  featuredText: z.string().trim().max(300),
  featuredButtonLabel: z.string().trim().min(1).max(50),
  featuredButtonLink: z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_?=&%#.-]*$/),
  featuredProductIds: z.array(z.string().regex(/^[a-zA-Z0-9-]{1,70}$/)).max(12),
  shopCover: z.union([assetSchema, z.literal("")]),
  aboutCover: z.union([assetSchema, z.literal("")]),
  shopCrop: cropSchema,
  aboutCrop: cropSchema,
  shopMobileCrop: cropSchema,
  aboutMobileCrop: cropSchema,
  editorialImage: assetSchema,
  editorialCrop: cropSchema,
  editorialMobileCrop: cropSchema,
  editorialTitle: z.string().trim().min(1).max(100),
  editorialText: z.string().trim().max(1_000),
  consultationEnabled: z.boolean(),
  desktopVideo: z.union([assetSchema, z.literal("")]),
  mobileVideo: z.union([assetSchema, z.literal("")]),
  poster: assetSchema,
  whatsapp: z.string().regex(/^$|^[1-9][0-9]{8,14}$/),
  offerPercent: z.number().min(0).max(50),
  offerEnabled: z.boolean(),
  offerTitle: z.string().trim().min(1).max(100),
  offerText: z.string().trim().max(300),
  about: z.string().trim().max(5_000),
  sheetsId: z.string().regex(/^$|^[a-zA-Z0-9_-]{15,150}$/),
});

export const orderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().min(9).max(30),
  note: z.string().trim().max(1_000).default(""),
  requestKey: z.string().regex(/^[a-zA-Z0-9-]{20,60}$/),
  productId: z.string().regex(/^[a-zA-Z0-9-]{1,70}$/),
  offerCode: z.string().trim().max(40).optional().default(""),
});

export const adminActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("settings"), data: settingsSchema }),
  z.object({ action: z.literal("product"), data: productSchema }),
  z.object({ action: z.literal("paid"), id: z.string().max(30) }),
  z.object({
    action: z.literal("loyalty"),
    data: z.object({
      phone: z.string().regex(/^[1-9][0-9]{8,14}$/),
      percent: z.number().int().min(1).max(50),
      minimum: z.number().min(0).max(100_000_000),
      expires: z.number().int(),
    }),
  }),
  z.object({ action: z.literal("revokeLoyalty"), id: z.string().max(40) }),
  z.object({ action: z.literal("sync") }),
]);

export const adminLoginSchema = z.object({
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().max(256).optional().default(""),
});

export const preOrderSchema = z.object({
  productId: z.string().regex(/^[a-zA-Z0-9-]{1,70}$/),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  phone: z.string().min(9).max(30),
  contactPreference: z.enum(["email", "phone", "either"]),
  note: z.string().trim().max(1_000).optional().default(""),
  requestKey: z.string().regex(/^[a-zA-Z0-9-]{20,60}$/),
});

export const orderStatusSchema = z.enum([
  "new",
  "contacted",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
]);

export const orderUpdateSchema = z.object({
  status: orderStatusSchema,
  internalNotes: z.string().trim().max(3_000),
});

export function normalizePhone(value: string): string {
  return value.replace(/[^0-9]/g, "").replace(/^00/, "").replace(/^0(?=[0-9]{9}$)/, "94");
}
