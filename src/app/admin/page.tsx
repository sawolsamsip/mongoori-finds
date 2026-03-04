"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import pkg from "../../../package.json";

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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">
            Admin — 주문·배송·환불
          </h1>
          <p className="text-brand-slate dark:text-brand-silver text-sm mt-1">
            Mongoori Finds v{pkg.version}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="rounded-lg border border-brand-border dark:border-brand-slate/30 px-4 py-2 text-sm font-medium text-brand-black dark:text-brand-white hover:bg-brand-slate/10 disabled:opacity-50"
          >
            {loading ? "Refresh…" : "Refresh"}
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

      {orders?.length === 0 && (
        <p className="text-brand-slate dark:text-brand-silver py-12 text-center">
          No orders yet.
        </p>
      )}

      {orders && orders.length > 0 && (
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
