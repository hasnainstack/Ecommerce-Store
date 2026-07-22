"use client";

import { useParams } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";

const MOCK_PRODUCT = {
  id: 1,
  name: "Wireless Headphones Pro",
  slug: "wireless-headphones-pro",
  description: "Experience premium sound quality with our flagship wireless headphones. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions for all-day wear.",
  base_price: 149.99,
  category_id: 1,
  is_active: true,
  images: [],
  variants: [
    { id: 1, price_override: null, stock_qty: 25, attributes: '{"color": "Matte Black"}' },
    { id: 2, price_override: 169.99, stock_qty: 10, attributes: '{"color": "Silver White"}' },
  ],
  category: { name: "Electronics" },
};

export default function ProductPage() {
  const params = useParams();

  return <ProductDetail product={MOCK_PRODUCT} />;
}
