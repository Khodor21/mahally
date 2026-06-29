"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ImageIcon,
  Package,
  Loader2,
  Trash2,
  Plus,
  Info,
  Pin,
  Star,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type {
  Product,
  ProductFormData,
  VariantGroup,
  VariantOption,
} from "@/types/api";
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
  variantGroups: [],
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
  const [expandedVariantGroup, setExpandedVariantGroup] = useState<
    string | null
  >(null);
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
          product.discount_price !== null &&
          product.discount_price !== undefined
            ? String(product.discount_price)
            : "",
        stock: String(product.stock),
        images: product.images ?? [],
        category_id: (product as any).category_id ?? "",
        variantGroups: (product as any).variantGroups ?? [],
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
    const errs: Partial<
      Record<keyof ProductFormData | "discount_price", string>
    > = {};

    if (!form.title.trim()) errs.title = tr.titleRequired;

    const p = parseFloat(form.price);
    if (isNaN(p) || p < 0)
      errs.price = tr.priceRequired || "Valid price required";

    if (form.discount_price !== "" && form.discount_price !== null) {
      const dp = parseFloat(form.discount_price);
      if (isNaN(dp) || dp < 0) {
        errs.discount_price =
          dir === "rtl" ? "سعر خصم غير صالح" : "Invalid discount price";
      }
    }

    const s = parseInt(form.stock);
    if (form.stock !== "" && (isNaN(s) || s < 0))
      errs.stock = tr.stockInvalid || "Invalid stock";

    setErrors(errs as any);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || uploading) return;

    // Filter out empty variant groups and options
    const cleanedVariantGroups = form.variantGroups
      .map((group: any) => ({
        ...group,
        options: group.options.filter((opt: any) => opt.value.trim() !== ""),
      }))
      .filter((group: any) => group.options.length > 0);

    const cleanedForm = {
      ...form,
      variantGroups: cleanedVariantGroups,
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
      newImages.unshift(selected);
      return { ...f, images: newImages };
    });
  }

  function field(key: string, val: any) {
    setForm((f: any) => ({ ...f, [key]: val }));
    if (errors[key as keyof typeof errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  // ============================================
  // VARIANT GROUP FUNCTIONS
  // ============================================

  const addVariantGroup = () => {
    const newGroup: VariantGroup = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      title: "",
      type: "select",
      allowPrice: true,
      allowStock: true,
      options: [
        {
          id: crypto.randomUUID?.() || Date.now().toString(),
          value: "",
        },
      ],
    };

    setForm((f: any) => ({
      ...f,
      variantGroups: [...(f.variantGroups || []), newGroup],
    }));

    // Auto-expand new group
    setExpandedVariantGroup(newGroup.id);
  };

  const updateVariantGroup = (groupId: string, field: string, value: any) => {
    setForm((f: any) => ({
      ...f,
      variantGroups: f.variantGroups.map((group: any) =>
        group.id === groupId ? { ...group, [field]: value } : group,
      ),
    }));
  };

  const removeVariantGroup = (groupId: string) => {
    setForm((f: any) => ({
      ...f,
      variantGroups: f.variantGroups.filter(
        (group: any) => group.id !== groupId,
      ),
    }));
  };

  const addVariantOption = (groupId: string) => {
    setForm((f: any) => ({
      ...f,
      variantGroups: f.variantGroups.map((group: any) =>
        group.id === groupId
          ? {
              ...group,
              options: [
                ...group.options,
                {
                  id: crypto.randomUUID?.() || Date.now().toString(),
                  value: "",
                },
              ],
            }
          : group,
      ),
    }));
  };

  const updateVariantOption = (
    groupId: string,
    optionId: string,
    field: string,
    value: any,
  ) => {
    setForm((f: any) => ({
      ...f,
      variantGroups: f.variantGroups.map((group: any) =>
        group.id === groupId
          ? {
              ...group,
              options: group.options.map((opt: any) =>
                opt.id === optionId ? { ...opt, [field]: value } : opt,
              ),
            }
          : group,
      ),
    }));
  };

  const removeVariantOption = (groupId: string, optionId: string) => {
    setForm((f: any) => ({
      ...f,
      variantGroups: f.variantGroups.map((group: any) =>
        group.id === groupId
          ? {
              ...group,
              options: group.options.filter((opt: any) => opt.id !== optionId),
            }
          : group,
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center overflow-y-auto">
      <div
        className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        dir={dir}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-5 md:py-6 border-b border-[rgb(244_242_245)] bg-white flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg md:text-xl font-bold text-[rgb(60_28_84)]">
            {mode === "create"
              ? dir === "rtl"
                ? "إنشاء منتج جديد"
                : "Create Product"
              : dir === "rtl"
                ? "تعديل المنتج"
                : "Edit Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="p-2 text-gray-400 hover:text-[rgb(60_28_84)] hover:bg-[rgb(244_242_245)] rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-6 py-6 space-y-8">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide mb-2.5">
                {tr.title || "Product Title"}
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={form.title}
                onChange={(e) => field("title", e.target.value)}
                placeholder={dir === "rtl" ? "اسم المنتج" : "Product name"}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[rgb(60_28_84)] outline-none transition-all ${
                  errors.title
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[rgb(207_195_223)] focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10"
                }`}
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide mb-2.5">
                {tr.description || "Description"}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => field("description", e.target.value)}
                placeholder={
                  dir === "rtl" ? "وصف المنتج" : "Product description"
                }
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10 transition-all resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide mb-2.5">
                {tr.category || "Category"}
              </label>
              <select
                value={form.category_id}
                onChange={(e) => field("category_id", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[rgb(207_195_223)] bg-white text-sm text-[rgb(60_28_84)] outline-none focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10 transition-all"
              >
                <option value="">
                  {dir === "rtl" ? "اختر فئة" : "Select a category"}
                </option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide mb-2.5">
                  {tr.price || "Price"} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => field("price", e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[rgb(60_28_84)] outline-none transition-all ${
                    errors.price
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[rgb(207_195_223)] focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10"
                  }`}
                />
                {errors.price && (
                  <p className="text-xs text-red-600 mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide mb-2.5">
                  {dir === "rtl" ? "سعر الخصم" : "Discount Price"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discount_price}
                  onChange={(e) => field("discount_price", e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[rgb(60_28_84)] outline-none transition-all ${
                    errors.discount_price
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[rgb(207_195_223)] focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10"
                  }`}
                />
                {errors.discount_price && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.discount_price}
                  </p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide mb-2.5">
                {tr.stock || "Stock"}
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => field("stock", e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[rgb(60_28_84)] outline-none transition-all ${
                  errors.stock
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[rgb(207_195_223)] focus:border-[rgb(60_28_84)] focus:ring-2 focus:ring-[rgb(60_28_84)]/10"
                }`}
              />
              {errors.stock && (
                <p className="text-xs text-red-600 mt-1">{errors.stock}</p>
              )}
            </div>

            {/* Pin */}
            <div className="flex items-center gap-3 p-3 bg-[rgb(244_242_245)] rounded-xl">
              <input
                type="checkbox"
                id="pin-checkbox"
                checked={form.pin}
                onChange={(e) => field("pin", e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <label
                htmlFor="pin-checkbox"
                className="text-sm font-medium text-[rgb(60_28_84)] cursor-pointer flex-1"
              >
                {dir === "rtl"
                  ? "تثبيت هذا المنتج في المتجر"
                  : "Pin this product to storefront"}
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide mb-3">
                {dir === "rtl" ? "صور المنتج" : "Product Images"}
              </label>

              {form.images.length > 0 && (
                <p className="text-[10px] text-[rgb(60_28_84)]/60 mb-3">
                  {dir === "rtl"
                    ? "الصورة الأولى سيتم استخدامها كغلاف في المتجر"
                    : "The first image with the 'Main Cover' badge will be used as the product card thumbnail. Click 'Make Cover' on any image to change it."}
                </p>
              )}

              {uploading && uploadProgress && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    <p className="text-xs text-blue-700 font-medium">
                      {uploadProgress}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.images.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      idx === 0
                        ? "border-[rgb(60_28_84)] shadow-md"
                        : "border-[rgb(207_195_223)] bg-[rgb(244_242_245)]"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {idx === 0 && (
                      <div className="absolute top-2 left-2 right-2 flex justify-center">
                        <div className="bg-[rgb(60_28_84)]/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-white" />
                          {dir === "rtl" ? "الغلاف الرئيسي" : "Main Cover"}
                        </div>
                      </div>
                    )}

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
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {form.images.length < 5 && (
                  <label
                    className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed transition-all bg-[rgb(244_242_245)] ${
                      uploading || loading
                        ? "border-[rgb(60_28_84)]/40 cursor-not-allowed opacity-50"
                        : "border-[rgb(207_195_223)] hover:border-[rgb(60_28_84)] hover:bg-white cursor-pointer"
                    }`}
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
                {tr.imageUploadHint ||
                  "Max 5 images. Supported: JPEG, PNG, WebP (max 5MB each)."}
              </p>
            </div>

            {/* ============================================ */}
            {/* VARIANT GROUPS SECTION - UPDATED */}
            {/* ============================================ */}
            <div className="pt-4 border-t border-[rgb(244_242_245)]">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-bold text-[rgb(60_28_84)] uppercase tracking-wide">
                  {dir === "rtl"
                    ? "خيارات المنتج (الألوان، الأحجام، المؤلف...)"
                    : "Product Variants (Colors, Sizes, Author...)"}
                </label>
                <button
                  type="button"
                  onClick={addVariantGroup}
                  className="flex items-center gap-1.5 text-xs font-bold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] px-3.5 py-2 rounded-xl hover:bg-[rgb(207_195_223)] transition-colors border border-[rgb(207_195_223)]/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {dir === "rtl" ? "إضافة مجموعة" : "Add Group"}
                </button>
              </div>

              {form.variantGroups?.length > 0 && (
                <div className="space-y-3">
                  {form.variantGroups.map((group: VariantGroup) => (
                    <div
                      key={group.id}
                      className="border border-[rgb(207_195_223)]/50 rounded-xl overflow-hidden bg-[rgb(244_242_245)]/30"
                    >
                      {/* Group Header */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedVariantGroup(
                            expandedVariantGroup === group.id ? null : group.id,
                          )
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-[rgb(244_242_245)]/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ChevronDown
                            className={`w-5 h-5 text-[rgb(60_28_84)]/60 transition-transform shrink-0 ${
                              expandedVariantGroup === group.id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                          <div className="text-left min-w-0 flex-1">
                            <p className="font-semibold text-[rgb(60_28_84)] truncate">
                              {group.title || "(untitled group)"}
                            </p>
                            <p className="text-xs text-[rgb(60_28_84)]/60">
                              {group.options?.length || 0}{" "}
                              {dir === "rtl" ? "خيار" : "option"}
                              {group.type === "text" &&
                                ` • ${dir === "rtl" ? "نص حر" : "Free text"}`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariantGroup(group.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </button>

                      {/* Group Content */}
                      {expandedVariantGroup === group.id && (
                        <div className="border-t border-[rgb(207_195_223)]/50 p-4 space-y-4 bg-white">
                          {/* Group Settings */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2">
                                {dir === "rtl" ? "اسم المجموعة" : "Group Title"}
                              </label>
                              <input
                                type="text"
                                value={group.title}
                                onChange={(e) =>
                                  updateVariantGroup(
                                    group.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                placeholder={
                                  dir === "rtl"
                                    ? "مثال: الحجم، اللون، المؤلف"
                                    : "e.g., Volume, Color, Author"
                                }
                                className="w-full px-3 py-2 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm outline-none focus:border-[rgb(60_28_84)] focus:ring-1 focus:ring-[rgb(60_28_84)]/50 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[rgb(60_28_84)] mb-2">
                                {dir === "rtl" ? "نوع الخيار" : "Option Type"}
                              </label>
                              <select
                                value={group.type}
                                onChange={(e) =>
                                  updateVariantGroup(
                                    group.id,
                                    "type",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm outline-none focus:border-[rgb(60_28_84)] focus:ring-1 focus:ring-[rgb(60_28_84)]/50 transition-all"
                              >
                                <option value="select">
                                  {dir === "rtl"
                                    ? "قائمة منسدلة (خيارات محددة)"
                                    : "Dropdown (Fixed options)"}
                                </option>
                                <option value="text">
                                  {dir === "rtl"
                                    ? "نص حر (إدخال مخصص)"
                                    : "Free Text (Custom input)"}
                                </option>
                              </select>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-[rgb(60_28_84)]">
                                  {dir === "rtl"
                                    ? "السماح بتجاوز السعر"
                                    : "Allow price override"}
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateVariantGroup(
                                      group.id,
                                      "allowPrice",
                                      !group.allowPrice,
                                    )
                                  }
                                  className="transition-colors"
                                >
                                  {group.allowPrice ? (
                                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5 text-gray-300" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-[rgb(60_28_84)]">
                                  {dir === "rtl"
                                    ? "تتبع المخزون لكل خيار"
                                    : "Track stock per option"}
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateVariantGroup(
                                      group.id,
                                      "allowStock",
                                      !group.allowStock,
                                    )
                                  }
                                  className="transition-colors"
                                >
                                  {group.allowStock ? (
                                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5 text-gray-300" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Options List */}
                          <div className="border-t border-[rgb(244_242_245)] pt-4 space-y-2">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-xs font-bold text-[rgb(60_28_84)] uppercase">
                                {dir === "rtl" ? "الخيارات" : "Options"}
                              </label>
                              <button
                                type="button"
                                onClick={() => addVariantOption(group.id)}
                                className="flex items-center gap-1 text-[10px] font-bold text-[rgb(60_28_84)] bg-white px-2.5 py-1.5 rounded-md hover:bg-[rgb(244_242_245)] transition-colors border border-[rgb(207_195_223)]/50"
                              >
                                <Plus className="w-3 h-3" />
                                {dir === "rtl" ? "إضافة" : "Add"}
                              </button>
                            </div>

                            {group.options.map(
                              (option: VariantOption, optIdx: number) => (
                                <div
                                  key={option.id}
                                  className="flex flex-col gap-2 p-3 bg-[rgb(244_242_245)]/50 rounded-lg border border-[rgb(207_195_223)]/50"
                                >
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={option.value}
                                      onChange={(e) =>
                                        updateVariantOption(
                                          group.id,
                                          option.id,
                                          "value",
                                          e.target.value,
                                        )
                                      }
                                      placeholder={
                                        dir === "rtl"
                                          ? "مثال: 100ml، أحمر، John Doe"
                                          : "e.g., 100ml, Red, John Doe"
                                      }
                                      className="flex-1 px-3 py-2 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm outline-none focus:border-[rgb(60_28_84)] focus:ring-1 focus:ring-[rgb(60_28_84)]/50 transition-all"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeVariantOption(group.id, option.id)
                                      }
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Price and Stock rows - only show if enabled */}
                                  {(group.allowPrice || group.allowStock) && (
                                    <div className="flex gap-2">
                                      {group.allowPrice && (
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={option.price ?? ""}
                                          onChange={(e) =>
                                            updateVariantOption(
                                              group.id,
                                              option.id,
                                              "price",
                                              e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined,
                                            )
                                          }
                                          placeholder={
                                            dir === "rtl"
                                              ? "السعر (اختياري)"
                                              : "Price (opt)"
                                          }
                                          className="flex-1 px-3 py-2 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm outline-none focus:border-[rgb(60_28_84)] focus:ring-1 focus:ring-[rgb(60_28_84)]/50 transition-all"
                                        />
                                      )}
                                      {group.allowStock && (
                                        <input
                                          type="number"
                                          value={option.stock ?? ""}
                                          onChange={(e) =>
                                            updateVariantOption(
                                              group.id,
                                              option.id,
                                              "stock",
                                              e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                            )
                                          }
                                          placeholder={
                                            dir === "rtl"
                                              ? "الكمية (اختياري)"
                                              : "Stock (opt)"
                                          }
                                          className="flex-1 px-3 py-2 rounded-lg border border-[rgb(207_195_223)] bg-white text-sm outline-none focus:border-[rgb(60_28_84)] focus:ring-1 focus:ring-[rgb(60_28_84)]/50 transition-all"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
