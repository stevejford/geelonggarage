import { Outlet, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Menu, Bell, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Layout() {
  const { user } = useUser();
  const firstName = user?.firstName || "User";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </Button>

              <div className="relative w-64 hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Bell size={20} />
              </Button>
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

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
