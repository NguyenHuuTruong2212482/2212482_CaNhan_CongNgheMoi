"use client";

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/types/product";

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setProduct(data);
    };

    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <img
        src={product.image}
        className="w-full h-80 object-cover rounded-xl"
      />

      <h1>{product.name}</h1>
    </div>
  );
}
