'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Field, Input, Checkbox } from '@/components/ui/FormFields';
import { PageSpinner, EmptyState } from '@/components/ui/Feedback';
import {
  useAdminBanners, useAdminCreateBanner, useAdminUpdateBanner, useAdminDeleteBanner,
} from '@/lib/hooks';
import { useToastStore } from '@/lib/store';

const emptyForm = { title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/shop', isActive: true, order: 0 };

export default function BannersManager() {
  const { data: banners, isLoading } = useAdminBanners();
  const deleteBanner = useAdminDeleteBanner();
  const showToast = useToastStore((s) => s.showToast);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      await deleteBanner.mutateAsync(banner._id);
      showToast('Banner deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Homepage Banners</h1>
          <p className="mt-1 text-sm text-charcoal/50">Promotional banners — not required for the site to work, purely optional.</p>
        </div>
        <Button variant="gold" icon={Plus} onClick={() => { setEditingBanner(null); setFormOpen(true); }}>Add Banner</Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !banners?.length ? (
        <EmptyState title="No banners yet" description="Banners are optional — the homepage looks great without them too." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b._id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl bg-ink/5">
                {b.imageUrl && <Image src={b.imageUrl} alt={b.title} fill sizes="300px" className="object-cover" />}
                {!b.isActive && (
                  <span className="absolute left-2 top-2 rounded-full bg-charcoal/70 px-2 py-0.5 text-[10px] text-cream">Hidden</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-ink">{b.title}</h3>
              <p className="text-xs text-charcoal/50">{b.subtitle}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" icon={Pencil} onClick={() => { setEditingBanner(b); setFormOpen(true); }}>Edit</Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => handleDelete(b)}><span className="sr-only">Delete</span></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && <BannerFormModal open={formOpen} onClose={() => setFormOpen(false)} banner={editingBanner} />}
    </div>
  );
}

function BannerFormModal({ open, onClose, banner }) {
  const isEdit = Boolean(banner);
  const [form, setForm] = useState(banner ? { ...emptyForm, ...banner } : emptyForm);
  const [file, setFile] = useState(null);
  const createBanner = useAdminCreateBanner();
  const updateBanner = useAdminUpdateBanner();
  const showToast = useToastStore((s) => s.showToast);
  const pending = createBanner.isPending || updateBanner.isPending;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !file) {
      showToast('Please choose a banner image', 'error');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    if (file) fd.append('image', file);
    try {
      if (isEdit) {
        await updateBanner.mutateAsync({ id: banner._id, formData: fd });
        showToast('Banner updated');
      } else {
        await createBanner.mutateAsync(fd);
        showToast('Banner created');
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Could not save banner', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} variant="center" title={isEdit ? 'Edit Banner' : 'Add Banner'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" required><Input required value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Subtitle"><Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Button text"><Input value={form.ctaText} onChange={(e) => set('ctaText', e.target.value)} /></Field>
          <Field label="Button link"><Input value={form.ctaLink} onChange={(e) => set('ctaLink', e.target.value)} /></Field>
        </div>
        <Field label={isEdit ? 'Replace image (optional)' : 'Banner image'} hint="Recommended: 1600×900px or wider">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-2.5 text-sm"
          />
        </Field>
        <Checkbox label="Active (visible on homepage)" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
        <div className="flex justify-end gap-3 border-t border-charcoal/10 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gold" loading={pending}>{isEdit ? 'Save Changes' : 'Create Banner'}</Button>
        </div>
      </form>
    </Modal>
  );
}
