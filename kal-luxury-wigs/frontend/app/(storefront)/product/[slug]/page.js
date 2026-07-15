import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';

export const dynamic = 'force-dynamic';

async function fetchProduct(slug) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) notFound();

  return <ProductDetail product={product} isPage />;
}
