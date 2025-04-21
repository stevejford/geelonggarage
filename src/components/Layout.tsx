import { Outlet } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Menu, Bell, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";

export default function Layout() {
  const { user } = useUser();
  const firstName = user?.firstName || "User";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Initialize sidebar state
  useEffect(() => {
    // Check if we should open the sidebar by default on larger screens
    if (window.innerWidth >= 768) { // 768px is the md breakpoint in Tailwind
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar - Full Width */}
      <header className="bg-white shadow-sm z-10 w-full">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Hamburger menu button - visible on all screen sizes */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </Button>

            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo-pdfs.png"
                alt="Geelong Garage Logo"
                className="h-10 w-auto"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Bell size={20} />
            </Button>

            {/* User profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-700">{firstName}</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-blue-600 text-white">{firstName[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - shown based on sidebarOpen state */}
        {sidebarOpen ? (
          <div className="fixed md:relative inset-0 z-50 md:z-0">
            {/* Overlay for mobile only */}
            <div
              className="fixed inset-0 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-10 h-full w-64 max-w-[80vw]">
              {/* Logo centered over sidebar */}
              <div className="absolute top-0 left-0 right-0 flex justify-center mt-2 z-10">
                <img
                  src="/logo-pdfs.png"
                  alt="Geelong Garage Logo"
                  className="h-12 w-auto"
                />
              </div>
              <Sidebar collapsed={false} />
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 transition-all duration-300">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
