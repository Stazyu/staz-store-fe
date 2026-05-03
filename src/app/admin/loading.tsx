export default function AdminLoading() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-900 rounded-md"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>

      {/* Card / Table Skeleton */}
      <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        {/* Controls / Search Bar Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="h-10 w-full sm:w-72 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
            <div className="h-10 w-24 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
          </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-5 gap-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="space-y-4">
          {[...Array(6)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-4 items-center">
              <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-full"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-1/2"></div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-100 dark:bg-gray-900 rounded-md"></div>
                <div className="h-8 w-8 bg-gray-100 dark:bg-gray-900 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Skeleton */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="h-4 w-32 bg-gray-100 dark:bg-gray-900 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
