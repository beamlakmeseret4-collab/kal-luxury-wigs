import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import QuickViewModal from '@/components/product/QuickViewModal';

// Shell for every customer-facing page (home, shop, product, checkout,
// account, etc.). Kept separate from /admin, which has its own layout
// with no storefront chrome.
export default function StorefrontLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
    </>
  );
}
