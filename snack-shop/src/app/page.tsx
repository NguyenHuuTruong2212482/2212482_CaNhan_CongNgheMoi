"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import ProductCard from "@/components/product-card";
import AdminAddProduct from "@/components/admin-add-product";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  useEffect(() => {
    const getProducts = async () => {
      const { data } = await supabase.from("products").select("*");

      if (data) setProducts(data);
    };

    getProducts();

    router.refresh();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-5xl font-bold">Welcome to Snack Shop</h1>

      <AdminAddProduct />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
