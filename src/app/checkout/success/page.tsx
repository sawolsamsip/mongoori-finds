import Link from "next/link";
import Stripe from "stripe";

type Props = { searchParams: Promise<{ session_id?: string }> | { session_id?: string } };

async function getShipping(sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") return null;
    const shipping = session.collected_information?.shipping_details;
    const addr = shipping?.address;
    const shippingAddress = addr
      ? [
          addr.line1,
          addr.line2,
          [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
          addr.country,
        ]
        .filter(Boolean)
        .join("\n")
      : null;
    return {
      recipientName: shipping?.name ?? session.customer_details?.name ?? null,
      shippingAddress,
      phone: session.customer_details?.phone ?? null,
    };
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage(props: Props) {
  const searchParams = await Promise.resolve(props.searchParams);
  const sessionId = searchParams.session_id;
  const shipping = sessionId ? await getShipping(sessionId) : null;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white mb-2">
        Thank you for your order
      </h1>
      <p className="text-brand-slate dark:text-brand-silver mb-6">
        Your payment was successful. We’ll send a confirmation to your email and ship your order soon.
      </p>
      {shipping && (shipping.recipientName || shipping.shippingAddress || shipping.phone) && (
        <div className="mb-8 text-left rounded-lg border border-brand-border dark:border-brand-slate/30 bg-brand-slate/5 dark:bg-brand-slate/10 p-4">
          <p className="text-sm font-medium text-brand-black dark:text-brand-white mb-2">
            Shipping to
          </p>
          {shipping.recipientName && (
            <p className="text-brand-slate dark:text-brand-silver">{shipping.recipientName}</p>
          )}
          {shipping.shippingAddress && (
            <pre className="mt-1 text-sm text-brand-slate dark:text-brand-silver whitespace-pre-wrap font-sans">
              {shipping.shippingAddress}
            </pre>
          )}
          {shipping.phone && (
            <p className="mt-1 text-sm text-brand-slate dark:text-brand-silver">Tel: {shipping.phone}</p>
          )}
        </div>
      )}
      {sessionId && (
        <p className="text-sm text-brand-silver mb-6 font-mono break-all">
          Order: {sessionId}
        </p>
      )}
      <Link
        href="/products"
        className="inline-flex items-center justify-center rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-6 py-3 text-sm font-medium hover:opacity-90"
      >
        Continue shopping
      </Link>
    </div>
  );
}
