"use client";

import { useState, useEffect, useRef } from "react";
import { X, ImageIcon, Package, Loader2, Trash2, Plus } from "lucide-react";
import type { Product, ProductFormData } from "../types";
import type { Translations } from "../i18n";
import { uploadImages } from "@/lib/image-upload";
import { useCategories } from "@/hooks/useApi";

interface Props {
  mode: "create" | "edit";
  product?: Product | null;
  tr: Translations;
  dir: "ltr" | "rtl";
  loading: boolean;
  storeId: string;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
}

const EMPTY_FORM: any = {
  title: "",
  description: "",
  price: "",
  stock: "",
  images: [],
  category_id: "",
  variants: [],
};

export default function ProductFormModal({
  mode,
  product,
  tr,
  storeId,
  dir,
  loading,
  onSubmit,
  onClose,
}: Props) {
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  const { data: rawCategoriesData } = useCategories(storeId);
  const categories = Array.isArray(rawCategoriesData)
    ? rawCategoriesData
    : (rawCategoriesData as any)?.data ||
      (rawCategoriesData as any)?.categories ||
      [];

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        title: product.title,
        description: product.description ?? "",
        price: String(product.price),
        stock: String(product.stock),
        images: product.images ?? [],
        category_id: (product as any).category_id ?? "",
        variants: (product as any).variants ?? [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [mode, product]);

  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  function validate(): boolean {
    const errs: Partial<Record<keyof ProductFormData, string>> = {};

    if (!form.title.trim()) errs.title = tr.titleRequired;

    const p = parseFloat(form.price);
    if (isNaN(p) || p <= 0) errs.price = tr.priceRequired;

    const s = parseInt(form.stock);
    if (form.stock !== "" && (isNaN(s) || s < 0)) errs.stock = tr.stockInvalid;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || uploading) return;

    const cleanedForm = {
      ...form,
      variants: form.variants.filter((v: any) => v.name.trim() !== ""),
    };

    onSubmit(cleanedForm);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert(tr.maxImagesError || "Maximum 5 images per upload");
        return;
      }
      setUploading(true);
      setUploadProgress(tr.uploading || "Uploading images...");
      const result = await uploadImages(files);
      setForm((f: any) => ({
        ...f,
        images: [...f.images, ...result.urls],
      }));
      setUploadProgress("");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload images");
      setUploadProgress("");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  function removeImage(idx: number) {
    setForm((f: any) => ({
      ...f,
      images: f.images.filter((_: any, i: number) => i !== idx),
    }));
  }

  function field(key: string, val: string) {
    setForm((f: any) => ({ ...f, [key]: val }));
    if (errors[key as keyof ProductFormData])
      setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const addVariant = () => {
    const newVariant = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: "",
      price_override: "",
      stock: 0,
      attributes: {},
    };
    setForm((f: any) => ({
      ...f,
      variants: [...(f.variants || []), newVariant],
    }));
  };

  const updateVariant = (id: string, field: string, value: string | number) => {
    setForm((f: any) => ({
      ...f,
      variants: f.variants.map((v: any) =>
        v.id === id ? { ...v, [field]: value } : v,
      ),
    }));
  };

  const removeVariant = (id: string) => {
    setForm((f: any) => ({
      ...f,
      variants: f.variants.filter((v: any) => v.id !== id),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      dir={dir}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white w-full rounded-t-xl md:rounded-2xl shadow-2xl md:max-w-lg max-h-[90vh] flex flex-col animate-fade-up md:animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 md:py-5 border-b border-[rgb(244_242_245)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgb(60_28_84)] flex items-center justify-center">
              <Package
                className="w-4.5 h-4.5 text-white"
                style={{ width: 18, height: 18 }}
              />
            </div>
            <h3 className="text-base font-bold text-[rgb(60_28_84)]">
              {mode === "create" ? tr.addProductTitle : tr.editProductTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading || uploading}
            className="p-2 -mr-2 text-[rgb(60_28_84)]/40 hover:text-[rgb(60_28_84)] hover:bg-[rgb(244_242_245)] rounded-full transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          id="product-form"
          className="overflow-y-auto flex-1 px-6 py-5 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60 mb-1.5 uppercase tracking-wide">
              {tr.productName} <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder={tr.productNamePlaceholder}
              dir={dir}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none transition-all
                ${errors.title ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"}`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60 mb-1.5 uppercase tracking-wide">
              {tr.description}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder={tr.descriptionPlaceholder}
              rows={3}
              dir={dir}
              className="w-full px-4 py-3 rounded-xl border border-[rgb(207_195_223)] bg-[rgb(244_242_245)] text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none resize-none transition-all focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60 mb-1.5 uppercase tracking-wide">
                {tr.priceLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => field("price", e.target.value)}
                placeholder={tr.pricePlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none transition-all
                  ${errors.price ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"}`}
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60 mb-1.5 uppercase tracking-wide">
                {tr.stockLabel}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => field("stock", e.target.value)}
                placeholder={tr.stockPlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none transition-all
                  ${errors.stock ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"}`}
              />
              {errors.stock && (
                <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Variants Section */}
          <div className="pt-4 border-t border-[rgb(244_242_245)]">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60 uppercase tracking-wide">
                {dir === "rtl"
                  ? "خيارات المنتج (ألوان، مقاسات...)"
                  : "Product Variants (Colors, Sizes...)"}
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 text-[10px] font-bold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] px-3 py-2 rounded-lg hover:bg-[rgb(207_195_223)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {dir === "rtl" ? "إضافة خيار" : "Add Variant"}
              </button>
            </div>

            {form.variants?.length > 0 && (
              <div className="space-y-3">
                {form.variants.map((variant: any, index: number) => (
                  <div
                    key={variant.id}
                    className="flex gap-3 items-start bg-[rgb(244_242_245)]/50 p-4 rounded-xl border border-[rgb(244_242_245)]"
                  >
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(variant.id, "name", e.target.value)
                        }
                        placeholder={
                          dir === "rtl"
                            ? "الاسم (مثال: أحمر / XL)"
                            : "Name (e.g., Red / XL)"
                        }
                        className="w-full px-3 py-2.5 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)]"
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder={
                            dir === "rtl"
                              ? "سعر مختلف (اختياري)"
                              : "Custom Price (Opt)"
                          }
                          value={variant.price_override || ""}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "price_override",
                              e.target.value,
                            )
                          }
                          className="w-1/2 px-3 py-2.5 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)]"
                        />
                        <input
                          type="number"
                          placeholder={dir === "rtl" ? "الكمية" : "Stock"}
                          value={variant.stock || ""}
                          onChange={(e) =>
                            updateVariant(
                              variant.id,
                              "stock",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-1/2 px-3 py-2.5 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="p-2.5 text-red-500 bg-white hover:bg-red-50 rounded-lg border border-[rgb(244_242_245)] transition-colors mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5 pt-4 border-t border-[rgb(244_242_245)]">
            <label className="text-xs font-bold text-[rgb(60_28_84)]/60 uppercase tracking-wide">
              {dir === "rtl" ? "ربط بتصنيف المنتجات *" : "Link to Category *"}
            </label>
            <select
              required
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className="w-full px-4 py-3 bg-[rgb(244_242_245)] border border-[rgb(207_195_223)] rounded-xl text-sm text-[rgb(60_28_84)] outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10 focus:border-[rgb(60_28_84)] transition-all"
              dir={dir}
            >
              <option value="" disabled>
                {dir === "rtl" ? "اختر تصنيفاً..." : "Select category..."}
              </option>
              {categories?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Images Section */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60 mb-3 uppercase tracking-wide">
              {tr.imagesLabel || "Product Images"}
            </label>

            {uploading && uploadProgress && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <p className="text-xs text-blue-700 font-medium">
                    {uploadProgress}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              {form.images.map((url: string, idx: number) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-[rgb(207_195_223)] bg-[rgb(244_242_245)]"
                >
                  <img
                    src={url}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={uploading || loading}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white rounded-full p-2 shadow-md disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <label
                className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed transition-all bg-[rgb(244_242_245)] ${uploading || loading ? "border-[rgb(60_28_84)]/40 cursor-not-allowed opacity-50" : "border-[rgb(207_195_223)] hover:border-[rgb(60_28_84)] hover:bg-white cursor-pointer"}`}
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-[rgb(60_28_84)] animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-[rgb(60_28_84)]/40 mb-1" />
                    <span className="text-[10px] font-bold text-[rgb(60_28_84)]/60">
                      {tr.addImageUrl || "Upload"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  disabled={uploading || loading}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-3">
              {tr.imageUploadHint ||
                "Maximum 5 images per upload. Supported: JPEG, PNG, WebP, GIF (max 5MB each)"}
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 pb-8 md:pb-4 border-t border-[rgb(244_242_245)]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="flex-1 py-3 md:py-2.5 rounded-xl border border-[rgb(207_195_223)] text-[rgb(60_28_84)] text-sm font-semibold hover:bg-[rgb(244_242_245)] transition-colors disabled:opacity-50"
          >
            {tr.cancel}
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading || uploading || form.title.trim() === ""}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-2.5 rounded-xl bg-[rgb(60_28_84)] text-white text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-colors disabled:opacity-60 shadow-md shadow-[rgb(60_28_84)]/20"
          >
            {(loading || uploading) && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {uploading
              ? tr.uploading || "Uploading..."
              : loading
                ? tr.saving
                : mode === "create"
                  ? tr.create
                  : tr.save}
          </button>
        </div>
      </div>
    </div>
  );
}
