"use client";

import Link from "next/link";
import { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const addToCart = (e: React.MouseEvent) => {
    // chặn click lan ra Link
    e.preventDefault();
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existing = cart.find((item: Product) => item.id === product.id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="border rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer">
        <img src={product.image} className="w-full h-48 object-cover rounded" />

        <h2 className="text-xl font-bold mt-3">{product.name}</h2>

        <p className="text-gray-500">{product.price.toLocaleString()} VNĐ</p>

        {/* BUTTON ADD TO CART */}
        <button
          onClick={addToCart}
          className="w-full mt-3 py-2 bg-blue-600 text-white rounded"
        >
          Add To Cart
        </button>
      </div>
    </Link>
  );
}
