import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CustomForgotPassword() {
  const { client } = useClerk();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);

      // Start the password reset process
      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setIsSuccess(true);
      toast.success("Password reset email sent");
    } catch (err: any) {
      console.error("Error sending reset email:", err);

      // Handle rate limiting errors
      if (err.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (err.errors && err.errors.length > 0) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Failed to send reset email. Please check your email and try again.");
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
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-2 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 text-green-700 rounded-md">
                <CheckCircle className="h-12 w-12 mb-2 text-green-600" />
                <p className="text-center">
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
