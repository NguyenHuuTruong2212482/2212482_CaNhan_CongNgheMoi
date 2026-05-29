"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/types/product";

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  const [showToast, setShowToast] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // edit modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editPriceDisplay, setEditPriceDisplay] = useState("");
  const editPriceRef = useRef<HTMLInputElement | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editAmountDisplay, setEditAmountDisplay] = useState("");
  const editAmountRef = useRef<HTMLInputElement | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (data) setProduct(data);
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        if (mounted) setIsCheckingAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (mounted) {
        setIsAdmin(Boolean(data?.role === "admin"));
        setIsCheckingAdmin(false);
      }
    };

    load();
    return () => {
      mounted = false;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const addToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isAdmin) return; // admins don't add to cart

    if (!product) return;
    if (product.amount <= 0) {
      setShowToast("Hết hàng");
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setShowToast(null), 2000);
      return;
    }

    const cart: Product[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      const curQty = existing.quantity || 1;
      if (curQty >= product.amount) {
        setShowToast("Không đủ hàng");
      } else {
        existing.quantity = curQty + 1;
        setShowToast(`Đã tăng số lượng ${product.name}`);
      }
    } else {
      cart.push({ ...product, quantity: 1 });
      setShowToast(`Đã thêm ${product.name} vào giỏ`);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setShowToast(null), 2000);
  };

  const openEditModal = () => {
    if (!product) return;
    setEditName(product.name);
    setEditPrice(product.price);
    setEditPriceDisplay(
      product.price ? product.price.toLocaleString("vi-VN") : "",
    );
    setEditAmount(product.amount || 0);
    setEditAmountDisplay(product.amount ? String(product.amount) : "");
    setEditDescription(product.description || "");
    setEditFile(null);
    setOpenEdit(true);
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Xác nhận xóa sản phẩm: ${product.name}?`)) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);
    if (error) {
      alert("Xóa thất bại: " + error.message);
      return;
    }

    alert("Xóa thành công");
    router.push("/");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = product?.image || "";
      if (editFile) {
        const fileName = `product-${Date.now()}-${editFile.name}`;
        const { error: upErr } = await supabase.storage
          .from("products")
          .upload(fileName, editFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);
        imageUrl = urlData?.publicUrl || imageUrl;
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: editName,
          price: Math.round(editPrice),
          image: imageUrl,
          description: editDescription,
          amount: Math.round(editAmount),
        })
        .eq("id", product?.id);

      if (error) throw error;

      alert("Cập nhật thành công");
      setOpenEdit(false);
      // refresh product
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();
      if (data) setProduct(data);
    } catch (err: unknown) {
      alert("Lỗi: " + (err as Error).message || JSON.stringify(err));
    } finally {
      setSaving(false);
    }
  };

  if (!product) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <img
        src={product.image}
        className="w-full h-80 object-cover rounded-xl"
      />

      <h1 className="text-3xl font-bold mt-4">{product.name}</h1>

      <p className="text-xl text-gray-700 mt-2">
        {product.price.toLocaleString()} VNĐ
      </p>

      <p className="text-sm text-gray-500 mt-1">Còn: {product.amount ?? "-"}</p>

      <div className="mt-4 text-gray-800 whitespace-pre-line">
        {product.description || (
          <em className="text-gray-500">Chưa có mô tả cho sản phẩm này.</em>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {!isAdmin && !isCheckingAdmin && (
          <button
            onClick={addToCart}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Thêm vào giỏ
          </button>
        )}

        {isCheckingAdmin && <div className="text-gray-500">Checking...</div>}

        {isAdmin && (
          <>
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Sửa
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Xóa
            </button>
          </>
        )}
      </div>

      {showToast && (
        <div className="fixed top-6 right-6 bg-black text-white px-3 py-2 rounded shadow">
          {showToast}
        </div>
      )}

      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-black text-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Sửa sản phẩm</h3>
            <form onSubmit={(e) => handleSave(e)} className="space-y-3">
              <input
                required
                className="w-full p-2 border rounded"
                placeholder="Tên"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              {/* Edit price (masked) */}
              <input
                required
                type="text"
                inputMode="numeric"
                ref={editPriceRef}
                className="w-full p-2 border rounded"
                placeholder="Giá"
                value={editPriceDisplay}
                onChange={(e) => {
                  const el = e.target as HTMLInputElement;
                  const cursor = el.selectionStart || 0;
                  const rawBeforeCursor = el.value
                    .slice(0, cursor)
                    .replace(/\D/g, "");
                  const raw = el.value.replace(/\D/g, "");
                  const num = raw ? Number(raw) : 0;
                  setEditPrice(num);
                  const formatted = raw ? num.toLocaleString("vi-VN") : "";
                  setEditPriceDisplay(formatted);
                  requestAnimationFrame(() => {
                    if (!editPriceRef.current) return;
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
                    editPriceRef.current.setSelectionRange(pos, pos);
                  });
                }}
              />

              {/* Edit amount (masked) */}
              <input
                required
                type="text"
                inputMode="numeric"
                ref={editAmountRef}
                className="w-full p-2 border rounded"
                placeholder="Số lượng"
                value={editAmountDisplay}
                onChange={(e) => {
                  const el = e.target as HTMLInputElement;
                  const cursor = el.selectionStart || 0;
                  const rawBeforeCursor = el.value
                    .slice(0, cursor)
                    .replace(/\D/g, "");
                  const raw = el.value.replace(/\D/g, "");
                  const num = raw ? Number(raw) : 0;
                  setEditAmount(num);
                  const formatted = raw ? num.toLocaleString("vi-VN") : "";
                  setEditAmountDisplay(formatted);
                  requestAnimationFrame(() => {
                    if (!editAmountRef.current) return;
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
                    editAmountRef.current.setSelectionRange(pos, pos);
                  });
                }}
              />

              <textarea
                className="w-full p-2 border rounded"
                placeholder="Mô tả"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />

              <div className="mt-2">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setEditFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                  <span className="text-teal-400 underline decoration-teal-400 hover:text-teal-300">
                    Chọn tệp ảnh
                  </span>
                  <span className="text-sm text-gray-700 ml-2">
                    {editFile ? editFile.name : "Không đổi ảnh"}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEdit(false);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {saving ? "Đang..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
