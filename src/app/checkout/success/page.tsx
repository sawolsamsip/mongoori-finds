import Link from "next/link";

type Props = { searchParams: { session_id?: string } };

export default function CheckoutSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white mb-2">
        Thank you for your order
      </h1>
      <p className="text-brand-slate dark:text-brand-silver mb-8">
        Your payment was successful. We’ll send a confirmation to your email and ship your order soon.
      </p>
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
