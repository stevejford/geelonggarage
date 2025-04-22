import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle the OAuth callback by parsing the code from the URL
    // and exchanging it for a session
    handleRedirectCallback({
      // Redirect to the dashboard after authentication
      afterCallback: () => {
        navigate("/dashboard");
      },
    });
  }, [handleRedirectCallback, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <h2 className="text-xl font-medium text-gray-700">Completing authentication...</h2>
      <p className="text-gray-500 mt-2">Please wait while we sign you in.</p>
    </div>
  );
}
