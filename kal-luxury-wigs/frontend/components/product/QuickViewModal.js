'use client';

import Modal from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Feedback';
import ProductDetail from './ProductDetail';
import { useUIStore } from '@/lib/store';
import { useProductBySlug } from '@/lib/hooks';

export default function QuickViewModal() {
  const quickViewSlug = useUIStore((s) => s.quickViewSlug);
  const closeQuickView = useUIStore((s) => s.closeQuickView);
  const { data: product, isLoading } = useProductBySlug(quickViewSlug);

  return (
    <Modal open={Boolean(quickViewSlug)} onClose={closeQuickView} variant="sheet" title="Quick View" widthClass="sm:max-w-xl">
      {isLoading && <PageSpinner />}
      {product && <ProductDetail product={product} isPage={false} />}
    </Modal>
  );
}
