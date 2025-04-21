import { SignUp } from "@clerk/clerk-react";

export default function Register() {
  const baseUrl = window.location.origin.replace('convex.app', 'convex.cloud');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <SignUp
          routing="path"
          path="/sign-up"
          afterSignUpUrl={`${baseUrl}/dashboard`}
          signInUrl={`${baseUrl}/sign-in`}
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "w-full shadow-none p-0",
              header: "text-center",
              footer: "text-center"
            }
          }}
        />
      </div>
    </div>
  );
}
