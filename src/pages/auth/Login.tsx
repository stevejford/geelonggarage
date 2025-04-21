import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  const baseUrl = window.location.origin.replace('convex.app', 'convex.cloud');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src="/logo-pdfs.png" alt="Geelong Garage Logo" className="h-16 w-auto" />
        </div>

        <SignIn
          routing="path"
          path="/sign-in"
          afterSignInUrl={`${baseUrl}/dashboard`}
          signUpUrl={`${baseUrl}/sign-up`}
          forgotPasswordUrl={`${baseUrl}/forgot-password`}
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "w-full shadow-none p-0",
              header: "text-center",
              footer: "text-center",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
              formButtonReset: "text-blue-600 hover:text-blue-800 font-medium",
              footerAction: "text-blue-600 hover:text-blue-800 font-medium",
              formFieldLabel: "font-medium text-gray-700 mb-1",
              formFieldInput: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              identityPreview: "border border-gray-200 rounded-md shadow-sm",
              identityPreviewText: "text-gray-700",
              identityPreviewEditButton: "text-blue-600 hover:text-blue-800",
              alert: "rounded-md"
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton"
            }
          }}
        />
      </div>
    </div>
  );
}
