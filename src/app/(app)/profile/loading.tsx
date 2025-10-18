export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                      <div className="h-5 bg-gray-100 rounded w-full mt-1 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="flex space-x-4">
                  <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-md w-40 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
