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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
  }, [fetchTestimonials]);

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

  function handleDelete(id: number) {
    // Open the custom delete confirmation modal instead of native window.confirm
    setDeletingId(id);
  }

  async function executeDelete() {
    if (deletingId === null) return;

    try {
      await deleteTestimonial(deletingId);
      showToast(
        dir === "rtl"
          ? "تم حذف الشهادة بنجاح"
          : "Testimonial deleted successfully",
        "success",
      );
      setDeletingId(null);
      fetchTestimonials();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      showToast(message, "error");
      setDeletingId(null);
    }
  }

  function resetForm() {
    setForm({ name: "", role: "", content: "", rating: 5 });
    setEditingId(null);
  }

  function openEdit(testimonial: Testimonial) {
    setForm({
      name: testimonial.name,
      role: testimonial.role || "",
      content: testimonial.content,
      rating: testimonial.rating,
    });
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
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">
                    {testimonial.name}
                  </h3>
                  {testimonial.role && (
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(testimonial)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isLoading && setModalOpen(false)}
          />
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] z-[101] overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="text-lg font-bold text-gray-900">
                {editingId
                  ? dir === "rtl"
                    ? "تعديل الشهادة"
                    : "Edit Testimonial"
                  : dir === "rtl"
                    ? "إضافة شهادة"
                    : "Add Testimonial"}
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {dir === "rtl" ? "الاسم" : "Name"}
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[rgb(60_28_84)]/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {dir === "rtl" ? "الوظيفة" : "Role"}
                </label>
                <input
                  value={form.role ?? ""}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[rgb(60_28_84)]/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {dir === "rtl" ? "الشهادة" : "Content"}
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[rgb(60_28_84)]/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  {dir === "rtl" ? "التقييم" : "Rating"}
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setForm({ ...form, rating: i + 1 })}
                    >
                      <Star
                        className={`w-8 h-8 ${i < form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-white pb-safe">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition-colors"
              >
                {dir === "rtl" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-[rgb(60_28_84)] hover:bg-[#3d1c54] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
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
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleteLoading && setDeletingId(null)}
          />
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col z-[101] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {dir === "rtl" ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {dir === "rtl"
                  ? "هل أنت متأكد من حذف هذه الشهادة؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this testimonial? This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition-colors"
                >
                  {dir === "rtl" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {deleteLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {dir === "rtl" ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-white border border-gray-100 shadow-xl rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
          <p className="text-sm font-semibold text-gray-900">{toast.msg}</p>
        </div>
      )}
    </div>
  );
}
