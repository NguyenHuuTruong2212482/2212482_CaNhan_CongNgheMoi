"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { supabase } from "@/lib/supabase/client";

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }
    return [];
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  const save = (newCart: Product[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    save(newCart);
  };

  const updateQty = (index: number, qty: number) => {
    if (qty < 1) return;
    const newCart = [...cart];
    const item = newCart[index];
    const max = item.amount ?? Infinity;
    if (qty > max) {
      alert("Không đủ hàng trong kho");
      return;
    }
    item.quantity = qty;
    save(newCart);
  };

  const router = useRouter();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // ensure user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) {
      alert("Vui lòng đăng nhập để thanh toán");
      router.push("/login");
      return;
    }

    // chuẩn bị payload: [{id, qty}, ...]
    const itemsForRpc = cart.map((i) => ({ id: Number(i.id), qty: Number(i.quantity || 1) }));

    // gọi RPC tạo order (tạo order + items + trừ tồn trong 1 transaction)
    const { data, error } = await supabase.rpc("create_order_from_cart", { items: itemsForRpc });
    if (error) {
      alert("Thanh toán lỗi: " + error.message);
      return;
    }

    // data là order_id trả về từ function
    alert(`Thanh toán thành công! Mã đơn: ${data}`);
    save([]);
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
                  <p className="text-sm text-gray-600">
                    Còn: {item.amount ?? "-"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(index, (item.quantity || 1) - 1)}
                    className="px-3 py-1 bg-gray-200 rounded text-gray-700"
                  >
                    -
                  </button>

                  <span className="px-3">{item.quantity || 1}</span>

                  <button
                    onClick={() => updateQty(index, (item.quantity || 1) + 1)}
                    className="px-3 py-1 bg-gray-200 rounded text-gray-700"
                    disabled={(item.quantity || 1) >= (item.amount ?? Infinity)}
                  >
                    +
                  </button>
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
