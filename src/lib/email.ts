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
  return `$${((cents ?? 0) / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function buildOrderDetails(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): string {
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
    : "N/A";

  const itemsList = lineItems
    .map(
      (li) =>
        `  - ${li.description} × ${li.quantity}  (${formatAmount(li.amount_total, session.currency ?? "usd")})`
    )
    .join("\n");

  return [
    `주문 ID: ${session.id}`,
    `주문 시각: ${new Date(session.created * 1000).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
    `고객명: ${session.customer_details?.name ?? session.collected_information?.shipping_details?.name ?? "N/A"}`,
    `이메일: ${session.customer_details?.email ?? session.customer_email ?? "N/A"}`,
    `전화: ${session.customer_details?.phone ?? "N/A"}`,
    ``,
    `배송 주소:`,
    shippingAddress,
    ``,
    `주문 상품:`,
    itemsList,
    ``,
    `총액: ${formatAmount(session.amount_total, session.currency ?? "usd")}`,
  ].join("\n");
}

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
  const orderDetails = buildOrderDetails(session, lineItems);
  const totalStr = formatAmount(session.amount_total, session.currency ?? "usd");

  const supplierEmail = process.env.SUPPLIER_EMAIL;
  if (supplierEmail) {
    await transporter.sendMail({
      from,
      to: supplierEmail,
      subject: `[Mongoori Finds] 신규 주문 발송 요청 - ${session.id}`,
      text: [
        "안녕하세요,",
        "",
        "Mongoori Finds에서 새로운 주문이 접수되었습니다.",
        "아래 정보를 확인하여 배송 처리해 주세요.",
        "",
        orderDetails,
        "",
        "감사합니다,",
        "Mongoori Finds",
      ].join("\n"),
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `[Mongoori Finds] 신규 주문 알림 - ${totalStr}`,
      text: ["새로운 주문이 완료되었습니다.", "", orderDetails].join("\n"),
    });
  }
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

  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `[Mongoori Finds] 결제 실패 알림`,
    text: [
      "결제 실패가 발생했습니다.",
      "",
      `Payment Intent ID: ${paymentIntent.id}`,
      `금액: ${amount}`,
      `오류: ${errorMsg}`,
    ].join("\n"),
  });
}
