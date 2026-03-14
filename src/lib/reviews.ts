import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type Review = {
  _id?: ObjectId;
  productId: string;         // matches Product.id
  productSlug: string;
  checkoutSessionId: string; // Stripe session ID – used for duplicate prevention
  customerEmail: string;
  customerName: string;
  rating: number;            // 1–5
  title: string;
  body: string;
  verified: boolean;         // confirmed purchase via Stripe session
  approved: boolean;         // admin moderation flag (default: false)
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewInput = {
  productId: string;
  productSlug: string;
  checkoutSessionId: string; // Stripe session ID – used for purchase verification
  customerEmail: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
};

const COLLECTION = "reviews";

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const db = await getDb();
  return db
    .collection<Review>(COLLECTION)
    .find({ productId, approved: true })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getAllReviews(): Promise<Review[]> {
  const db = await getDb();
  return db
    .collection<Review>(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

export async function createReview(
  input: Omit<Review, "_id" | "createdAt" | "updatedAt">
): Promise<Review> {
  const db = await getDb();
  const now = new Date();
  const doc: Review = { ...input, createdAt: now, updatedAt: now };
  const result = await db.collection<Review>(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function updateReview(
  id: string,
  update: Partial<Pick<Review, "approved" | "rating" | "title" | "body">>
): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection<Review>(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

export async function deleteReview(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .collection<Review>(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/** Check whether the given Stripe session already has a review for this product. */
export async function reviewExistsForSession(
  checkoutSessionId: string,
  productId: string
): Promise<boolean> {
  const db = await getDb();
  // We store the session ID as a unique guard to prevent duplicate reviews.
  const count = await db
    .collection(COLLECTION)
    .countDocuments({ checkoutSessionId, productId });
  return count > 0;
}
