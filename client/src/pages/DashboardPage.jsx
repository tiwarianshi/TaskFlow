import Sidebar from "../components/dashboard/Sidebar";

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-10 text-white">
        <h1 className="text-3xl font-bold mb-4">
          Dashboard
        </h1>

        <p className="text-gray-400">
          Welcome to TaskFlow 🚀
        </p>
      </main>

    </div>
  );
}

export default DashboardPage;