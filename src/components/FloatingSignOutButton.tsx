import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { LogOut, DoorOpen } from "lucide-react";
import { Button } from "./ui/button";
// Tooltip removed as requested

export default function FloatingSignOutButton() {
  const navigate = useNavigate();
  const { signOut } = useClerk();

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

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={handleSignOut}
        className="bg-transparent border border-blue-600 text-blue-100 hover:bg-blue-700 hover:text-white rounded-md shadow-md flex items-center justify-center py-2 px-4"
      >
        <DoorOpen size={16} className="mr-2" />
        Logout
      </Button>
    </div>
  );
}
