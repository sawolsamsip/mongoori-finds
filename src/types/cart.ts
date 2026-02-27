export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
};

// Stripe-ready: shape for future checkout session line items
export type CheckoutLineItem = {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images?: string[];
      description?: string;
    };
    unit_amount: number; // cents
  };
  quantity: number;
};
