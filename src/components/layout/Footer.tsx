import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone, FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-bl from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Staz Store</h3>
            <p className="text-gray-400">
              Platform top up game terpercaya dengan layanan tercepat dan harga termurah di Indonesia.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="WhatsApp">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/topup" className="text-gray-400 hover:text-white transition-colors">Top Up Game</Link></li>
              <li><Link href="/voucher" className="text-gray-400 hover:text-white transition-colors">Voucher Game</Link></li>
              <li><Link href="/promo" className="text-gray-400 hover:text-white transition-colors">Promo</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/tentang-kami" className="text-gray-400 hover:text-white transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-400" />
                <span className="text-gray-400">Jl. Contoh No. 123, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-blue-400" />
                <a href="mailto:info@stazstore.com" className="text-gray-400 hover:text-white transition-colors">info@stazstore.com</a>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-blue-400" />
                <a href="tel:+6281234567890" className="text-gray-400 hover:text-white transition-colors">+62 812-3456-7890</a>
              </li>
              <li className="flex items-center">
                <FaWhatsapp className="mr-3 text-blue-400" />
                <a href="https://wa.me/6281234567890" className="text-gray-400 hover:text-white transition-colors">+62 812-3456-7890</a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-white">Metode Pembayaran</h4>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {/* Bank Transfers */}
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center">
                  <Image
                    src="/images/payments/bca.png"
                    alt="BCA"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center">
                  <Image
                    src="/images/payments/mandiri.png"
                    alt="Mandiri"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center">
                  <Image
                    src="/images/payments/bni.png"
                    alt="BNI"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center">
                  <Image
                    src="/images/payments/bri.png"
                    alt="BRI"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {/* E-Wallets */}
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center scale-125">
                  <Image
                    src="/images/payments/gopay.png"
                    alt="Gopay"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center">
                  <Image
                    src="/images/payments/ovo.png"
                    alt="OVO"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center">
                  <Image
                    src="/images/payments/dana.png"
                    alt="DANA"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-full aspect-[3/2] flex items-center justify-center">
                  <Image
                    src="/images/payments/qris.webp"
                    alt="QRIS"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50px, 60px"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-400 mt-4">
              <FaShieldAlt className="mr-2 text-green-400" />
              <span>Pembayaran Aman & Terpercaya</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Staz Store. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/syarat-ketentuan" className="text-gray-400 hover:text-white text-sm transition-colors">Syarat & Ketentuan</Link>
              <Link href="/kebijakan-privasi" className="text-gray-400 hover:text-white text-sm transition-colors">Kebijakan Privasi</Link>
              <Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
