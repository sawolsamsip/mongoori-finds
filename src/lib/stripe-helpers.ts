import type { CartItem } from "@/types/cart";
import type { CheckoutLineItem } from "@/types/cart";

/**
 * Convert cart items to Stripe Checkout Session line_items shape.
 * Use in API route: stripe.checkout.sessions.create({ line_items: getStripeLineItems(items) })
 * No Stripe keys required in this file—caller uses env.
 */
export function getStripeLineItems(items: CartItem[]): CheckoutLineItem[] {
  return items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));
}
