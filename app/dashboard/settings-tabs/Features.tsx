"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Trash2,
  Edit2,
  Plus,
  ChevronUp,
  ChevronDown,
  X,
  AlertCircle,
  Check,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FeaturePanelProps {
  dir?: "rtl" | "ltr";
  lang?: "ar" | "en";
}

const t = {
  ar: {
    title: "المميزات",
    addFeature: "إضافة مميزة",
    noFeatures: "لا توجد مميزات حتى الآن",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    success: "تم بنجاح",
    featureTitle: "العنوان",
    description: "الوصف",
    icon: "الرمز",
    displayOrder: "ترتيب العرض",
    active: "نشط",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    deleteConfirm: "هل أنت متأكد من حذف هذه المميزة؟",
    required: "مطلوب",
    titleRequired: "العنوان مطلوب",
    descriptionRequired: "الوصف مطلوب",
    iconRequired: "الرمز مطلوب",
    titleMax: "العنوان بحد أقصى 255 حرف",
    descriptionMax: "الوصف بحد أقصى 2000 حرف",
    iconMax: "الرمز بحد أقصى 100 حرف",
    orderMin: "ترتيب العرض يجب أن يكون رقم موجب",
    moveUp: "رفع",
    moveDown: "خفض",
    newFeature: "مميزة جديدة",
    editFeature: "تعديل المميزة",
    confirmDelete: "هل أنت متأكد؟",
  },
  en: {
    title: "Features",
    addFeature: "Add feature",
    noFeatures: "No features yet",
    loading: "Loading...",
    error: "Error occurred",
    success: "Success",
    featureTitle: "Title",
    description: "Description",
    icon: "Icon",
    displayOrder: "Display order",
    active: "Active",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    deleteConfirm: "Are you sure you want to delete this feature?",
    required: "Required",
    titleRequired: "Title is required",
    descriptionRequired: "Description is required",
    iconRequired: "Icon is required",
    titleMax: "Title max 255 characters",
    descriptionMax: "Description max 2000 characters",
    iconMax: "Icon max 100 characters",
    orderMin: "Display order must be a positive number",
    moveUp: "Move up",
    moveDown: "Move down",
    newFeature: "New feature",
    editFeature: "Edit feature",
    confirmDelete: "Are you sure?",
  },
};

export default function FeaturesPanel({
  dir: propDir,
  lang: propLang,
}: FeaturePanelProps) {
  const dashboardContext = useDashboard();
  const lang = propLang || dashboardContext?.lang || "en";
  const dir = propDir || (lang === "ar" ? "rtl" : "ltr");
  const msgs = t[lang as keyof typeof t];

  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon_name: "",
    display_order: 0,
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch features
  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/features");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || msgs.error);
      }

      setFeatures(result.data || []);
    } catch (err: any) {
      console.error("Fetch features error:", err);
      setError(err.message || msgs.error);
    } finally {
      setLoading(false);
    }
  }, [msgs]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = msgs.titleRequired;
    } else if (formData.title.length > 255) {
      errors.title = msgs.titleMax;
    }

    if (!formData.description.trim()) {
      errors.description = msgs.descriptionRequired;
    } else if (formData.description.length > 2000) {
      errors.description = msgs.descriptionMax;
    }

    if (!formData.icon_name.trim()) {
      errors.icon_name = msgs.iconRequired;
    } else if (formData.icon_name.length > 100) {
      errors.icon_name = msgs.iconMax;
    }

    if (formData.display_order < 0) {
      errors.display_order = msgs.orderMin;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save (create or update)
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const endpoint = "/api/admin/features";
      const payload = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || msgs.error);
      }

      // Update local state
      if (editingId) {
        setFeatures(
          features.map((f) => (f.id === editingId ? result.data : f)),
        );
      } else {
        setFeatures([...features, result.data]);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        icon_name: "",
        display_order: 0,
        is_active: true,
      });
    } catch (err: any) {
      setError(err.message || msgs.error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/features?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || msgs.error);
      }

      setFeatures(features.filter((f) => f.id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || msgs.error);
    }
  };

  // Handle move (reorder)
  const handleMove = async (id: string, direction: "up" | "down") => {
    const index = features.findIndex((f) => f.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === features.length - 1)
    ) {
      return;
    }

    const feature = features[index];
    const newOrder =
      direction === "up"
        ? feature.display_order - 1
        : feature.display_order + 1;

    try {
      const response = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, display_order: newOrder }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || msgs.error);
      }

      // Re-fetch to ensure proper ordering
      await fetchFeatures();
    } catch (err: any) {
      setError(err.message || msgs.error);
    }
  };

  // Handle edit button click
  const handleEditClick = (feature: Feature) => {
    setFormData({
      title: feature.title,
      description: feature.description,
      icon_name: feature.icon_name,
      display_order: feature.display_order,
      is_active: feature.is_active,
    });
    setEditingId(feature.id);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      icon_name: "",
      display_order: 0,
      is_active: true,
    });
    setFormErrors({});
  };

  return (
    <div style={{ padding: "1.5rem 0" }} dir={dir}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 500,
            margin: 0,
            color: "var(--color-text-primary)",
          }}
        >
          {msgs.title}
        </h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              icon_name: "",
              display_order: features.length,
              is_active: true,
            });
            setFormErrors({});
            setIsModalOpen(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            backgroundColor: "var(--color-background-info)",
            color: "var(--color-text-info)",
            border: "0.5px solid var(--color-border-info)",
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <Plus size={16} />
          {msgs.addFeature}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "12px",
            marginBottom: "1rem",
            backgroundColor: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
            borderRadius: "var(--border-radius-md)",
            color: "var(--color-text-danger)",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "var(--color-text-secondary)",
            fontSize: "14px",
          }}
        >
          {msgs.loading}
        </div>
      )}

      {/* Empty state */}
      {!loading && features.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "var(--color-text-secondary)",
            fontSize: "14px",
          }}
        >
          {msgs.noFeatures}
        </div>
      )}

      {/* Features list */}
      {!loading && features.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {features.map((feature, index) => (
            <div
              key={feature.id}
              style={{
                padding: "1rem 1.25rem",
                backgroundColor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                position: "relative",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {feature.title}
                  </h3>
                  {feature.is_active && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        backgroundColor: "var(--color-background-success)",
                        color: "var(--color-text-success)",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      <Check size={12} />
                      {msgs.active}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {feature.description.substring(0, 100)}
                  {feature.description.length > 100 ? "..." : ""}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  <span>
                    {msgs.icon}: <strong>{feature.icon_name}</strong>
                  </span>
                  <span>
                    {msgs.displayOrder}:{" "}
                    <strong>{feature.display_order}</strong>
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                {/* Move buttons */}
                <button
                  onClick={() => handleMove(feature.id, "up")}
                  disabled={index === 0}
                  title={msgs.moveUp}
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    cursor: index === 0 ? "not-allowed" : "pointer",
                    opacity: index === 0 ? 0.5 : 1,
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(feature.id, "down")}
                  disabled={index === features.length - 1}
                  title={msgs.moveDown}
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    cursor:
                      index === features.length - 1 ? "not-allowed" : "pointer",
                    opacity: index === features.length - 1 ? 0.5 : 1,
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronDown size={16} />
                </button>

                {/* Edit button */}
                <button
                  onClick={() => handleEditClick(feature)}
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={msgs.edit}
                >
                  <Edit2 size={16} />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteConfirmId(feature.id)}
                  style={{
                    padding: "6px",
                    backgroundColor: "transparent",
                    border: "0.5px solid var(--color-border-danger)",
                    borderRadius: "var(--border-radius-md)",
                    cursor: "pointer",
                    color: "var(--color-text-danger)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={msgs.delete}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Delete confirmation inline */}
              {deleteConfirmId === feature.id && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    borderRadius: "var(--border-radius-lg)",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--color-background-primary)",
                      padding: "1.25rem",
                      borderRadius: "var(--border-radius-lg)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      maxWidth: "280px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        fontSize: "14px",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {msgs.confirmDelete}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleDelete(feature.id)}
                        style={{
                          flex: 1,
                          padding: "6px 12px",
                          backgroundColor: "var(--color-background-danger)",
                          color: "var(--color-text-danger)",
                          border: "0.5px solid var(--color-border-danger)",
                          borderRadius: "var(--border-radius-md)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        {msgs.delete}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        style={{
                          flex: 1,
                          padding: "6px 12px",
                          backgroundColor: "var(--color-background-secondary)",
                          color: "var(--color-text-primary)",
                          border: "0.5px solid var(--color-border-tertiary)",
                          borderRadius: "var(--border-radius-md)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        {msgs.cancel}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal - Create/Edit */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={handleModalClose}
        >
          <div
            style={{
              backgroundColor: "var(--color-background-primary)",
              borderRadius: "var(--border-radius-lg)",
              border: "0.5px solid var(--color-border-tertiary)",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {editingId ? msgs.editFeature : msgs.newFeature}
              </h2>
              <button
                onClick={handleModalClose}
                style={{
                  padding: "4px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form fields */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Title */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {msgs.featureTitle}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  maxLength={255}
                  placeholder={msgs.featureTitle}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.title && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "12px",
                      color: "var(--color-text-danger)",
                    }}
                  >
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {msgs.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={2000}
                  placeholder={msgs.description}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
                {formErrors.description && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "12px",
                      color: "var(--color-text-danger)",
                    }}
                  >
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Icon name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {msgs.icon}
                </label>
                <input
                  type="text"
                  value={formData.icon_name}
                  onChange={(e) =>
                    setFormData({ ...formData, icon_name: e.target.value })
                  }
                  maxLength={100}
                  placeholder="e.g., star, heart, shield"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.icon_name && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "12px",
                      color: "var(--color-text-danger)",
                    }}
                  >
                    {formErrors.icon_name}
                  </p>
                )}
              </div>

              {/* Display order */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {msgs.displayOrder}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.display_order && (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "12px",
                      color: "var(--color-text-danger)",
                    }}
                  >
                    {formErrors.display_order}
                  </p>
                )}
              </div>

              {/* Active toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  style={{ cursor: "pointer" }}
                />
                <label
                  htmlFor="is_active"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    cursor: "pointer",
                  }}
                >
                  {msgs.active}
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
              }}
            >
              <button
                onClick={handleModalClose}
                disabled={isSaving}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {msgs.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                  border: "0.5px solid var(--color-border-info)",
                  borderRadius: "var(--border-radius-md)",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? msgs.loading : msgs.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
