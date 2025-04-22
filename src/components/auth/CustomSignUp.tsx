import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // For email verification
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // State for form errors
  const [passwordError, setPasswordError] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    // Reset any previous errors
    setPasswordError("");

    try {
      setIsLoading(true);

      // Start the sign-up process
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send the email verification code
      await signUp.prepareEmailAddressVerification();

      // Change UI to show verification code input
      setPendingVerification(true);

    } catch (err: any) {
      console.error("Error signing up:", err);

      // Handle rate limiting errors
      if (err.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (err.errors && err.errors.length > 0) {
        const errorMessage = err.errors[0].message;

        // Check for password breach error
        if (errorMessage.includes("Password has been found in an online data breach")) {
          setPasswordError("This password has been found in a data breach. Please use a different password for your security.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Failed to sign up. Please check your information and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !pendingVerification) {
      return;
    }

    try {
      setVerifying(true);

      // Attempt to verify the code
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      // If successful, activate the session
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created successfully");
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Error verifying email:", err);

      // Handle rate limiting errors
      if (err.status === 429) {
        toast.error("Too many attempts. Please try again later.");
      } else if (err.errors && err.errors.length > 0) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Handle social sign-up
  const handleSocialSignUp = async (strategy: "oauth_google" | "oauth_github") => {
    if (!isLoaded) return;

    try {
      // Display a loading toast
      const loadingToast = toast.loading(`Connecting to ${strategy.replace('oauth_', '')}...`);

      // Start the OAuth flow
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });

      // Dismiss the loading toast if we get here
      toast.dismiss(loadingToast);
    } catch (err: any) {
      console.error(`Error signing up with ${strategy}:`, err);

      // Handle rate limiting errors
      if (err.status === 429) {
        toast.error(
          "Rate limit exceeded. This is common in development mode. "
          + "Please wait a few minutes before trying again, or configure OAuth in your Clerk dashboard."
        );
      } else if (err.message && err.message.includes("not configured")) {
        toast.error(
          `${strategy.replace('oauth_', '')} sign-up is not configured. "
          + "Please set it up in your Clerk dashboard.`
        );
      } else {
        toast.error(`Failed to sign up with ${strategy.replace('oauth_', '')}. Please try again.`);
      }
    }
  };

  // If clerk is not loaded yet
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent h-16 z-0"></div>
        <div className="relative z-10 flex justify-center mt-8 mb-4">
          <img src="/logo-pdfs.png" alt="Geelong Garage Logo" className="h-16 w-auto drop-shadow-sm" />
        </div>
        <CardContent className="p-8 pt-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {pendingVerification ? "Verify Your Email" : "Create Your Account"}
            </h2>
            <p className="text-gray-600 mt-2">
              {pendingVerification
                ? "We've sent a verification code to your email"
                : "Sign up to get started with Geelong Garage"}
            </p>
          </div>

          {/* Add CAPTCHA element for Clerk's bot protection */}
          <div id="clerk-captcha" className="mb-4"></div>

          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className={`pl-10 pr-10 ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    required
                    disabled={isLoading}
                    minLength={8}
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
                {passwordError ? (
                  <div className="text-sm text-red-600 mt-1 flex items-start gap-1">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-2 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative flex items-center justify-center mt-6 mb-4">
                <div className="border-t border-gray-200 absolute w-full"></div>
                <div className="bg-white px-4 text-sm text-gray-500 relative">
                  Or sign up with
                </div>
              </div>


              <div className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center w-full"
                  onClick={() => handleSocialSignUp("oauth_google")}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => navigate("/sign-in")}
                  >
                    Sign in
                  </Button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                  disabled={verifying}
                  autoFocus
                />
                <p className="text-xs text-gray-500">
                  Please check your email for a verification code and enter it above.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full py-2 mt-2"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Didn't receive a code?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-800"
                    onClick={async () => {
                      try {
                        await signUp.prepareEmailAddressVerification();
                        toast.success("Verification code resent");
                      } catch (err) {
                        toast.error("Failed to resend verification code");
                      }
                    }}
                    disabled={verifying}
                  >
                    Resend code
                  </Button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
