import { getDb } from "./mongodb";

export const POINTS_PER_DOLLAR = 1;        // $1 = 1 point (regular)
export const HOST_POINTS_PER_DOLLAR = 1.5; // $1 = 1.5 points (host)
export const POINTS_TO_CENTS = 1;          // 100 points = $1 = 100 cents → 1 point = 1 cent

export interface PointsEntry {
  type: "earn" | "redeem";
  points: number;
  amountCents: number;
  orderId: string;
  description: string;
  createdAt: Date;
}

export interface PointsAccount {
  email: string;
  balance: number;
  ledger: PointsEntry[];
  updatedAt: Date;
}

export async function getPointsBalance(
  email: string
): Promise<{ balance: number; ledger: PointsEntry[] }> {
  const db = await getDb();
  const account = await db
    .collection<PointsAccount>("loyalty_points")
    .findOne({ email: email.toLowerCase() });
  return { balance: account?.balance ?? 0, ledger: account?.ledger ?? [] };
}

export async function earnPoints(
  email: string,
  amountCents: number,
  isHost: boolean,
  orderId: string
): Promise<number> {
  const db = await getDb();
  const col = db.collection<PointsAccount>("loyalty_points");
  const rate = isHost ? HOST_POINTS_PER_DOLLAR : POINTS_PER_DOLLAR;
  const earned = Math.floor((amountCents / 100) * rate);
  if (earned <= 0) return 0;

  const entry: PointsEntry = {
    type: "earn",
    points: earned,
    amountCents,
    orderId,
    description: `Order earned ${earned} pts (${isHost ? "Host 1.5x" : "1x"} rate)`,
    createdAt: new Date(),
  };

  await col.updateOne(
    { email: email.toLowerCase() },
    {
      $inc: { balance: earned },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $push: { ledger: entry as any },
      $set: { updatedAt: new Date() },
      $setOnInsert: { email: email.toLowerCase() },
    },
    { upsert: true }
  );
  return earned;
}

/** Deduct points. Points must be a multiple of 100 (100 pts = $1 discount). */
export async function redeemPoints(
  email: string,
  points: number,
  orderId: string
): Promise<{ success: boolean; discountCents: number; error?: string }> {
  if (points <= 0 || points % 100 !== 0) {
    return { success: false, discountCents: 0, error: "Points must be a multiple of 100" };
  }

  const db = await getDb();
  const col = db.collection<PointsAccount>("loyalty_points");
  const account = await col.findOne({ email: email.toLowerCase() });
  if (!account || account.balance < points) {
    return { success: false, discountCents: 0, error: "Insufficient points" };
  }

  // 100 points = $1 = 100 cents
  const discountCents = points * POINTS_TO_CENTS;

  const entry: PointsEntry = {
    type: "redeem",
    points: -points,
    amountCents: -discountCents,
    orderId,
    description: `Redeemed ${points} pts for $${(discountCents / 100).toFixed(2)} discount`,
    createdAt: new Date(),
  };

  await col.updateOne(
    { email: email.toLowerCase() },
    {
      $inc: { balance: -points },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $push: { ledger: entry as any },
      $set: { updatedAt: new Date() },
    }
  );

  return { success: true, discountCents };
}
