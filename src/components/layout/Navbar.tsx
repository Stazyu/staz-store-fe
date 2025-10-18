'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiChevronDown, FiLogOut } from 'react-icons/fi';
import ThemeToggle from '../ThemeToogle';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = !!session;
  console.log(status);

  const loading = status === 'loading';
  const tokenExpired = session?.error === 'AccessTokenExpired' || session?.error === 'RefreshTokenExpired' || session?.error === 'SessionNotFound';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [name]: !prev[name]
    }));
  };

  const closeAllSubmenus = () => {
    setOpenSubmenus({});
  };


  const navLinks = [
    { name: 'Beranda', href: '/' },
    {
      name: 'Top Up',
      href: '#',
      submenu: [
        { name: 'Game', href: '/topup/game' },
        { name: 'Pulsa', href: '/topup/pulsa' },
        { name: 'E-Wallet', href: '/topup/ewallet' },
      ]
    },
    ...(isAuthenticated && !tokenExpired ? [
      {
        name: 'Transaksi',
        href: '/transaksi',
        submenu: [
          { name: 'Riwayat Transaksi', href: '/riwayat-transaksi' },
          { name: 'Pembayaran Tertunda', href: '/transaksi/pending' },
          { name: 'Pesanan Saya', href: '/transaksi/pesanan' },
        ]
      },
    ] : [
      {
        name: 'Riwayat Transaksi',
        href: '/riwayat-transaksi'
      },
    ]),
    { name: 'Voucher', href: '/voucher' },
    { name: 'Promo', href: '/promo' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-md shadow-md py-2' : 'py-4'}`}>
      {/* Gradient Border Bottom */}
      {/* <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`}></div> */}
      {/* Gradient Background */}
      <div className={`absolute inset-0 -z-10 ${scrolled ? 'bg-white dark:bg-gray-900' : ' dark:from-gray-800 dark:to-gray-900'}`}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                StazStore
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((item) => (
                <div key={item.name} className="relative">
                  {item.submenu ? (
                    <div className="relative">
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        {item.name}
                        <FiChevronDown
                          className={`ml-1 transition-transform duration-200 ${openSubmenus[item.name] ? 'transform rotate-180' : ''}`}
                          size={16}
                        />
                      </button>
                      {openSubmenus[item.name] && (
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={closeAllSubmenus}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-700 dark:text-gray-200 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      onClick={closeAllSubmenus}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && !tokenExpired && user?.role?.toLowerCase() === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                Dashboard
              </Link>
            )}
            <ThemeToggle />

            {isAuthenticated && !tokenExpired ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Profil"
                  title="Profil"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profil Saya
                      </Link>
                      <Link
                        href="/riwayat-transaksi"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Riwayat Transaksi
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
                      >
                        <FiLogOut className="mr-2" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20">
                <span className="relative z-10">Loading...</span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20">
                  <span className="relative z-10">Masuk / Daftar</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </>
            )}

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-600 dark:hover:bg-gray-700"
                    >
                      {item.name}
                      <FiChevronDown className={`transition-transform duration-200 ${openSubmenus[item.name] ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openSubmenus[item.name] ? 'max-h-96' : 'max-h-0'}`}
                    >
                      <div className="pl-4">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md dark:text-gray-200 dark:hover:text-blue-600 dark:hover:bg-gray-700 transition-colors duration-200 ${!openSubmenus[item.name] ? 'opacity-0' : 'opacity-100'}`}
                            style={{
                              transitionDelay: openSubmenus[item.name] ? `${item.submenu.indexOf(subItem) * 50}ms` : '0ms'
                            }}
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-600 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                <ThemeToggle />
              </div>
              {isAuthenticated && !tokenExpired ? (
                <div className="space-y-2 px-3 py-2">
                  <div className="flex items-center space-x-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profil"
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Profil Saya
                  </Link>
                  <Link
                    href="/transaksi"
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Riwayat Transaksi
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center"
                  >
                    <FiLogOut className="mr-2" />
                    Keluar
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  Masuk / Daftar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
