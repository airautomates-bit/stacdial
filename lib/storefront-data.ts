import { defaults, samples, type Product, type StoreSettings } from "./catalog";
import { readProducts, readSettings } from "./server";
import { cookies } from "next/headers";
import {firebaseServerConfigured} from "./firebase-admin";
import {readCollectionDoc} from "./firestore-store";
import { unstable_cache } from "next/cache";

export type StorefrontData = {
  products: Product[];
  settings: StoreSettings;
  hasCatalogue: boolean;
  claimed: boolean;
  unavailable: boolean;
};

const cachedProducts = unstable_cache(
  () => readProducts(),
  ["public-products"],
  { revalidate: 60, tags: ["public-products"] },
);

const cachedSettings = unstable_cache(
  () => readSettings(),
  ["public-settings"],
  { revalidate: 60, tags: ["public-settings"] },
);

export async function storefrontData(): Promise<StorefrontData> {
  if (!firebaseServerConfigured()) {
    return { products: samples, settings: defaults, hasCatalogue: false, claimed: false, unavailable: false };
  }
  try {
    const token = (await cookies()).get("stacdial_claim")?.value ?? "";
    const [products, settings, claim] = await Promise.all([
      cachedProducts(),
      cachedSettings(),
      token ? readCollectionDoc<{used:boolean}>("claims",token) : null,
    ]);
    return {
      products: products.length > 0 ? products : samples,
      settings,
      hasCatalogue: products.length > 0,
      claimed: Boolean(claim&&!claim.used),
      unavailable: false,
    };
  } catch (error) {
    console.error("Storefront data unavailable", error);
    return { products: samples, settings: defaults, hasCatalogue: false, claimed: false, unavailable: true };
  }
}
