"use client";

import { useState, useEffect, useRef } from "react";
import { X, ImageIcon, Package, Loader2, Trash2, Plus, Info, Pin, Star } from "lucide-react";
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
  discount_price: "",
  stock: "",
  images: [],
  category_id: "",
  variants: [],
  pin: false,
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
    Partial<Record<keyof ProductFormData | "discount_price", string>>
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
        discount_price:
          product.discount_price !== null && product.discount_price !== undefined
            ? String(product.discount_price)
            : "",
        stock: String(product.stock),
        images: product.images ?? [],
        category_id: (product as any).category_id ?? "",
        variants: (product as any).variants ?? [],
        pin: Boolean((product as any).pin),
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
    const errs: Partial<Record<keyof ProductFormData | "discount_price", string>> = {};

    if (!form.title.trim()) errs.title = tr.titleRequired;

    const p = parseFloat(form.price);
    if (isNaN(p) || p < 0) errs.price = tr.priceRequired || "Valid price required";

    if (form.discount_price !== "" && form.discount_price !== null) {
      const dp = parseFloat(form.discount_price);
      if (isNaN(dp) || dp < 0) {
        errs.discount_price = dir === "rtl" ? "سعر خصم غير صالح" : "Invalid discount price";
      }
    }

    const s = parseInt(form.stock);
    if (form.stock !== "" && (isNaN(s) || s < 0)) errs.stock = tr.stockInvalid || "Invalid stock";

    setErrors(errs as any);
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

  function makeMainImage(idx: number) {
    setForm((f: any) => {
      const newImages = [...f.images];
      const [selected] = newImages.splice(idx, 1);
      newImages.unshift(selected); // Move to front
      return { ...f, images: newImages };
    });
  }

  function field(key: string, val: any) {
    setForm((f: any) => ({ ...f, [key]: val }));
    if (errors[key as keyof typeof errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
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

  const updateVariant = (id: string, updateField: string, value: string | number) => {
    setForm((f: any) => ({
      ...f,
      variants: f.variants.map((v: any) =>
        v.id === id ? { ...v, [updateField]: value } : v,
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
        className="absolute inset-0 bg-[rgb(60_28_84)]/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white w-full rounded-t-2xl md:rounded-3xl shadow-2xl md:max-w-xl max-h-[95vh] md:max-h-[90vh] flex flex-col animate-fade-up md:animate-scale-in overflow-hidden border border-[rgb(244_242_245)]">
        <div className="flex items-center justify-between px-6 py-4 md:py-5 border-b border-[rgb(244_242_245)] bg-white/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgb(60_28_84)] flex items-center justify-center shadow-md shadow-[rgb(60_28_84)]/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[rgb(60_28_84)] leading-tight">
                {mode === "create" ? tr.addProductTitle || "Add Product" : tr.editProductTitle || "Edit Product"}
              </h3>
              <p className="text-[10px] text-[rgb(60_28_84)]/60 font-medium mt-0.5">
                {dir === "rtl" ? "أدخل تفاصيل ومواصفات المنتج" : "Enter product details and specs"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || uploading}
            className="p-2.5 -mr-2 text-[rgb(60_28_84)]/40 hover:text-[rgb(60_28_84)] hover:bg-[rgb(244_242_245)] rounded-full transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          id="product-form"
          className="overflow-y-auto flex-1 px-6 py-6 space-y-7"
        >
          {/* Title Section */}
          <div>
            <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2 uppercase tracking-wide">
              {tr.productName} <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder={tr.productNamePlaceholder}
              dir={dir}
              className={`w-full px-4 py-3.5 rounded-xl border text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none transition-all
                ${errors.title ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"}`}
            />
            {errors.title && (
              <p className="text-xs font-medium text-red-500 mt-1.5">{errors.title}</p>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2 uppercase tracking-wide">
                {tr.priceLabel || "Price"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => field("price", e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none transition-all
                    ${errors.price ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"}`}
                />
              </div>
              {errors.price && (
                <p className="text-xs font-medium text-red-500 mt-1.5">{errors.price}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2 uppercase tracking-wide">
                {dir === "rtl" ? "سعر الخصم (اختياري)" : "Discount Price (Opt)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_price}
                  onChange={(e) => field("discount_price", e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm text-emerald-700 font-semibold placeholder-[rgb(60_28_84)]/30 outline-none transition-all
                    ${errors.discount_price ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] focus:border-emerald-500 focus:bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500/10"}`}
                />
              </div>
              {errors.discount_price && (
                <p className="text-xs font-medium text-red-500 mt-1.5">{errors.discount_price as string}</p>
              )}
            </div>
          </div>

          {/* Stock & Pinning Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2 uppercase tracking-wide">
                {tr.stockLabel || "Stock"}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => field("stock", e.target.value)}
                placeholder={tr.stockPlaceholder || "0"}
                className={`w-full px-4 py-3.5 rounded-xl border text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none transition-all
                  ${errors.stock ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"}`}
              />
              {errors.stock && (
                <p className="text-xs font-medium text-red-500 mt-1.5">{errors.stock}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2 uppercase tracking-wide opacity-0 hidden md:block">
                Pin Action
              </label>
              <div
                onClick={() => field("pin", !form.pin)}
                className={`w-full px-4 py-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none
                  ${form.pin ? "border-[rgb(60_28_84)] bg-[rgb(60_28_84)]/5 shadow-sm" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)] hover:bg-white"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Pin className={`w-4 h-4 ${form.pin ? "text-[rgb(60_28_84)]" : "text-[rgb(60_28_84)]/40"}`} />
                  <span className={`text-sm font-semibold ${form.pin ? "text-[rgb(60_28_84)]" : "text-[rgb(60_28_84)]/60"}`}>
                    {dir === "rtl" ? "تثبيت في المتجر" : "Pin in store"}
                  </span>
                </div>
                
                {/* Premium Tailwind Toggle Switch */}
                <button
                  type="button"
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.pin ? "bg-[rgb(60_28_84)]" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      form.pin
                        ? dir === "rtl" ? "-translate-x-4" : "translate-x-4"
                        : dir === "rtl" ? "-translate-x-1" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2 uppercase tracking-wide">
              {tr.description || "Description"}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder={tr.descriptionPlaceholder || "Describe your product..."}
              rows={3}
              dir={dir}
              className="w-full px-4 py-3.5 rounded-xl border border-[rgb(207_195_223)] bg-[rgb(244_242_245)] text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/30 outline-none resize-none transition-all focus:border-[rgb(60_28_84)] focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide">
              {dir === "rtl" ? "ربط بتصنيف المنتجات *" : "Link to Category *"}
            </label>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-3.5 bg-[rgb(244_242_245)] border border-[rgb(207_195_223)] rounded-xl text-sm text-[rgb(60_28_84)] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/10 focus:border-[rgb(60_28_84)] transition-all cursor-pointer"
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

          {/* Images Section with Cover Image Merchandising */}
          <div className="pt-4 border-t border-[rgb(244_242_245)]">
            <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-3 uppercase tracking-wide">
              {tr.imagesLabel || "Product Images"}
            </label>

            {/* Main Image Explainer - Only visible when multiple images exist */}
            {form.images.length > 1 && (
              <div className="mb-4 flex items-start gap-3 p-3.5 bg-[rgb(60_28_84)]/5 border border-[rgb(60_28_84)]/10 rounded-xl">
                <Info className="w-5 h-5 text-[rgb(60_28_84)] shrink-0" />
                <p className="text-xs font-medium text-[rgb(60_28_84)]/80 leading-relaxed">
                  {dir === "rtl"
                    ? "الصورة الأولى التي تحمل شارة 'الغلاف الرئيسي' هي التي ستظهر كواجهة للمنتج. انقر على 'تعيين كغلاف' على أي صورة أخرى لتغييرها."
                    : "The first image with the 'Main Cover' badge will be used as the product card thumbnail. Click 'Make Cover' on any image to change it."}
                </p>
              </div>
            )}

            {uploading && uploadProgress && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <p className="text-xs text-blue-700 font-medium">{uploadProgress}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {form.images.map((url: string, idx: number) => (
                <div
                  key={idx}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all
                    ${idx === 0 ? "border-[rgb(60_28_84)] shadow-md" : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)]"}`}
                >
                  <img
                    src={url}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badge for Main Cover Image */}
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 right-2 flex justify-center">
                      <div className="bg-[rgb(60_28_84)]/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-white" />
                        {dir === "rtl" ? "الغلاف الرئيسي" : "Main Cover"}
                      </div>
                    </div>
                  )}

                  {/* Hover Controls */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 group-hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeMainImage(idx)}
                        className="bg-white text-[rgb(60_28_84)] text-[10px] font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-transform hover:scale-105"
                      >
                        {dir === "rtl" ? "تعيين كغلاف" : "Make Cover"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={uploading || loading}
                      className="bg-red-500 text-white rounded-full p-2.5 shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      title={dir === "rtl" ? "حذف الصورة" : "Delete image"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Button */}
              {form.images.length < 5 && (
                <label
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed transition-all bg-[rgb(244_242_245)]
                    ${uploading || loading ? "border-[rgb(60_28_84)]/40 cursor-not-allowed opacity-50" : "border-[rgb(207_195_223)] hover:border-[rgb(60_28_84)] hover:bg-white cursor-pointer"}`}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[rgb(60_28_84)] animate-spin" />
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 border border-[rgb(207_195_223)]">
                        <Plus className="w-5 h-5 text-[rgb(60_28_84)]" />
                      </div>
                      <span className="text-[11px] font-bold text-[rgb(60_28_84)]/60">
                        {tr.addImageUrl || "Add Image"}
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
              )}
            </div>
            <p className="text-[10px] font-medium text-[rgb(60_28_84)]/50 mt-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              {tr.imageUploadHint || "Max 5 images. Supported: JPEG, PNG, WebP (max 5MB each)."}
            </p>
          </div>

          {/* Variants Section */}
          <div className="pt-4 border-t border-[rgb(244_242_245)]">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide">
                {dir === "rtl"
                  ? "خيارات المنتج (ألوان، مقاسات...)"
                  : "Product Variants (Colors, Sizes...)"}
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 text-xs font-bold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] px-3.5 py-2 rounded-xl hover:bg-[rgb(207_195_223)] transition-colors border border-[rgb(207_195_223)]/50"
              >
                <Plus className="w-3.5 h-3.5" />
                {dir === "rtl" ? "إضافة خيار" : "Add Variant"}
              </button>
            </div>

            {form.variants?.length > 0 && (
              <div className="space-y-3">
                {form.variants.map((variant: any) => (
                  <div
                    key={variant.id}
                    className="flex flex-col md:flex-row gap-3 items-start bg-[rgb(244_242_245)]/50 p-4 rounded-xl border border-[rgb(207_195_223)]/50"
                  >
                    <div className="flex-1 space-y-3 w-full">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                        placeholder={dir === "rtl" ? "الاسم (مثال: أحمر / XL)" : "Name (e.g., Red / XL)"}
                        className="w-full px-4 py-3 rounded-xl border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10 transition-all"
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder={dir === "rtl" ? "سعر مختلف (اختياري)" : "Custom Price (Opt)"}
                          value={variant.price_override || ""}
                          onChange={(e) => updateVariant(variant.id, "price_override", e.target.value)}
                          className="w-1/2 px-4 py-3 rounded-xl border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10 transition-all"
                        />
                        <input
                          type="number"
                          placeholder={dir === "rtl" ? "الكمية" : "Stock"}
                          value={variant.stock || ""}
                          onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value) || 0)}
                          className="w-1/2 px-4 py-3 rounded-xl border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10 transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="p-3 text-red-500 bg-white hover:bg-red-50 rounded-xl border border-[rgb(207_195_223)] transition-colors self-end md:self-start md:mt-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 pb-8 md:pb-5 border-t border-[rgb(244_242_245)] bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="flex-1 py-3.5 md:py-3 rounded-xl border border-[rgb(207_195_223)] bg-white text-[rgb(60_28_84)] text-sm font-bold hover:bg-[rgb(244_242_245)] transition-colors disabled:opacity-50 shadow-sm"
          >
            {tr.cancel || "Cancel"}
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading || uploading || form.title.trim() === ""}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 md:py-3 rounded-xl bg-[rgb(60_28_84)] text-white text-sm font-bold hover:bg-[rgb(60_28_84)]/90 transition-all disabled:opacity-60 shadow-md shadow-[rgb(60_28_84)]/20"
          >
            {(loading || uploading) && (
              <Loader2 className="w-4 h-4 animate-spin text-white/80" />
            )}
            {uploading
              ? tr.uploading || "Uploading..."
              : loading
                ? tr.saving || "Saving..."
                : mode === "create"
                  ? tr.create || "Create Product"
                  : tr.save || "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}