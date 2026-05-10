"use client";

import { useState } from "react";
import { Product } from "@/types/product";

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }

    return [];
  });

  // tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // xóa sản phẩm
  const removeItem = (index: number) => {
    const newCart = [...cart];

    newCart.splice(index, 1);

    setCart(newCart);

    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // thanh toán
  const handleCheckout = () => {
    if (cart.length === 0) return;

    alert(`Thanh toán thành công!\nTổng tiền: ${total.toLocaleString()} VNĐ`);

    // clear cart
    setCart([]);
    localStorage.removeItem("cart");
  };
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border p-4 rounded-xl"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="text-xl font-bold">{item.name}</h2>

                  <p className="text-gray-500">
                    {item.price.toLocaleString()} VNĐ
                  </p>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold mt-8">
            Total: {total.toLocaleString()} VNĐ
          </h2>
          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Thanh toán
          </button>
        </>
      )}
    </div>
  );
}
