import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AccessDeniedProps {
  message?: string;
}

export default function AccessDenied({ message = "You don't have permission to access this page." }: AccessDeniedProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <Shield className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">{message}</p>
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </Button>
    </div>
  );
}
