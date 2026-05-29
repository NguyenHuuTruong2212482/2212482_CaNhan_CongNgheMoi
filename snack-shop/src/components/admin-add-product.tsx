"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminAddProduct() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [priceDisplay, setPriceDisplay] = useState("");
  const priceInputRef = React.useRef<HTMLInputElement | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [amountDisplay, setAmountDisplay] = useState("");
  const amountInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (mounted) setIsAdmin(data?.role === "admin");
    };
    check();
    return () => {
      mounted = false;
    };
  }, []);

  const reset = () => {
    setName("");
    setPrice(0);
    setPriceDisplay("");
    setDescription("");
    setAmount(0);
    setAmountDisplay("");
    setFile(null);
  };

  const handleUploadAndInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return alert("Không có quyền");

    setLoading(true);
    try {
      let imageUrl = "";
      if (file) {
        const fileName = `product-${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("products")
          .upload(fileName, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);
        imageUrl = urlData?.publicUrl || "";
      }

      const { error: insertErr } = await supabase.from("products").insert({
        name,
        price: Math.round(price),
        image: imageUrl,
        description,
        amount: Math.round(amount),
      });

      if (insertErr) throw insertErr;

      alert("Thêm sản phẩm thành công");
      reset();
      setOpen(false);
      // reload to show new product (simple)
      window.location.reload();
    } catch (err: unknown) {
      alert("Lỗi: " + (err as Error).message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded mb-2"
      >
        Thêm sản phẩm
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-black text-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Thêm sản phẩm mới</h3>
            <form onSubmit={handleUploadAndInsert} className="space-y-3">
              <input
                required
                className="w-full p-2 border rounded"
                placeholder="Tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {/* Giá (mask hàng nghìn) */}
              <input
                required
                type="text"
                inputMode="numeric"
                ref={priceInputRef}
                className="w-full p-2 border rounded"
                placeholder="Giá"
                value={priceDisplay}
                onChange={(e) => {
                  const el = e.target as HTMLInputElement;
                  const cursor = el.selectionStart || 0;
                  const rawBeforeCursor = el.value
                    .slice(0, cursor)
                    .replace(/\D/g, "");
                  const raw = el.value.replace(/\D/g, "");
                  const num = raw ? Number(raw) : 0;
                  setPrice(num);
                  const formatted = raw ? num.toLocaleString("vi-VN") : "";
                  setPriceDisplay(formatted);

                  requestAnimationFrame(() => {
                    if (!priceInputRef.current) return;
                    const s = formatted;
                    let digitCount = 0;
                    let pos = 0;
                    if (rawBeforeCursor.length === 0) pos = 0;
                    for (let i = 0; i < s.length; i++) {
                      if (/[0-9]/.test(s[i])) digitCount++;
                      if (digitCount >= rawBeforeCursor.length) {
                        pos = i + 1;
                        break;
                      }
                    }
                    priceInputRef.current.setSelectionRange(pos, pos);
                  });
                }}
              />

              {/* Số lượng (mask) */}
              <input
                required
                type="text"
                inputMode="numeric"
                ref={amountInputRef}
                className="w-full p-2 border rounded"
                placeholder="Số lượng"
                value={amountDisplay}
                onChange={(e) => {
                  const el = e.target as HTMLInputElement;
                  const cursor = el.selectionStart || 0;
                  const rawBeforeCursor = el.value
                    .slice(0, cursor)
                    .replace(/\D/g, "");
                  const raw = el.value.replace(/\D/g, "");
                  const num = raw ? Number(raw) : 0;
                  setAmount(num);
                  const formatted = raw ? num.toLocaleString("vi-VN") : "";
                  setAmountDisplay(formatted);

                  requestAnimationFrame(() => {
                    if (!amountInputRef.current) return;
                    const s = formatted;
                    let digitCount = 0;
                    let pos = 0;
                    if (rawBeforeCursor.length === 0) pos = 0;
                    for (let i = 0; i < s.length; i++) {
                      if (/[0-9]/.test(s[i])) digitCount++;
                      if (digitCount >= rawBeforeCursor.length) {
                        pos = i + 1;
                        break;
                      }
                    }
                    amountInputRef.current.setSelectionRange(pos, pos);
                  });
                }}
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="mt-2">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                  <span className="text-teal-400 underline decoration-teal-400 hover:text-teal-300">
                    Chọn tệp ảnh
                  </span>
                  <span className="text-sm text-gray-300 ml-2">
                    {file ? file.name : "Chưa có tệp"}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {loading ? "Đang..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
