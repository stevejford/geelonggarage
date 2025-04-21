import { SignUp } from "@clerk/clerk-react";

export default function Register() {
  const baseUrl = window.location.origin.replace('convex.app', 'convex.cloud');
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp 
        routing="path" 
        path="/sign-up" 
        afterSignUpUrl={`${baseUrl}/dashboard`}
        signInUrl={`${baseUrl}/sign-in`}
      />
    </div>
  );
}
