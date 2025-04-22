import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { client } = useClerk();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setIsSuccess(true);
      toast.success("Password reset email sent");
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send reset email. Please try again.");
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
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-600 mt-2">
              {isSuccess
                ? "Check your email for a reset link"
                : "Enter your email to receive a password reset link"}
            </p>
          </div>

        {!isSuccess ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Send Reset Link
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              <p>
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/sign-in")}
            >
              Return to Login
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
