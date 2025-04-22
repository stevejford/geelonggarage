import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomResetPassword() {
  const { client } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Handle form submission
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
    } catch (err: any) {
      console.error("Error resetting password:", err);

      // Handle rate limiting errors
      if (err.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (err.errors && err.errors.length > 0) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Failed to reset password. Please try again or request a new reset link.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent h-16 z-0"></div>
        <div className="relative z-10 flex justify-center mt-8 mb-4">
          <img src="/logo-pdfs.png" alt="Geelong Garage Logo" className="h-16 w-auto drop-shadow-sm" />
        </div>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {isSuccess ? "Password Reset Complete" : "Set New Password"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isSuccess
                ? "Your password has been reset successfully"
                : "Create a new password for your account"}
            </p>
          </div>

          {!isSuccess ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-2 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                  </>
                ) : (
                  "Reset Password"
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
        </CardContent>
      </Card>
    </div>
  );
}
