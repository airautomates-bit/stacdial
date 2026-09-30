import { claimToken, errorResponse, json, readProducts, readSettings } from "@/lib/server";
import {readCollectionDoc} from "@/lib/firestore-store";

export async function GET(req: Request) {
  try {
    const settings = await readSettings();
    const claim = await readCollectionDoc<{used:boolean}>("claims",claimToken(req));
    const { sheetsId: _privateSheetsId, ...publicSettings } = settings;
    const products = await readProducts();
    return json({ settings: publicSettings, products, hasCatalogue: products.length > 0, claimed: Boolean(claim&&!claim.used) });
  } catch (error) {
    return errorResponse(error, "Catalogue temporarily unavailable");
  }
}
