import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const baseUrl = window.location.origin.replace('convex.app', 'convex.cloud');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent h-16 z-0"></div>
        <div className="relative z-10 flex justify-center mt-8 mb-4">
          <img src="/logo-pdfs.png" alt="Geelong Garage Logo" className="h-16 w-auto drop-shadow-sm" />
        </div>
        <CardContent className="p-8 pt-0">
          <SignIn
            routing="path"
            path="/sign-in"
            afterSignInUrl={`${baseUrl}/dashboard`}
            signUpUrl={`${baseUrl}/sign-up`}
            forgotPasswordUrl={`${baseUrl}/forgot-password`}
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "w-full shadow-none p-0 border-0",
                header: "text-center mb-6",
                headerTitle: "text-2xl font-bold text-gray-800",
                headerSubtitle: "text-gray-600",
                footer: "text-center mt-6",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors shadow-sm hover:shadow w-full",
                formButtonReset: "text-blue-600 hover:text-blue-800 font-medium",
                footerAction: "text-blue-600 hover:text-blue-800 font-medium",
                formFieldLabel: "font-medium text-gray-700 mb-1 text-sm",
                formFieldInput: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white",
                identityPreview: "border border-gray-200 rounded-md shadow-sm bg-gray-50",
                identityPreviewText: "text-gray-700",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-800",
                alert: "rounded-md",
                formFieldAction: "text-sm text-blue-600 hover:text-blue-800",
                otpCodeFieldInput: "!bg-white",
                formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
                formFieldInputShowPasswordIcon: "w-4 h-4",
                socialButtonsIconButton: "border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors",
                socialButtonsBlockButton: "border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500 bg-white px-2",
                formFieldWarningText: "text-amber-600 text-sm",
                formFieldErrorText: "text-red-600 text-sm"
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "iconButton",
                showOptionalFields: false
              },
              variables: {
                colorPrimary: "#2563eb",
                colorText: "#374151",
                colorTextSecondary: "#6b7280",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#374151",
                fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                borderRadius: "0.375rem"
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
