import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  const baseUrl = window.location.origin.replace('convex.app', 'convex.cloud');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        routing="path"
        path="/sign-in"
        afterSignInUrl={`${baseUrl}/dashboard`}
        signUpUrl={`${baseUrl}/sign-up`}
        forgotPasswordUrl={`${baseUrl}/forgot-password`}
      />
    </div>
  );
}
