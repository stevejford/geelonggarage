import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Menu, Bell, Search, DoorOpen, User, Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import FloatingSignOutButton from "./FloatingSignOutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Layout() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const firstName = user?.firstName || "User";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle sign out with proper session cleanup
  const handleSignOut = async () => {
    try {
      // Sign out of all sessions
      await signOut();

      // Clear any local storage or cookies that might persist session data
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to sign-in page
      navigate("/sign-in");

      // Force page reload to ensure clean state
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error during sign out:", error);
      // Fallback to direct navigation if signOut fails
      window.location.href = "/sign-in";
    }
  };

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

            {/* Logo in navbar */}
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

            {/* User profile with dropdown */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-700">{firstName}</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="bg-blue-600 text-white">{firstName[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || firstName}</p>
                      <p className="text-xs leading-none text-gray-500">{user?.emailAddresses[0].emailAddress}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <DoorOpen className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with improved transition */}
        <div
          className={`fixed md:relative inset-0 z-50 md:z-0 transition-all duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}`}
        >
          {/* Overlay for mobile only */}
          <div
            className={`fixed inset-0 bg-black/50 md:hidden transition-opacity duration-500 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-64 max-w-[80vw]">
            {/* Logo removed */}
            <Sidebar collapsed={false} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 transition-all duration-300">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Floating Sign Out Button */}
        <FloatingSignOutButton />
      </div>
    </div>
  );
}
