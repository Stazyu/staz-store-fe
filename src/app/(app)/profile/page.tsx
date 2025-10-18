import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function ProfilePage() {
  const session = await auth();
  console.log("Profile Page : ", session);

  if (!session) {
    redirect('/');
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profil Saya</h1>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Informasi Akun</h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID Pengguna</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Saldo</p>
                    <p className="mt-1 text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(user.balance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Informasi Pribadi</h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nomor Telepon</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user.phone_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user.whatsapp_id || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telegram</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user.telegram_id || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jual Offline</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {user.sell_offline ? 'Ya' : 'Tidak'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Informasi Sistem</h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dibuat Pada</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Diperbarui Pada</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Aksi</h2>
                <div className="mt-4 flex space-x-4">
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                  >
                    Edit Profil
                  </Link>
                  <Link
                    href="/profile/change-password"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                  >
                    Ganti Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
