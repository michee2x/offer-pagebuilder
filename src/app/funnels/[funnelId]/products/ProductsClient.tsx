"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  funnel_id: string;
  name: string;
  price: number;
  currency: string;
  payment_type: string;
}

export function ProductsClient({
  funnelId,
  initialProducts,
}: {
  funnelId: string;
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    setLoading(true);
    try {
      if (id === "new") {
        const { data, error } = await supabase
          .from("products")
          .insert({
            funnel_id: funnelId,
            name: editForm.name || "New Product",
            price: editForm.price || 0,
            currency: editForm.currency || "USD",
            payment_type: editForm.payment_type || "one_time",
          })
          .select()
          .single();

        if (error) throw error;
        setProducts([...products.filter((p) => p.id !== "new"), data]);
      } else {
        const { error } = await supabase
          .from("products")
          .update({
            name: editForm.name,
            price: editForm.price,
            currency: editForm.currency,
          })
          .eq("id", id);

        if (error) throw error;
        setProducts(
          products.map((p) => (p.id === id ? { ...p, ...editForm } : p))
        );
      }
      setEditingId(null);
      toast.success("Product saved successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === "new") {
      setProducts(products.filter((p) => p.id !== "new"));
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  const handleAddNew = () => {
    if (products.find((p) => p.id === "new")) return;
    const newProduct: Product = {
      id: "new",
      funnel_id: funnelId,
      name: "",
      price: 0,
      currency: "USD",
      payment_type: "one_time",
    };
    setProducts([...products, newProduct]);
    setEditingId("new");
    setEditForm(newProduct);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-400" />
          Products
        </h1>
        <p className="text-white/60 mt-2">
          Manage the products and pricing for this funnel. AI automatically creates these
          during generation.
        </p>
      </div>

      <div className="bg-[#0e1118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#131826]">
          <h2 className="font-semibold text-white">Funnel Products</h2>
          <Button onClick={handleAddNew} size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="divide-y divide-white/5">
          {products.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              No products found. Add one manually or let AI generate them.
            </div>
          ) : (
            products.map((product) => {
              const isEditing = editingId === product.id;

              return (
                <div
                  key={product.id}
                  className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="e.g. Main Offer"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">
                          Price
                        </label>
                        <input
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          value={editForm.price || 0}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">
                          Currency
                        </label>
                        <select
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          value={editForm.currency || "USD"}
                          onChange={(e) =>
                            setEditForm({ ...editForm, currency: e.target.value })
                          }
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
                        <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                          {product.currency} {product.price.toFixed(2)}
                        </span>
                        <span className="font-mono text-[10px] text-white/30">
                          ID: {product.id}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                          onClick={() => handleSave(product.id)}
                          disabled={loading}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/40 hover:text-white"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/40 hover:text-white"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
