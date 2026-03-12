"use client";

import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New product</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add photos, set variants, and publish.
        </p>
      </div>

      <ProductForm
        submitLabel="Create product"
        submitTo="/admin/api/products"
        method="POST"
        onSaved={(id) => {
          if (id) {
            window.location.href = `/admin/products/${id}/edit`;
          } else {
            window.location.href = "/admin/products";
          }
        }}
      />
    </div>
  );
}