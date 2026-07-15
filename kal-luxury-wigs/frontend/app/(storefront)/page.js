import Hero from '@/components/home/Hero';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import TrendingProducts from '@/components/home/TrendingProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import NewsletterAndSocial from '@/components/home/NewsletterAndSocial';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <TrendingProducts />
      <WhyChooseUs />
      <Testimonials />
      <NewsletterAndSocial />
    </>
  );
}
