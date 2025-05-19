import type { ReactNode } from "react";
import { AdminSidebar } from "~/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <AdminSidebar />
      <div className="flex-grow p-4 md:p-8 md:pt-4">
        {children}
      </div>
    </div>
  );
} 