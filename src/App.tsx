import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SearchProvider } from "./contexts/SearchContext";
import GoogleMapsProvider from "@/components/common/GoogleMapsProvider";
import { lazy, Suspense } from 'react';
import { PageLoader } from "@/components/ui/loading";
import Layout from "./components/Layout";

// Custom auth components
import CustomSignIn from "./components/auth/CustomSignIn";
import CustomSignUp from "./components/auth/CustomSignUp";
import CustomForgotPassword from "./components/auth/CustomForgotPassword";
import CustomResetPassword from "./components/auth/CustomResetPassword";
import SSOCallback from "./pages/auth/SSOCallback";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/settings/SettingsPage"));

// Lead pages
const LeadsPage = lazy(() => import("./pages/leads/LeadsPage"));
const NewLeadPage = lazy(() => import("./pages/leads/NewLeadPage"));
const LeadDetailPage = lazy(() => import("./pages/leads/LeadDetailPage"));

// Contact pages
const ContactsPage = lazy(() => import("./pages/contacts/ContactsPage"));
const NewContactPage = lazy(() => import("./pages/contacts/NewContactPage"));
const ContactDetailPage = lazy(() => import("./pages/contacts/ContactDetailPage"));

// Account pages
const AccountsPage = lazy(() => import("./pages/accounts/AccountsPage"));
const NewAccountPage = lazy(() => import("./pages/accounts/NewAccountPage"));
const AccountDetailPage = lazy(() => import("./pages/accounts/AccountDetailPage"));

// Quote pages
const QuotesPage = lazy(() => import("./pages/quotes/QuotesPage"));
const NewQuotePage = lazy(() => import("./pages/quotes/NewQuotePage"));
const QuoteDetailPage = lazy(() => import("./pages/quotes/QuoteDetailPage"));

// Work Order pages
const WorkOrdersPage = lazy(() => import("./pages/workOrders/WorkOrdersPage"));
const NewWorkOrderPage = lazy(() => import("./pages/workOrders/NewWorkOrderPage"));
const WorkOrderDetailPage = lazy(() => import("./pages/workOrders/WorkOrderDetailPage"));

// Invoice pages
const InvoicesPage = lazy(() => import("./pages/invoices/InvoicesPage"));
const NewInvoicePage = lazy(() => import("./pages/invoices/NewInvoicePage"));
const InvoiceDetailPage = lazy(() => import("./pages/invoices/InvoiceDetailPage"));

// WordPress integration
const TestInquiryPage = lazy(() => import("./pages/wordpress/TestInquiryPage"));

// Testing
const WorkflowTestPage = lazy(() => import("./pages/testing/WorkflowTestPage"));
const WorkflowTestPage2 = lazy(() => import("./pages/testing/WorkflowTestPage2"));
const UIConsistencyPage = lazy(() => import("./pages/testing/UIConsistencyPage"));
const ChartDataTestPage = lazy(() => import("./pages/testing/ChartDataTestPage"));

// Get Convex URL from environment variables or fallback to a default
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://patient-tern-95.convex.cloud";

// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Initialize Convex client with the URL
const convex = new ConvexReactClient(convexUrl);

// Check if Clerk key is available
if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

// Log environment info for debugging
console.log("Environment:", {
  NODE_ENV: import.meta.env.MODE,
  convexUrl,
  hasClerkKey: !!clerkPubKey,
});

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProvider client={convex}>
        <SearchProvider>
          <GoogleMapsProvider>
            <Router>
              <Routes>
                <Route path="/sign-in/*" element={<CustomSignIn />} />
                <Route path="/sign-up/*" element={<CustomSignUp />} />
                <Route path="/forgot-password" element={<CustomForgotPassword />} />
                <Route path="/reset-password" element={<CustomResetPassword />} />
                <Route path="/sso-callback" element={<SSOCallback />} />
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Layout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<PageLoader />}>
                      <Settings />
                    </Suspense>
                  } />

                  {/* Lead routes */}
                  <Route path="leads" element={
                    <Suspense fallback={<PageLoader />}>
                      <LeadsPage />
                    </Suspense>
                  } />
                  <Route path="leads/new" element={
                    <Suspense fallback={<PageLoader />}>
                      <NewLeadPage />
                    </Suspense>
                  } />
                  <Route path="leads/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <LeadDetailPage />
                    </Suspense>
                  } />

                  {/* Contact routes */}
                  <Route path="contacts" element={
                    <Suspense fallback={<PageLoader />}>
                      <ContactsPage />
                    </Suspense>
                  } />
                  <Route path="contacts/new" element={
                    <Suspense fallback={<PageLoader />}>
                      <NewContactPage />
                    </Suspense>
                  } />
                  <Route path="contacts/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <ContactDetailPage />
                    </Suspense>
                  } />

                  {/* Account routes */}
                  <Route path="accounts" element={
                    <Suspense fallback={<PageLoader />}>
                      <AccountsPage />
                    </Suspense>
                  } />
                  <Route path="accounts/new" element={
                    <Suspense fallback={<PageLoader />}>
                      <NewAccountPage />
                    </Suspense>
                  } />
                  <Route path="accounts/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <AccountDetailPage />
                    </Suspense>
                  } />

                  {/* Quote routes */}
                  <Route path="quotes" element={
                    <Suspense fallback={<PageLoader />}>
                      <QuotesPage />
                    </Suspense>
                  } />
                  <Route path="quotes/new" element={
                    <Suspense fallback={<PageLoader />}>
                      <NewQuotePage />
                    </Suspense>
                  } />
                  <Route path="quotes/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <QuoteDetailPage />
                    </Suspense>
                  } />

                  {/* Work Order routes */}
                  <Route path="work-orders" element={
                    <Suspense fallback={<PageLoader />}>
                      <WorkOrdersPage />
                    </Suspense>
                  } />
                  <Route path="work-orders/new" element={
                    <Suspense fallback={<PageLoader />}>
                      <NewWorkOrderPage />
                    </Suspense>
                  } />
                  <Route path="work-orders/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <WorkOrderDetailPage />
                    </Suspense>
                  } />

                  {/* Invoice routes */}
                  <Route path="invoices" element={
                    <Suspense fallback={<PageLoader />}>
                      <InvoicesPage />
                    </Suspense>
                  } />
                  <Route path="invoices/new" element={
                    <Suspense fallback={<PageLoader />}>
                      <NewInvoicePage />
                    </Suspense>
                  } />
                  <Route path="invoices/:id" element={
                    <Suspense fallback={<PageLoader />}>
                      <InvoiceDetailPage />
                    </Suspense>
                  } />

                  {/* WordPress integration */}
                  <Route path="test-inquiry" element={
                    <Suspense fallback={<PageLoader />}>
                      <TestInquiryPage />
                    </Suspense>
                  } />

                  {/* Testing */}
                  <Route path="testing/workflow" element={
                    <Suspense fallback={<PageLoader />}>
                      <WorkflowTestPage />
                    </Suspense>
                  } />
                  <Route path="testing/workflow2" element={
                    <Suspense fallback={<PageLoader />}>
                      <WorkflowTestPage2 />
                    </Suspense>
                  } />
                  <Route path="testing/chart-data" element={
                    <Suspense fallback={<PageLoader />}>
                      <ChartDataTestPage />
                    </Suspense>
                  } />
                  <Route path="testing/ui-consistency" element={
                    <Suspense fallback={<PageLoader />}>
                      <UIConsistencyPage />
                    </Suspense>
                  } />
                </Route>
              </Routes>
            </Router>
          </GoogleMapsProvider>
        </SearchProvider>
      </ConvexProvider>
      <Toaster />
    </ClerkProvider>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  // Wait for Clerk to load
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
