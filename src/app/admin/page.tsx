"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import pkg from "../../../package.json";

type Review = {
  _id: string;
  productId: string;
  productSlug: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
};

type Order = {
  id: string;
  paymentIntentId: string | null;
  created: number;
  amountTotal: number;
  currency: string;
  customerEmail: string | null;
  recipientName: string | null;
  shippingAddress: string | null;
  phone: string | null;
  shippingStatus: string;
  trackingNumber: string | null;
  lineItems: Array<{
    description: string | null;
    quantity: number | null;
    amount: number | null;
  }>;
};

export default function AdminPage() {
  const [tab, setTab] = useState<"orders" | "reviews">("orders");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [shippingUpdates, setShippingUpdates] = useState<
    Record<string, { status: string; tracking: string }>
  >({});
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setAuthError(null);
    const res = await fetch("/api/admin/orders", { credentials: "include" });
    if (res.status === 401) {
      setOrders(null);
      setAuthError("Login required");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setAuthError("Failed to load orders");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const res = await fetch("/api/admin/reviews", { credentials: "include" });
    if (!res.ok) {
      setReviewsLoading(false);
      return;
    }
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setReviewsLoading(false);
  };

  const handleApproveReview = async (id: string, approved: boolean) => {
    setActionLoading(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
      credentials: "include",
    });
    await fetchReviews();
    setActionLoading(null);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await fetchReviews();
    setActionLoading(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoginError(data.error ?? "Login failed");
      setLoginLoading(false);
      return;
    }
    setLoginLoading(false);
    fetchOrders();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    setOrders(null);
    setAuthError("Login required");
  };

  const handleRefund = async (paymentIntentId: string) => {
    if (!confirm("Refund this order? This cannot be undone.")) return;
    setActionLoading(paymentIntentId);
    const res = await fetch("/api/admin/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "Refund failed");
    } else {
      await fetchOrders();
    }
    setActionLoading(null);
  };

  const handleShippingUpdate = async (sessionId: string) => {
    const order = orders?.find((o) => o.id === sessionId);
    const upd = shippingUpdates[sessionId];
    const status = upd?.status ?? order?.shippingStatus ?? "pending";
    const tracking = upd?.tracking ?? order?.trackingNumber ?? "";
    setActionLoading(sessionId);
    const res = await fetch(`/api/admin/orders/${sessionId}/shipping`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingStatus: status,
        trackingNumber: tracking || null,
      }),
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Update failed");
    } else {
      await fetchOrders();
    }
    setActionLoading(null);
  };

  const formatAmount = (cents: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });

  if (loading && orders === null) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <p className="text-brand-slate dark:text-brand-silver">Loading…</p>
      </div>
    );
  }

  if (authError && orders === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="rounded-xl border border-brand-border dark:border-brand-slate/30 bg-white dark:bg-brand-slate/10 p-8 shadow-sm">
          <h1 className="text-xl font-bold text-brand-black dark:text-brand-white mb-2">
            Admin Login
          </h1>
          <p className="text-brand-slate dark:text-brand-silver text-sm mb-6">
            Mongoori Finds — 주문·배송·환불 관리
          </p>
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-brand-black dark:text-brand-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-brand-border dark:border-brand-slate/30 bg-white dark:bg-brand-slate/10 px-4 py-2 text-brand-black dark:text-brand-white mb-4"
              placeholder="ADMIN_PASSWORD"
              autoComplete="current-password"
              required
            />
            {loginError && (
              <p className="text-red-500 text-sm mb-4">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black py-2.5 font-medium disabled:opacity-50"
            >
              {loginLoading ? "Logging in…" : "Log in"}
            </button>
          </form>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-brand-slate dark:text-brand-silver hover:underline"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">
            Admin
          </h1>
          <p className="text-brand-slate dark:text-brand-silver text-sm mt-1">
            Mongoori Finds v{pkg.version}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={tab === "orders" ? fetchOrders : fetchReviews}
            disabled={loading || reviewsLoading}
            className="rounded-lg border border-brand-border dark:border-brand-slate/30 px-4 py-2 text-sm font-medium text-brand-black dark:text-brand-white hover:bg-brand-slate/10 disabled:opacity-50"
          >
            {loading || reviewsLoading ? "Refresh…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-brand-slate/20 dark:bg-brand-slate/30 text-brand-black dark:text-brand-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Logout
          </button>
          <Link
            href="/"
            className="text-sm text-brand-slate dark:text-brand-silver hover:underline"
          >
            Store
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "orders"
              ? "border-brand-black dark:border-brand-white text-brand-black dark:text-brand-white"
              : "border-transparent text-brand-silver hover:text-brand-slate dark:hover:text-brand-silver"
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("reviews");
            if (reviews === null) fetchReviews();
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "reviews"
              ? "border-brand-black dark:border-brand-white text-brand-black dark:text-brand-white"
              : "border-transparent text-brand-silver hover:text-brand-slate dark:hover:text-brand-silver"
          }`}
        >
          Reviews
        </button>
      </div>

      {/* Reviews tab */}
      {tab === "reviews" && (
        <div>
          {reviewsLoading && (
            <p className="text-brand-slate dark:text-brand-silver py-12 text-center">Loading reviews…</p>
          )}
          {!reviewsLoading && reviews?.length === 0 && (
            <p className="text-brand-slate dark:text-brand-silver py-12 text-center">No reviews yet.</p>
          )}
          {!reviewsLoading && reviews && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-xl border border-brand-border dark:border-brand-slate/30 bg-white dark:bg-brand-slate/10 p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-yellow-400 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            review.approved
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {review.approved ? "Approved" : "Pending"}
                        </span>
                        {review.verified && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ Verified</span>
                        )}
                        <span className="text-xs text-brand-silver">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { dateStyle: "short" })}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-brand-black dark:text-brand-white text-sm">
                        {review.title}
                      </p>
                      <p className="mt-1 text-sm text-brand-slate dark:text-brand-silver leading-relaxed">
                        {review.body}
                      </p>
                      <p className="mt-2 text-xs text-brand-silver">
                        {review.customerName} · {review.customerEmail} · /products/{review.productSlug}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {!review.approved ? (
                        <button
                          type="button"
                          onClick={() => handleApproveReview(review._id, true)}
                          disabled={actionLoading === review._id}
                          className="rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === review._id ? "…" : "Approve"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApproveReview(review._id, false)}
                          disabled={actionLoading === review._id}
                          className="rounded-lg border border-brand-border dark:border-brand-slate/30 text-brand-slate dark:text-brand-silver px-3 py-1.5 text-xs font-medium hover:bg-brand-slate/10 disabled:opacity-50"
                        >
                          {actionLoading === review._id ? "…" : "Unapprove"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={actionLoading === review._id}
                        className="rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && orders?.length === 0 && (
        <p className="text-brand-slate dark:text-brand-silver py-12 text-center">
          No orders yet.
        </p>
      )}

      {tab === "orders" && orders && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-brand-border dark:border-brand-slate/30 bg-white dark:bg-brand-slate/10 overflow-hidden shadow-sm"
            >
              <div className="p-4 sm:p-6 border-b border-brand-border dark:border-brand-slate/20 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-brand-slate dark:text-brand-silver">
                    {order.id}
                  </p>
                  <p className="text-brand-black dark:text-brand-white font-medium mt-1">
                    {formatDate(order.created)}
                  </p>
                  {order.customerEmail && (
                    <p className="text-sm text-brand-slate dark:text-brand-silver mt-0.5">
                      {order.customerEmail}
                    </p>
                  )}
                  {(order.recipientName || order.shippingAddress || order.phone) && (
                    <div className="mt-3 p-3 rounded-lg bg-brand-slate/10 dark:bg-brand-slate/20 text-sm">
                      <p className="font-medium text-brand-black dark:text-brand-white mb-1">Ship to</p>
                      {order.recipientName && (
                        <p className="text-brand-slate dark:text-brand-silver">{order.recipientName}</p>
                      )}
                      {order.shippingAddress && (
                        <pre className="mt-1 text-brand-slate dark:text-brand-silver whitespace-pre-wrap font-sans">
                          {order.shippingAddress}
                        </pre>
                      )}
                      {order.phone && (
                        <p className="mt-1 text-brand-slate dark:text-brand-silver">Tel: {order.phone}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-brand-black dark:text-brand-white">
                    {formatAmount(order.amountTotal, order.currency)}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                      order.shippingStatus === "delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : order.shippingStatus === "shipped"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-brand-slate/20 text-brand-slate dark:text-brand-silver"
                    }`}
                  >
                    {order.shippingStatus || "pending"}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <p className="text-sm font-medium text-brand-black dark:text-brand-white mb-2">
                  Items
                </p>
                <ul className="space-y-1 text-sm text-brand-slate dark:text-brand-silver mb-6">
                  {order.lineItems.map((li, i) => (
                    <li key={i}>
                      {li.description ?? "Item"} × {li.quantity ?? 1} —{" "}
                      {li.amount != null
                        ? formatAmount(li.amount, order.currency)
                        : ""}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex flex-wrap gap-2 items-end">
                    <div>
                      <label className="block text-xs font-medium text-brand-slate dark:text-brand-silver mb-1">
                        Shipping status
                      </label>
                      <select
                        value={
                          shippingUpdates[order.id]?.status ??
                          order.shippingStatus
                        }
                        onChange={(e) =>
                          setShippingUpdates((prev) => ({
                            ...prev,
                            [order.id]: {
                              ...prev[order.id],
                              status: e.target.value,
                            },
                          }))
                        }
                        className="rounded-lg border border-brand-border dark:border-brand-slate/30 bg-white dark:bg-brand-slate/10 px-3 py-2 text-sm text-brand-black dark:text-brand-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-slate dark:text-brand-silver mb-1">
                        Tracking
                      </label>
                      <input
                        type="text"
                        placeholder="Optional"
                        defaultValue={order.trackingNumber ?? ""}
                        onChange={(e) =>
                          setShippingUpdates((prev) => ({
                            ...prev,
                            [order.id]: {
                              ...prev[order.id],
                              tracking: e.target.value,
                            },
                          }))
                        }
                        className="rounded-lg border border-brand-border dark:border-brand-slate/30 bg-white dark:bg-brand-slate/10 px-3 py-2 text-sm text-brand-black dark:text-brand-white w-40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShippingUpdate(order.id)}
                      disabled={actionLoading === order.id}
                      className="rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading === order.id ? "Updating…" : "Update shipping"}
                    </button>
                  </div>
                  {order.paymentIntentId && (
                    <button
                      type="button"
                      onClick={() => handleRefund(order.paymentIntentId!)}
                      disabled={actionLoading !== null}
                      className="rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {actionLoading === order.paymentIntentId
                        ? "Refunding…"
                        : "Refund"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
