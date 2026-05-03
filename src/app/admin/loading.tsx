import { FiRefreshCw } from "react-icons/fi";

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <FiRefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
        Memuat halaman...
      </p>
    </div>
  );
}
