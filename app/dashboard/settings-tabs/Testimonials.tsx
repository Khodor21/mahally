"use client";

import { useState, useEffect } from "react";
import { Star, Plus, X, Edit2, Trash2, Loader2 } from "lucide-react";
import type { Testimonial, TestimonialFormData } from "@/types/api";
import {
  useTestimonials,
  useTestimonialCreate,
  useTestimonialUpdate,
  useTestimonialDelete,
} from "@/hooks/useTestimonials";

interface TestimonialsManagementProps {
  dir: string;
}

export default function TestimonialsManagement({
  dir,
}: TestimonialsManagementProps) {
  const {
    data: testimonials,
    loading: fetchLoading,
    fetch: fetchTestimonials,
  } = useTestimonials();

  const { execute: createTestimonial, loading: createLoading } =
    useTestimonialCreate();
  const { execute: updateTestimonial, loading: updateLoading } =
    useTestimonialUpdate();
  const { execute: deleteTestimonial, loading: deleteLoading } =
    useTestimonialDelete();

  const [modalOpen, setModalOpen] = useState(false);

  // ✅ FIX: number instead of string
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<TestimonialFormData>({
    name: "",
    role: "",
    content: "",
    rating: 5,
  });

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function handleSubmit() {
    if (!form.name || !form.content) {
      showToast(
        dir === "rtl"
          ? "الرجاء ملء جميع الحقول المطلوبة"
          : "Please fill in all required fields",
        "error",
      );
      return;
    }

    try {
      if (editingId !== null) {
        await updateTestimonial(editingId, form);
      } else {
        await createTestimonial(form);
      }

      showToast(
        dir === "rtl"
          ? editingId
            ? "تم تحديث الشهادة بنجاح"
            : "تمت إضافة الشهادة بنجاح"
          : editingId
            ? "Testimonial updated successfully"
            : "Testimonial added successfully",
        "success",
      );

      setModalOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      showToast(message, "error");
    }
  }

  // ✅ FIX: number type
  async function handleDelete(id: number) {
    const confirmMessage =
      dir === "rtl"
        ? "هل أنت متأكد من حذف هذه الشهادة؟"
        : "Are you sure you want to delete this testimonial?";

    if (!confirm(confirmMessage)) return;

    try {
      await deleteTestimonial(id);

      showToast(
        dir === "rtl"
          ? "تم حذف الشهادة بنجاح"
          : "Testimonial deleted successfully",
        "success",
      );

      fetchTestimonials();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      showToast(message, "error");
    }
  }

  function resetForm() {
    setForm({
      name: "",
      role: "",
      content: "",
      rating: 5,
    });
    setEditingId(null);
  }

  function openEdit(testimonial: Testimonial) {
    setForm({
      name: testimonial.name,
      role: testimonial.role || "",
      content: testimonial.content,
      rating: testimonial.rating,
    });

    // ✅ FIX: number
    setEditingId(testimonial.id);
    setModalOpen(true);
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const isLoading =
    createLoading || updateLoading || deleteLoading || fetchLoading;

  return (
    <div dir={dir} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          {dir === "rtl" ? "إدارة شهادات العملاء" : "Manage Testimonials"}
        </h3>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[rgb(60_28_84)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#3d1c54] disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {dir === "rtl" ? "إضافة شهادة" : "Add Testimonial"}
        </button>
      </div>

      {/* Testimonials List */}
      {fetchLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
          {dir === "rtl" ? "لا توجد شهادات حتى الآن" : "No testimonials yet"}
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">
                    {testimonial.name}
                  </h3>
                  {testimonial.role && (
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(testimonial)}
                    disabled={isLoading}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={() => !isLoading && setModalOpen(false)}
          />
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none"
            dir={dir}
          >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-xl max-h-[90vh] flex flex-col pointer-events-auto animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                <p className="text-xl font-medium">
                  {editingId
                    ? dir === "rtl"
                      ? "تعديل الشهادة"
                      : "Edit Testimonial"
                    : dir === "rtl"
                      ? "إضافة شهادة جديدة"
                      : "Add Testimonial"}
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={isLoading}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {dir === "rtl" ? "الاسم" : "Name"}
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={dir === "rtl" ? "الاسم" : "Name"}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[rgb(60_28_84)]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {dir === "rtl" ? "الوظيفة (اختياري)" : "Role (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={form.role ?? ""}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder={
                      dir === "rtl" ? "مثال: مدير الشركة" : "e.g. CEO"
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[rgb(60_28_84)]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {dir === "rtl" ? "الشهادة" : "Testimonial"}
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    placeholder={
                      dir === "rtl"
                        ? "اكتب رأيك وتجربتك..."
                        : "Write your review..."
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[rgb(60_28_84)]/20 outline-none resize-none"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {dir === "rtl" ? "التقييم" : "Rating"}
                  </label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setForm({ ...form, rating: i + 1 })}
                        className="text-2xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[rgb(60_28_84)] rounded"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i < form.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 pb-8 sm:pb-6 border-t border-gray-200 bg-gray-50 shrink-0">
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors outline-none"
                >
                  {dir === "rtl" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[rgb(60_28_84)] text-white rounded-lg text-sm font-semibold hover:bg-[#3d1c54] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 outline-none"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId
                    ? dir === "rtl"
                      ? "تحديث"
                      : "Update"
                    : dir === "rtl"
                      ? "إضافة"
                      : "Add"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[60] animate-in fade-in slide-in-from-top-4">
          <div
            className={`px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-lg ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
