import { Outlet, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Container } from "./ui/container";
import { Menu, Bell, DoorOpen, User, Settings } from "lucide-react";
import NavbarSearch from "./NavbarSearch";
import Sidebar from "./Sidebar";
import TeamChat from "./TeamChat";
import { useState, useEffect } from "react";

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
      {/* Top Navigation Bar - Fixed to top */}
      <header className="bg-white shadow-sm z-50 w-full fixed top-0 left-0">
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

          {/* Enhanced Search - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-3xl hidden md:block">
              <NavbarSearch />
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
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

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar with improved transition */}
        <div
          className={`fixed md:relative inset-0 top-16 z-40 md:z-0 transition-all duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}`}
        >
          {/* Overlay for mobile only */}
          <div
            className={`fixed inset-0 top-16 bg-black/50 md:hidden transition-opacity duration-500 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-64 max-w-[80vw]">
            {/* Logo removed */}
            <Sidebar collapsed={false} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 transition-all duration-300">
          <Container size="xl" padding="md">
            <Outlet />
          </Container>
        </main>


        {/* Team Chat */}
        <TeamChat />
      </div>
    </div>
  );
}
