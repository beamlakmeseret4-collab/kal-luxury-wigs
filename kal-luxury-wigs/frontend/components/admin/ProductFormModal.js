'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/ui/FormFields';
import { useAdminCreateProduct, useAdminUpdateProduct } from '@/lib/hooks';
import { useToastStore } from '@/lib/store';
import { textureLabels, laceLabels, styleTagLabels } from '@/lib/siteConfig';

const emptyForm = {
  name: '', brand: 'Kal Signature', hairType: 'human-hair', laceType: 'lace-front', texture: 'straight',
  styleTags: [], length: '', density: '150%', capSize: 'Average (22"-22.5")', capConstruction: '',
  colorName: 'Natural Black', availableColors: '', availableSizes: '',
  price: '', compareAtPrice: '', shortDescription: '', description: '', badge: 'none',
  isFeatured: false, isActive: true, stock: 10,
};

export default function ProductFormModal({ open, onClose, product }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(() =>
    product
      ? {
          ...emptyForm,
          ...product,
          availableColors: (product.availableColors || []).join(', '),
          availableSizes: (product.availableSizes || []).join(', '),
        }
      : emptyForm
  );
  const [specs, setSpecs] = useState(() =>
    product?.specifications ? Object.entries(product.specifications).map(([key, value]) => ({ key, value })) : []
  );
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);

  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();
  const showToast = useToastStore((s) => s.showToast);
  const pending = createProduct.isPending || updateProduct.isPending;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleStyleTag = (tag) => {
    setForm((f) => ({
      ...f,
      styleTags: f.styleTags.includes(tag) ? f.styleTags.filter((t) => t !== tag) : [...f.styleTags, tag],
    }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (['availableColors', 'availableSizes', 'styleTags'].includes(key)) return;
      fd.append(key, value);
    });
    fd.append('availableColors', JSON.stringify(form.availableColors.split(',').map((s) => s.trim()).filter(Boolean)));
    fd.append('availableSizes', JSON.stringify(form.availableSizes.split(',').map((s) => s.trim()).filter(Boolean)));
    fd.append('styleTags', JSON.stringify(form.styleTags));
    const specsObj = Object.fromEntries(specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]));
    fd.append('specifications', JSON.stringify(specsObj));
    if (isEdit) fd.append('existingImages', JSON.stringify(existingImages));
    files.forEach((f) => fd.append('images', f));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = buildFormData();
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product._id, formData: fd });
        showToast('Product updated');
      } else {
        await createProduct.mutateAsync(fd);
        showToast('Product created');
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Could not save product', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} variant="center" widthClass="sm:max-w-3xl" title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" required><Input required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Brand" required><Input required value={form.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Hair Type">
            <Select value={form.hairType} onChange={(e) => set('hairType', e.target.value)}>
              <option value="human-hair">Human Hair</option>
              <option value="synthetic">Synthetic</option>
            </Select>
          </Field>
          <Field label="Texture">
            <Select value={form.texture} onChange={(e) => set('texture', e.target.value)}>
              {Object.entries(textureLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Lace Type">
            <Select value={form.laceType} onChange={(e) => set('laceType', e.target.value)}>
              {Object.entries(laceLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-charcoal">Style Tags</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(styleTagLabels).map(([v, l]) => (
              <button
                type="button"
                key={v}
                onClick={() => toggleStyleTag(v)}
                className={`rounded-full border px-3 py-1 text-xs ${form.styleTags.includes(v) ? 'border-gold bg-gold/10 text-ink' : 'border-charcoal/15 text-charcoal/60'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Length" required><Input required value={form.length} onChange={(e) => set('length', e.target.value)} placeholder='18"' /></Field>
          <Field label="Density"><Input value={form.density} onChange={(e) => set('density', e.target.value)} /></Field>
          <Field label="Cap Size"><Input value={form.capSize} onChange={(e) => set('capSize', e.target.value)} /></Field>
          <Field label="Color Name"><Input value={form.colorName} onChange={(e) => set('colorName', e.target.value)} /></Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Available colors (comma separated)"><Input value={form.availableColors} onChange={(e) => set('availableColors', e.target.value)} placeholder="Natural Black, Dark Brown" /></Field>
          <Field label="Available sizes (comma separated)"><Input value={form.availableSizes} onChange={(e) => set('availableSizes', e.target.value)} placeholder="Small, Average, Large" /></Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Price (ETB)" required><Input type="number" required value={form.price} onChange={(e) => set('price', e.target.value)} /></Field>
          <Field label="Compare-at price"><Input type="number" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} /></Field>
          <Field label="Stock"><Input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} /></Field>
          <Field label="Badge">
            <Select value={form.badge} onChange={(e) => set('badge', e.target.value)}>
              <option value="none">None</option>
              <option value="bestseller">Bestseller</option>
              <option value="new">New</option>
              <option value="sale">Sale</option>
              <option value="medical">Comfort Fit</option>
            </Select>
          </Field>
        </div>

        <Field label="Short description (shown on product cards)" required>
          <Textarea required rows={2} maxLength={200} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
        </Field>
        <Field label="Full description" required>
          <Textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal">Specifications</p>
            <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])} className="flex items-center gap-1 text-xs text-gold-dark">
              <Plus className="h-3.5 w-3.5" /> Add row
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Label (e.g. Lace Grade)" value={s.key} onChange={(e) => setSpecs(specs.map((row, j) => (j === i ? { ...row, key: e.target.value } : row)))} />
                <Input placeholder="Value" value={s.value} onChange={(e) => setSpecs(specs.map((row, j) => (j === i ? { ...row, value: e.target.value } : row)))} />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="shrink-0 text-charcoal/40 hover:text-garnet">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {isEdit && existingImages.length > 0 && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-charcoal">Current images</p>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setExistingImages(existingImages.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-garnet text-cream"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Field label={isEdit ? 'Add more images' : 'Product images'} hint="First image becomes the main product photo.">
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-2.5 text-sm"
          />
        </Field>

        <div className="flex gap-6">
          <Checkbox label="Featured on homepage" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
          <Checkbox label="Active (visible in shop)" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
        </div>

        <div className="flex justify-end gap-3 border-t border-charcoal/10 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gold" loading={pending}>{isEdit ? 'Save Changes' : 'Create Product'}</Button>
        </div>
      </form>
    </Modal>
  );
}
