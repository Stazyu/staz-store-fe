import { Metadata } from 'next';
import PromoBanner from '@/components/promo/PromoBanner';
import PromoList from '@/components/promo/PromoList';

export const metadata: Metadata = {
  title: 'Promo Spesial - Staz Store',
  description: 'Dapatkan promo dan diskon menarik untuk berbagai produk game favorit Anda di Staz Store.',
};

export default function PromoPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Promo Spesial</h1>
      <PromoBanner />
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Promo Tersedia</h2>
        <PromoList />
      </div>
    </main>
  );
}
