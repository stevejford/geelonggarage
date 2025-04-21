import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/settings/SettingsPage";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Lead pages
import LeadsPage from "./pages/leads/LeadsPage";
import NewLeadPage from "./pages/leads/NewLeadPage";
import LeadDetailPage from "./pages/leads/LeadDetailPage";

// Contact pages
import ContactsPage from "./pages/contacts/ContactsPage";
import NewContactPage from "./pages/contacts/NewContactPage";
import ContactDetailPage from "./pages/contacts/ContactDetailPage";

// Account pages
import AccountsPage from "./pages/accounts/AccountsPage";
import NewAccountPage from "./pages/accounts/NewAccountPage";
import AccountDetailPage from "./pages/accounts/AccountDetailPage";

// Quote pages
import QuotesPage from "./pages/quotes/QuotesPage";
import NewQuotePage from "./pages/quotes/NewQuotePage";
import QuoteDetailPage from "./pages/quotes/QuoteDetailPage";

// Work Order pages
import WorkOrdersPage from "./pages/workOrders/WorkOrdersPage";
import NewWorkOrderPage from "./pages/workOrders/NewWorkOrderPage";
import WorkOrderDetailPage from "./pages/workOrders/WorkOrderDetailPage";

// Invoice pages
import InvoicesPage from "./pages/invoices/InvoicesPage";
import NewInvoicePage from "./pages/invoices/NewInvoicePage";
import InvoiceDetailPage from "./pages/invoices/InvoiceDetailPage";

// WordPress integration
import TestInquiryPage from "./pages/wordpress/TestInquiryPage";

// Testing
import WorkflowTestPage from "./pages/testing/WorkflowTestPage";
import WorkflowTestPage2 from "./pages/testing/WorkflowTestPage2";
import UIConsistencyPage from "./pages/testing/UIConsistencyPage";

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
        <Router>
          <Routes>
            <Route path="/sign-in/*" element={<Login />} />
            <Route path="/sign-up/*" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />

              {/* Lead routes */}
              <Route path="leads" element={<LeadsPage />} />
              <Route path="leads/new" element={<NewLeadPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />

              {/* Contact routes */}
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="contacts/new" element={<NewContactPage />} />
              <Route path="contacts/:id" element={<ContactDetailPage />} />

              {/* Account routes */}
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="accounts/new" element={<NewAccountPage />} />
              <Route path="accounts/:id" element={<AccountDetailPage />} />

              {/* Quote routes */}
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="quotes/new" element={<NewQuotePage />} />
              <Route path="quotes/:id" element={<QuoteDetailPage />} />

              {/* Work Order routes */}
              <Route path="work-orders" element={<WorkOrdersPage />} />
              <Route path="work-orders/new" element={<NewWorkOrderPage />} />
              <Route path="work-orders/:id" element={<WorkOrderDetailPage />} />

              {/* Invoice routes */}
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="invoices/new" element={<NewInvoicePage />} />
              <Route path="invoices/:id" element={<InvoiceDetailPage />} />

              {/* WordPress integration */}
              <Route path="test-inquiry" element={<TestInquiryPage />} />

              {/* Testing */}
              <Route path="testing/workflow" element={<WorkflowTestPage />} />
              <Route path="testing/workflow2" element={<WorkflowTestPage2 />} />
              <Route path="testing/ui-consistency" element={<UIConsistencyPage />} />
            </Route>
          </Routes>
        </Router>
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
