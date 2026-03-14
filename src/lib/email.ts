import nodemailer from "nodemailer";
import type Stripe from "stripe";

function getTransporter() {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST is not configured");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatAmount(cents: number | null, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((cents ?? 0) / 100);
}

// ---------------------------------------------------------------------------
// HTML email base template
// ---------------------------------------------------------------------------

function htmlWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mongoori Finds</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0a0a0a;border-radius:12px 12px 0 0;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Mongoori Finds</p>
              <p style="margin:4px 0 0;color:#888888;font-size:13px;">finds.mongoori.com</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;border:1px solid #e5e5e5;border-radius:0 0 12px 12px;padding:20px 32px;">
              <p style="margin:0;color:#888888;font-size:12px;line-height:1.5;">
                Mongoori Finds · Tesla Accessories<br/>
                Questions? Reply to this email or visit <a href="https://finds.mongoori.com" style="color:#0a0a0a;text-decoration:underline;">finds.mongoori.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(
  lineItems: Array<{ description: string | null; quantity: number | null; amount: number | null }>,
  currency: string
): string {
  const rows = lineItems
    .map(
      (li) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#1a1a1a;font-size:14px;">${li.description ?? "Item"}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666666;font-size:14px;text-align:center;">×${li.quantity ?? 1}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#1a1a1a;font-size:14px;text-align:right;white-space:nowrap;">${li.amount != null ? formatAmount(li.amount, currency) : ""}</td>
        </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:0 0 8px;text-align:left;font-size:12px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f0f0f0;">Item</th>
          <th style="padding:0 0 8px;text-align:center;font-size:12px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f0f0f0;">Qty</th>
          <th style="padding:0 0 8px;text-align:right;font-size:12px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f0f0f0;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ---------------------------------------------------------------------------
// Stripe helper types
// ---------------------------------------------------------------------------

type LineItemLike = {
  description: string | null;
  quantity: number | null;
  amount_total?: number | null;
  amount?: number | null;
};

function buildLineItemsFromStripe(
  lineItems: Stripe.LineItem[]
): Array<{ description: string | null; quantity: number | null; amount: number | null }> {
  return lineItems.map((li) => ({
    description: li.description,
    quantity: li.quantity,
    amount: li.amount_total ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Shared address formatter
// ---------------------------------------------------------------------------

function formatAddress(addr: Stripe.Address | null | undefined): string {
  if (!addr) return "N/A";
  return [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
    addr.country,
  ]
    .filter(Boolean)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Customer: Order Confirmation
// ---------------------------------------------------------------------------

function buildCustomerConfirmationHtml(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): string {
  const customerName =
    session.customer_details?.name ??
    session.collected_information?.shipping_details?.name ??
    "Valued Customer";
  const total = formatAmount(session.amount_total, session.currency ?? "usd");
  const orderId = session.id;
  const orderDate = new Date(session.created * 1000).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const shipping = session.collected_information?.shipping_details;
  const shippingAddress = formatAddress(shipping?.address);
  const items = buildLineItemsFromStripe(lineItems);

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0a0a0a;letter-spacing:-0.5px;">Order Confirmed</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">Hi ${customerName}, thank you for your purchase! Your order has been received and is being prepared.</p>

    <div style="background-color:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order ID</td>
          <td style="font-size:12px;color:#444444;text-align:right;font-family:monospace;">${orderId}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-top:8px;">Date</td>
          <td style="font-size:12px;color:#444444;text-align:right;padding-top:8px;">${orderDate}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-top:8px;">Ship to</td>
          <td style="font-size:12px;color:#444444;text-align:right;padding-top:8px;">${shippingAddress}</td>
        </tr>
      </table>
    </div>

    <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#0a0a0a;">Order Summary</h2>
    ${itemsTable(items, session.currency ?? "usd")}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="font-size:15px;font-weight:700;color:#0a0a0a;padding-top:12px;border-top:2px solid #0a0a0a;">Total</td>
        <td style="font-size:15px;font-weight:700;color:#0a0a0a;text-align:right;padding-top:12px;border-top:2px solid #0a0a0a;">${total}</td>
      </tr>
    </table>

    <div style="margin-top:32px;text-align:center;">
      <a href="https://finds.mongoori.com/products" style="display:inline-block;background-color:#0a0a0a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Continue Shopping</a>
    </div>

    <p style="margin:32px 0 0;font-size:13px;color:#888888;line-height:1.6;">We'll send you another email once your order ships. If you have any questions, simply reply to this email.</p>`;

  return htmlWrapper(content);
}

function buildCustomerConfirmationText(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): string {
  const customerName =
    session.customer_details?.name ??
    session.collected_information?.shipping_details?.name ??
    "Valued Customer";
  const total = formatAmount(session.amount_total, session.currency ?? "usd");
  const items = lineItems.map((li) => `  - ${li.description} × ${li.quantity}`).join("\n");
  return [
    `Hi ${customerName},`,
    "",
    "Your order is confirmed! Thank you for shopping at Mongoori Finds.",
    "",
    `Order ID: ${session.id}`,
    `Total: ${total}`,
    "",
    "Items:",
    items,
    "",
    "We'll email you when your order ships.",
    "",
    "— Mongoori Finds",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Customer: Shipping Notification
// ---------------------------------------------------------------------------

export type ShippingStatus = "shipped" | "delivered";

type ShippingEmailData = {
  customerEmail: string;
  customerName: string | null;
  orderId: string;
  shippingStatus: ShippingStatus;
  trackingNumber: string | null;
  shippingAddress: string | null;
  lineItems: Array<{ description: string | null; quantity: number | null; amount: number | null }>;
  currency: string;
  amountTotal: number | null;
};

function buildCustomerShippingHtml(data: ShippingEmailData): string {
  const { customerName, orderId, shippingStatus, trackingNumber, shippingAddress, lineItems, currency, amountTotal } = data;
  const name = customerName ?? "Valued Customer";
  const isDelivered = shippingStatus === "delivered";
  const statusLabel = isDelivered ? "Delivered" : "Shipped";
  const statusColor = isDelivered ? "#16a34a" : "#2563eb";
  const headline = isDelivered ? "Your order has been delivered!" : "Your order is on its way!";
  const subtitle = isDelivered
    ? `Hi ${name}, your Mongoori Finds order has been delivered. We hope you love it!`
    : `Hi ${name}, great news — your order has shipped and is heading your way.`;

  const trackingBlock = trackingNumber
    ? `<div style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;">Tracking Number</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#0c4a6e;font-family:monospace;">${trackingNumber}</p>
      </div>`
    : "";

  const deliveredBadge = `<span style="display:inline-block;background-color:${statusColor};color:#ffffff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${statusLabel}</span>`;

  const content = `
    <div style="margin-bottom:8px;">${deliveredBadge}</div>
    <h1 style="margin:12px 0 8px;font-size:24px;font-weight:700;color:#0a0a0a;letter-spacing:-0.5px;">${headline}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">${subtitle}</p>

    ${trackingBlock}

    <div style="background-color:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order ID</td>
          <td style="font-size:12px;color:#444444;text-align:right;font-family:monospace;">${orderId}</td>
        </tr>
        ${shippingAddress ? `<tr>
          <td style="font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-top:8px;">Ship to</td>
          <td style="font-size:12px;color:#444444;text-align:right;padding-top:8px;">${shippingAddress}</td>
        </tr>` : ""}
        ${amountTotal != null ? `<tr>
          <td style="font-size:12px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-top:8px;">Order Total</td>
          <td style="font-size:12px;color:#444444;text-align:right;padding-top:8px;">${formatAmount(amountTotal, currency)}</td>
        </tr>` : ""}
      </table>
    </div>

    <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#0a0a0a;">Items</h2>
    ${itemsTable(lineItems, currency)}

    <div style="margin-top:32px;text-align:center;">
      <a href="https://finds.mongoori.com/products" style="display:inline-block;background-color:#0a0a0a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Shop Again</a>
    </div>

    <p style="margin:32px 0 0;font-size:13px;color:#888888;line-height:1.6;">Questions about your order? Reply to this email and we'll be happy to help.</p>`;

  return htmlWrapper(content);
}

// ---------------------------------------------------------------------------
// Internal: Supplier order notification (HTML)
// ---------------------------------------------------------------------------

function buildSupplierEmailHtml(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): string {
  const shipping = session.collected_information?.shipping_details;
  const shippingAddress = formatAddress(shipping?.address);
  const customerName =
    session.customer_details?.name ?? shipping?.name ?? "N/A";
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? "N/A";
  const customerPhone = session.customer_details?.phone ?? "N/A";
  const total = formatAmount(session.amount_total, session.currency ?? "usd");
  const orderDate = new Date(session.created * 1000).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const items = buildLineItemsFromStripe(lineItems);

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0a;">New Order — Fulfillment Required</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666666;">Please process and ship the following order.</p>

    <div style="background-color:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Order Details</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;width:120px;">Order ID</td><td style="font-size:13px;color:#1a1a1a;font-family:monospace;">${session.id}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Date</td><td style="font-size:13px;color:#1a1a1a;">${orderDate}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Customer</td><td style="font-size:13px;color:#1a1a1a;">${customerName}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Email</td><td style="font-size:13px;color:#1a1a1a;">${customerEmail}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Phone</td><td style="font-size:13px;color:#1a1a1a;">${customerPhone}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Ship to</td><td style="font-size:13px;color:#1a1a1a;">${shippingAddress}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Total</td><td style="font-size:14px;font-weight:700;color:#0a0a0a;">${total}</td></tr>
      </table>
    </div>

    <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#0a0a0a;">Items to Ship</h2>
    ${itemsTable(items, session.currency ?? "usd")}`;

  return htmlWrapper(content);
}

// ---------------------------------------------------------------------------
// Internal: Admin order notification (HTML)
// ---------------------------------------------------------------------------

function buildAdminEmailHtml(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): string {
  const total = formatAmount(session.amount_total, session.currency ?? "usd");
  const customerName =
    session.customer_details?.name ??
    session.collected_information?.shipping_details?.name ??
    "N/A";
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? "N/A";
  const items = buildLineItemsFromStripe(lineItems);

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0a;">New Order Received</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666666;">A new order has been completed on Mongoori Finds.</p>

    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#16a34a;font-weight:600;">Order Total</p>
      <p style="margin:0;font-size:28px;font-weight:700;color:#15803d;">${total}</p>
    </div>

    <div style="background-color:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;width:120px;">Order ID</td><td style="font-size:13px;color:#1a1a1a;font-family:monospace;">${session.id}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Customer</td><td style="font-size:13px;color:#1a1a1a;">${customerName}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Email</td><td style="font-size:13px;color:#1a1a1a;">${customerEmail}</td></tr>
      </table>
    </div>

    <h2 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#0a0a0a;">Items</h2>
    ${itemsTable(items, session.currency ?? "usd")}`;

  return htmlWrapper(content);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendOrderEmails(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured — skipping order emails");
    return;
  }

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const totalStr = formatAmount(session.amount_total, session.currency ?? "usd");

  // Customer confirmation email
  const customerEmail = session.customer_details?.email ?? session.customer_email;
  if (customerEmail) {
    await transporter.sendMail({
      from,
      to: customerEmail,
      subject: `Order confirmed — ${totalStr}`,
      text: buildCustomerConfirmationText(session, lineItems),
      html: buildCustomerConfirmationHtml(session, lineItems),
    });
  }

  // Supplier fulfillment email
  const supplierEmail = process.env.SUPPLIER_EMAIL;
  if (supplierEmail) {
    await transporter.sendMail({
      from,
      to: supplierEmail,
      subject: `[Mongoori Finds] New order — ${session.id}`,
      html: buildSupplierEmailHtml(session, lineItems),
      text: `New order received: ${session.id}\nTotal: ${totalStr}\nCustomer: ${session.customer_details?.email ?? "N/A"}`,
    });
  }

  // Admin notification
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `[Mongoori Finds] New order — ${totalStr}`,
      html: buildAdminEmailHtml(session, lineItems),
      text: `New order: ${session.id}\nTotal: ${totalStr}`,
    });
  }
}

export async function sendCustomerShippingEmail(
  data: ShippingEmailData
): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured — skipping shipping email");
    return;
  }

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const isDelivered = data.shippingStatus === "delivered";
  const subject = isDelivered
    ? `Your Mongoori Finds order has been delivered`
    : `Your Mongoori Finds order has shipped${data.trackingNumber ? ` — ${data.trackingNumber}` : ""}`;

  const text = [
    `Hi ${data.customerName ?? "there"},`,
    "",
    isDelivered
      ? "Your order has been delivered. We hope you love your new Tesla accessories!"
      : "Your order is on its way!",
    ...(data.trackingNumber ? [`Tracking: ${data.trackingNumber}`] : []),
    `Order ID: ${data.orderId}`,
    "",
    "— Mongoori Finds",
  ].join("\n");

  await transporter.sendMail({
    from,
    to: data.customerEmail,
    subject,
    text,
    html: buildCustomerShippingHtml(data),
  });
}

export async function sendPaymentFailedEmail(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.SMTP_HOST) return;

  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const amount = formatAmount(paymentIntent.amount, paymentIntent.currency);
  const errorMsg = paymentIntent.last_payment_error?.message ?? "Unknown error";

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#dc2626;">Payment Failed</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666666;">A payment attempt has failed on Mongoori Finds.</p>
    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;width:160px;">Payment Intent ID</td><td style="font-size:13px;color:#1a1a1a;font-family:monospace;">${paymentIntent.id}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Amount</td><td style="font-size:13px;color:#1a1a1a;">${amount}</td></tr>
        <tr><td style="font-size:13px;color:#888888;padding:3px 0;">Error</td><td style="font-size:13px;color:#dc2626;">${errorMsg}</td></tr>
      </table>
    </div>`;

  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `[Mongoori Finds] Payment failed — ${amount}`,
    html: htmlWrapper(content),
    text: `Payment failed.\nPayment Intent ID: ${paymentIntent.id}\nAmount: ${amount}\nError: ${errorMsg}`,
  });
}
