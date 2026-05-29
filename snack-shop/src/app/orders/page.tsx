"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import OrderCard from "@/components/order-card";

type OrderItem = { product_id: number; name: string; price: number; quantity: number };
type Order = { id: number; created_at?: string; user_email?: string; items: OrderItem[] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!mounted) return;
      if (profile?.role !== "admin") { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);

      // fetch orders; expects orders and order_items tables
      // try to select with embedded items
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, user_email, order_items(product_id, name, price, quantity)");

      if (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      } else if (data) {
        // transform to our Order type
          type OrderRow = {
            id: number;
            created_at?: string;
            user_email?: string;
            order_items?: { product_id: number; name: string; price: number; quantity: number }[];
          };
          const typed = data as OrderRow[];
          const transformed = typed.map((o) => ({
            id: o.id,
            created_at: o.created_at,
            user_email: o.user_email,
            items: (o.order_items || []).map((it) => ({
              product_id: it.product_id,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
            })),
          }));
          setOrders(transformed);
      }

      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!isAdmin) return <div className="p-10">Bạn không có quyền xem đơn hàng</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Danh sách đơn hàng</h1>
      {orders.length === 0 ? (
        <p>Không có đơn hàng</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
