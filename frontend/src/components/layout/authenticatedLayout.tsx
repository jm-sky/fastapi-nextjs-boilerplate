import Navbar from "./navbar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-50 to-gray-50">
      <Navbar />
      <main className="flex-1 min-h-screen p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
