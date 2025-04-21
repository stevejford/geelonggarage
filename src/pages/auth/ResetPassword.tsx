import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { client } = useClerk();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetData, setResetData] = useState<{ token?: string; code?: string }>({});

  // Extract token and code from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token") || undefined;
    const code = searchParams.get("code") || undefined;

    if (token || code) {
      setResetData({ token, code });
    } else {
      toast.error("Invalid reset link. Please request a new password reset.");
      navigate("/forgot-password");
    }
  }, [location.search, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // First, create a sign-in attempt with the reset token/code
      const signIn = await client.signIn.create({
        strategy: "reset_password_email_code",
        ...resetData,
      });

      // Then, reset the password
      await signIn.resetPassword({ password });

      setIsSuccess(true);
      toast.success("Password reset successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again or request a new reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {isSuccess ? "Password Reset Complete" : "Set New Password"}
          </h2>
          <p className="text-gray-500 mt-2">
            {isSuccess
              ? "Your password has been reset successfully"
              : "Create a new password for your account"}
          </p>
        </div>

        {!isSuccess ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                "Resetting..."
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Reset Password
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 bg-green-50 text-green-700 rounded-md">
              <CheckCircle className="h-12 w-12 mb-2 text-green-600" />
              <p className="text-center">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => navigate("/sign-in")}
            >
              Go to Login
            </Button>
          </div>
        )}

        {!isSuccess && (
          <div className="text-center pt-4">
            <Button
              variant="link"
              onClick={() => navigate("/sign-in")}
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
