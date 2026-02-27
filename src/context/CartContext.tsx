"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/lib/products";

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD"; payload: { product: Product; quantity?: number } }
  | { type: "REMOVE"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
          },
        ],
      };
    }
    case "REMOVE":
      return {
        items: state.items.filter((i) => i.productId !== action.payload.productId),
      };
    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.productId !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback((product: Product, quantity = 1) => {
    dispatch({ type: "ADD", payload: { product, quantity } });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE", payload: { productId } });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        count,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
