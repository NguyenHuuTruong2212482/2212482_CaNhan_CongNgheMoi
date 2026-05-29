"use client";

import React from "react";

type OrderItem = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  created_at?: string;
  user_email?: string;
  items: OrderItem[];
};

export default function OrderCard({ order }: { order: Order }) {
  const total = order.items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <div className="border p-4 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600">Order #{order.id}</div>
        <div className="text-sm text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</div>
      </div>

      <div className="mb-2">
        <div className="font-semibold">Người mua:</div>
        <div className="text-sm">{order.user_email}</div>
      </div>

      <div className="mb-2">
        <div className="font-semibold">Sản phẩm:</div>
        <ul className="text-sm list-disc list-inside">
          {order.items.map((it, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{it.name} x{it.quantity}</span>
              <span>{(it.price * it.quantity).toLocaleString()} VNĐ</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-right font-bold">Total: {total.toLocaleString()} VNĐ</div>
    </div>
  );
}
