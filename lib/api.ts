export type Lang = "ar" | "en";

export interface Product {
  id: string;
  store_id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  created_at: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  stock: string;
  images: string[];
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok && res.headers.get("content-type")?.includes("text/html")) {
    throw new Error(`Server error: ${res.status}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// POST /api/products
export async function createProduct(form: ProductFormData): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      images: form.images,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// PATCH /api/products
export async function updateProduct(
  id: string,
  form: ProductFormData,
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      images: form.images,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// DELETE /api/products?id=...
export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

export async function getOrders(storeId: string) {
  const res = await fetch(`/api/checkout?storeId=${storeId}`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch orders");
  }

  return data.data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await fetch("/api/checkout", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      status,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to update order");
  }

  return data.data;
}
