"use client";

import { useState, useCallback } from "react";
import {
  Plus, Trash2, Edit2, Check, X, Package, Link2, Copy,
  AlertCircle, CheckCircle2, ChevronDown, CreditCard, ExternalLink,
} from "lucide-react";
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

const PAGE_LABELS: Record<string, string> = {
  "/": "Lead Capture",
  "/sales": "Sales Page",
  "/upsell": "Upsell",
  "/downsell": "Downsell",
  "/thankyou": "Thank You",
};

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD"];
const PAYMENT_TYPES = [
  { value: "one_time", label: "One-Time" },
  { value: "subscription", label: "Subscription" },
];

interface Props {
  funnelId: string;
  initialProducts: Product[];
  checkoutUrls: Record<string, string>;
  pagePaths: string[];
  connectedGateways: string[];
  subdomain: string;
  customDomain: string;
}

export function ProductsClient({
  funnelId,
  initialProducts,
  checkoutUrls: initialCheckoutUrls,
  pagePaths,
  connectedGateways,
  subdomain,
  customDomain,
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(false);
  // page-path → checkout URL assignment (can be external URL or our /api/checkout link)
  const [checkoutUrls, setCheckoutUrls] = useState<Record<string, string>>(initialCheckoutUrls);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const supabase = createClient();

  const hasGateway = connectedGateways.length > 0;

  // Build a hosted checkout URL for a product using our API
  const buildApiCheckoutUrl = useCallback(
    (productId: string) => {
      const base =
        typeof window !== "undefined" ? window.location.origin : "https://ofiq.app";
      return `${base}/api/checkout?funnelId=${funnelId}&productId=${productId}&gateway=auto`;
    },
    [funnelId]
  );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Assign a product's generated checkout link to a page path
  const handleAssignProduct = (pagePath: string, productId: string) => {
    if (!productId) {
      // Remove assignment
      const updated = { ...checkoutUrls };
      delete updated[pagePath];
      setCheckoutUrls(updated);
    } else {
      const url = buildApiCheckoutUrl(productId);
      setCheckoutUrls({ ...checkoutUrls, [pagePath]: url });
    }
  };

  // Manually set a custom external URL for a page path
  const handleSetCustomUrl = (pagePath: string, url: string) => {
    if (!url) {
      const updated = { ...checkoutUrls };
      delete updated[pagePath];
      setCheckoutUrls(updated);
    } else {
      setCheckoutUrls({ ...checkoutUrls, [pagePath]: url });
    }
  };

  // Save all checkout URL assignments back to the funnel's blocks
  const handleSaveAssignments = async () => {
    setSavingAssignments(true);
    try {
      const res = await fetch(`/api/offer-data/${funnelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: {
            integrations: {
              checkoutUrls,
            },
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Checkout assignments saved!");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSavingAssignments(false);
    }
  };

  // ── Product CRUD ─────────────────────────────────────────────────────────────

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
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'insert',
            product: {
              funnel_id: funnelId,
              name: editForm.name || "New Product",
              price: editForm.price || 0,
              currency: editForm.currency || "USD",
              payment_type: editForm.payment_type || "one_time",
            }
          })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to create product");
        
        setProducts([...products.filter((p) => p.id !== "new"), result.data]);
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            id,
            product: {
              name: editForm.name,
              price: editForm.price,
              currency: editForm.currency,
              payment_type: editForm.payment_type,
            }
          })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to update product");
        
        setProducts(
          products.map((p) => (p.id === id ? { ...p, ...editForm } : p))
        );
      }
      setEditingId(null);
      toast.success("Product saved!");
    } catch (err: any) {
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
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete product");
      
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product.");
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

  // Determine if a checkout URL for a page is one of our API links
  const isApiCheckoutUrl = (url: string) =>
    url.includes("/api/checkout?") && url.includes("funnelId=");

  // Get which productId is assigned to a page path (if it's an API link)
  const getAssignedProductId = (pagePath: string): string => {
    const url = checkoutUrls[pagePath] || "";
    if (!isApiCheckoutUrl(url)) return "";
    const match = url.match(/productId=([^&]+)/);
    return match ? match[1] : "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-400" />
          Products & Checkout
        </h1>
        <p className="text-white/50 mt-2 text-sm">
          Define your products, then assign them to funnel pages. CTA buttons on
          those pages will automatically redirect buyers to checkout.
        </p>
      </div>

      {/* Gateway notice */}
      {!hasGateway && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">No payment gateway connected</p>
            <p className="text-amber-300/70 mt-0.5">
              Connect Stripe, PayPal, or Paystack in{" "}
              <a href="/settings/payments" className="underline hover:text-amber-200">
                Settings → Payments
              </a>{" "}
              to use API-powered checkout. Alternatively, paste your own external checkout
              URL below.
            </p>
          </div>
        </div>
      )}

      {hasGateway && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            Connected:{" "}
            {connectedGateways.map((g) => (
              <span
                key={g}
                className="capitalize ml-1 bg-emerald-500/20 px-1.5 py-0.5 rounded text-xs font-mono"
              >
                {g}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* ── Products table ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0e1118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#131826]">
          <div>
            <h2 className="font-semibold text-white">Your Products</h2>
            <p className="text-xs text-white/40 mt-0.5">
              Add the products you want to sell through this funnel
            </p>
          </div>
          <Button onClick={handleAddNew} size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="divide-y divide-white/5">
          {products.length === 0 ? (
            <div className="p-10 text-center text-white/30">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No products yet. Add one to get started.</p>
            </div>
          ) : (
            products.map((product) => {
              const isEditing = editingId === product.id;
              const checkoutLink =
                product.id !== "new" ? buildApiCheckoutUrl(product.id) : null;

              return (
                <div
                  key={product.id}
                  className="p-4 flex flex-col gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* ── Edit row ── */}
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2 md:col-span-1">
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
                          {CURRENCIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block">
                          Type
                        </label>
                        <select
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          value={editForm.payment_type || "one_time"}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              payment_type: e.target.value,
                            })
                          }
                        >
                          {PAYMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-4 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/20"
                          onClick={() => handleSave(product.id)}
                          disabled={loading}
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Save Product
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white/40 hover:text-white"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-1.5" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ── Display row ── */
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-white">
                            {product.name}
                          </span>
                          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium">
                            {product.currency}{" "}
                            {product.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className="bg-white/5 text-white/40 px-2 py-0.5 rounded-full text-xs capitalize">
                            {product.payment_type.replace("_", " ")}
                          </span>
                        </div>
                        {/* Checkout link for this product */}
                        {hasGateway && checkoutLink && (
                          <div className="mt-2 flex items-center gap-2">
                            <CreditCard className="w-3 h-3 text-white/30 shrink-0" />
                            <code className="text-[10px] text-white/30 font-mono truncate max-w-sm">
                              {checkoutLink}
                            </code>
                            <button
                              onClick={() => handleCopyUrl(checkoutLink)}
                              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors shrink-0"
                              title="Copy checkout link"
                            >
                              {copiedUrl === checkoutLink ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Checkout Assignment ────────────────────────────────────────────────── */}
      <div className="bg-[#0e1118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 bg-[#131826]">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold text-white">Checkout Assignments</h2>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Assign a product (or paste your own URL) to each funnel page. When a
            visitor clicks a CTA button on that page, they'll be taken to checkout.
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {pagePaths
            .filter((p) => p !== "/thankyou")
            .map((pagePath) => {
              const label = PAGE_LABELS[pagePath] || pagePath;
              const assignedProductId = getAssignedProductId(pagePath);
              const rawUrl = checkoutUrls[pagePath] || "";
              const isApi = isApiCheckoutUrl(rawUrl);

              return (
                <div key={pagePath} className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {label}
                    </span>
                    <code className="text-xs text-white/30 font-mono">
                      {pagePath}
                    </code>
                  </div>

                  {/* Option A: pick a product (API checkout) */}
                  {hasGateway && products.filter((p) => p.id !== "new").length > 0 && (
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">
                        Use a product (API checkout via connected gateway)
                      </label>
                      <select
                        className="w-full md:w-96 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        value={isApi ? assignedProductId : ""}
                        onChange={(e) =>
                          handleAssignProduct(pagePath, e.target.value)
                        }
                      >
                        <option value="">— No product assigned —</option>
                        {products
                          .filter((p) => p.id !== "new")
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.currency}{" "}
                              {p.price.toFixed(2)})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Option B: custom external URL */}
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">
                      {hasGateway ? "Or paste an external checkout URL" : "Paste your checkout URL"}
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="https://buy.stripe.com/... or https://your-checkout.com/..."
                        className="flex-1 md:max-w-xl bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        value={isApi ? "" : rawUrl}
                        onChange={(e) =>
                          handleSetCustomUrl(pagePath, e.target.value)
                        }
                      />
                      {rawUrl && (
                        <a
                          href={rawUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Test link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Current assignment badge */}
                  {rawUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400/80">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {isApi ? "API checkout assigned" : "External URL assigned"} — CTA buttons on this page will use this link
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <div className="p-4 bg-[#131826] border-t border-white/10 flex justify-end">
          <Button
            onClick={handleSaveAssignments}
            disabled={savingAssignments}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {savingAssignments ? (
              "Saving…"
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Assignments
              </>
            )}
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-400" />
          How it works
        </h3>
        <ol className="text-sm text-white/40 space-y-2 list-decimal list-inside">
          <li>
            Add your products above with their name, price, and currency.
          </li>
          <li>
            If you have a payment gateway connected (Stripe, PayPal, Paystack), assign a
            product to each funnel page — a secure checkout session will be created
            automatically when a visitor clicks the CTA.
          </li>
          <li>
            If you use an external checkout tool (ThriveCart, SamCart, etc.), paste your
            checkout URL directly into the field for each page.
          </li>
          <li>
            Click <strong className="text-white/60">Save Assignments</strong>. CTA buttons
            in your builder pages now automatically redirect to the correct checkout.
          </li>
        </ol>
      </div>
    </div>
  );
}
