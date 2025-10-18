import DashboardMain from "@/components/admin/DashboardMain";

export default async function AdminDashboardPage() {

  return (
    // <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
    //   <div className="max-w-7xl mx-auto">
    //     <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
    //       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
    //       <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
    //         Welcome back, {session.user.name} ({session.user.email})
    //       </div>
    //     </div>

    <div>
      <DashboardMain />
    </div>
    //   </div>
    // </div>
  );
}
