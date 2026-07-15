'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormFields';
import { PageSpinner, EmptyState, ProductBadge } from '@/components/ui/Feedback';
import ProductFormModal from './ProductFormModal';
import { useProducts, useAdminDeleteProduct } from '@/lib/hooks';
import { useToastStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function ProductsManager() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { data, isLoading } = useProducts({ q: search, limit: 60 });
  const deleteProduct = useAdminDeleteProduct();
  const showToast = useToastStore((s) => s.showToast);

  const openCreate = () => { setEditingProduct(null); setFormOpen(true); };
  const openEdit = (p) => { setEditingProduct(p); setFormOpen(true); };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct.mutateAsync(product._id);
      showToast('Product deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Products</h1>
        <Button variant="gold" icon={Plus} onClick={openCreate}>Add Product</Button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/30" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="pl-9" />
      </div>

      {isLoading ? (
        <PageSpinner label="Loading products…" />
      ) : !data?.products?.length ? (
        <EmptyState title="No products found" action={<Button variant="gold" onClick={openCreate}>Add your first product</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((p) => (
            <div key={p._id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-xl bg-ink/5">
                {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill sizes="200px" className="object-cover" />}
                <div className="absolute left-2 top-2"><ProductBadge badge={p.badge} /></div>
              </div>
              <p className="text-xs uppercase tracking-wide text-gold-dark">{p.brand}</p>
              <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-ink">{p.name}</h3>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal">{formatPrice(p.price)}</span>
                <span className="text-xs text-charcoal/40">Stock: {p.stock}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" icon={Pencil} onClick={() => openEdit(p)}>Edit</Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => handleDelete(p)} loading={deleteProduct.isPending}>
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editingProduct} />
      )}
    </div>
  );
}
