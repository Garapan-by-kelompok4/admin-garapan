import { AuthProvider } from "@/components/layout/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { readSessionUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await readSessionUser();

  return (
    <AuthProvider initialUser={initialUser}>
      <div className="flex min-h-screen bg-surface-2">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 pb-8 pt-4 md:px-8 md:pb-12 md:pt-7">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
