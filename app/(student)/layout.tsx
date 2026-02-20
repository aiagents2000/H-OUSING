"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Sidebar } from "@/components/shared/sidebar";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2 } from "lucide-react";
import { DoorProvider } from "@/hooks/use-door-open";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const isStaffUser = isLoaded && currentUser !== undefined && currentUser?.role === "staff";

  useEffect(() => {
    if (isStaffUser) {
      router.push("/staff/dashboard");
    }
  }, [isStaffUser, router]);

  if (!isLoaded || currentUser === undefined || isStaffUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DoorProvider>
      <div className="min-h-screen bg-background">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 border-r border-border/50 bg-white h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
            <Sidebar role="student" />
          </aside>

          {/* Mobile sidebar (kept for desktop hamburger fallback) */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-64 p-0 pt-8">
              <VisuallyHidden><SheetTitle>Menu</SheetTitle></VisuallyHidden>
              <div onClick={() => setSidebarOpen(false)}>
                <Sidebar role="student" />
              </div>
            </SheetContent>
          </Sheet>

          {/* Main content - pb-20 on mobile for bottom nav clearance */}
          <main
            id="main-content"
            className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </DoorProvider>
  );
}
