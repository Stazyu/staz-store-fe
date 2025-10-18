'use client';

import Link from 'next/link';
import { FaGamepad, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface PromoItem {
  id: string;
  title: string;
  description: string;
  discount: string;
  code: string;
  validUntil: string;
  category: string;
}

const promoData: PromoItem[] = [
  {
    id: '1',
    title: 'Gaming Weekend Sale',
    description: 'Diskon spesial untuk semua game populer di akhir pekan',
    discount: '30%',
    code: 'WEEKEND30',
    validUntil: '30 Juni 2025',
    category: 'Semua Game'
  },
  {
    id: '2',
    title: 'New Member Bonus',
    description: 'Dapatkan bonus saldo untuk member baru',
    discount: 'Rp50.000',
    code: 'NEWMEMBER50',
    validUntil: '31 Desember 2025',
    category: 'Top Up Game'
  },
  {
    id: '3',
    title: 'Mobile Legends Special',
    description: 'Diskon pembelian diamond Mobile Legends',
    discount: '20%',
    code: 'MLBB20',
    validUntil: '15 Juni 2025',
    category: 'Mobile Legends'
  },
  {
    id: '4',
    title: 'Free Voucher Game',
    description: 'Dapatkan voucher game gratis dengan pembelian minimal Rp100.000',
    discount: 'Voucher',
    code: 'FREEVOUCHER',
    validUntil: '30 Juli 2025',
    category: 'Semua Game'
  },
];

const PromoList = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {promoData.map((promo) => (
        <div key={promo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-600 rounded-lg text-blue-600 dark:text-blue-200">
                  <FaGamepad className="text-xl" />
                </div>
                <span className="text-sm font-medium text-gray-500">{promo.category}</span>
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-600 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                {promo.discount}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{promo.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{promo.description}</p>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Kode Promo:</span>
                <div className="mt-1 flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-gray-200 font-mono font-bold">{promo.code}</span>
                  <button
                    onClick={async () => {
                      try {
                        // Check if Clipboard API is available
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(promo.code);
                          toast.success('Kode promo berhasil disalin!');
                        } else {
                          // Fallback method for mobile browsers
                          const textArea = document.createElement('textarea');
                          textArea.value = promo.code;
                          textArea.style.position = 'fixed';
                          textArea.style.left = '-999999px';
                          textArea.style.top = '-999999px';
                          document.body.appendChild(textArea);
                          textArea.focus();
                          textArea.select();

                          try {
                            document.execCommand('copy');
                            toast.success('Kode promo berhasil disalin!');
                          } catch (err) {
                            console.error('Fallback copy failed:', err);
                            toast.error('Gagal menyalin kode promo. Silakan copy manual.');
                          }

                          document.body.removeChild(textArea);
                        }
                      } catch (err) {
                        console.error('Copy failed:', err);
                        toast.error('Gagal menyalin kode promo. Silakan copy manual.');
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                  >
                    Salin
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Berlaku hingga {promo.validUntil}</span>
              </div>

              <Link
                href={`/promo/${promo.id}`}
                className="flex items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium mt-4"
              >
                Lihat Detail <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromoList;
