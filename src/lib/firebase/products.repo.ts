import "server-only";

import { db, serverTimestamp } from "./admin";
import { COL } from "./collections";
import { ProductSchema, type ProductInput } from "./schemas";

export type ProductDoc = ProductInput & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ProductWithId = ProductDoc & { id: string };

export async function createProduct(input: ProductInput): Promise<{ id: string }> {
  const data = ProductSchema.parse(input);
  const ref = db.collection(COL.products).doc();
  const doc: ProductDoc = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await ref.set(doc);
  return { id: ref.id };
}

export async function updateProduct(productId: string, patch: Partial<ProductInput>): Promise<void> {
  const ref = db.collection(COL.products).doc(productId);
  await ref.update({
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await db.collection(COL.products).doc(productId).delete();
}

export async function getProductById(productId: string): Promise<ProductWithId | null> {
  const doc = await db.collection(COL.products).doc(productId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as ProductDoc) };
}

export async function getProductBySlug(slug: string): Promise<ProductWithId | null> {
  
  if (!slug) return null;
const snap = await db.collection(COL.products).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;

  const doc = snap.docs[0]!;
  return { id: doc.id, ...(doc.data() as ProductDoc) };
}

export async function listActiveProducts(limit = 24): Promise<ProductWithId[]> {
  const snap = await db
    .collection(COL.products)
    .where("isActive", "==", true)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ProductDoc) }));
}

export async function listAllProductsAdmin(limit = 200): Promise<ProductWithId[]> {
  const snap = await db.collection(COL.products).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ProductDoc) }));
}