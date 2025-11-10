import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6 max-w-screen-2xl">{children}</div>
      </main>
    </div>
  );
}
