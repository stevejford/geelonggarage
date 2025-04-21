# Revised MVP Plan & Path to V1.0 (April 2025)

## 1. Introduction

**Goal:** Define a Minimum Viable Product (MVP) focusing on the core workflow of lead capture, quoting, service delivery (work order), and invoicing. This revised MVP prioritizes stability, essential functionality, and a streamlined user experience. This document also outlines the key enhancements required to reach a commercially viable "Version 1.0".

**Core Principles (MVP & V1.0):**
*   **Stability First:** Ensure core features are robust and reliable.
*   **Essential Workflow:** Enable the end-to-end process from lead to invoice.
*   **Simplicity (MVP):** Defer complex features, advanced configurations, and non-critical integrations initially.
*   **Polish & Completeness (V1.0):** Add key features, improve UI/UX, and ensure commercial readiness.
*   **Leverage Existing Work:** Build upon the completed foundational elements.

## 2. Core MVP Features (Baseline)

The MVP includes the following core functionalities:

1.  **Authentication & Authorization:**
    *   User Login/Logout (Existing).
    *   Password Reset (Existing backend, requires frontend completion for MVP/V1.0).
    *   Basic Role-Based Access Control (Admin, User/CSR, Technician).
2.  **Lead Management:**
    *   Manual Lead Creation & Editing (Basic form: name, contact info, source, status).
    *   Lead List View (Filterable/Sortable).
    *   Lead Status Tracking (New, Contacted, Qualified, Unqualified, Converted).
    *   WordPress Inquiry Capture (Existing endpoint).
3.  **Contact & Account Management:**
    *   Manual Contact Creation & Editing.
    *   Manual Account (Property/Location) Creation & Editing.
    *   Basic Linking between Contacts and Accounts.
    *   List Views for Contacts & Accounts.
4.  **Quote Management:**
    *   Quote Creation (linked to Contact/Account).
    *   Assign Human-Readable Quote Number.
    *   Add/Edit/Delete Line Items (Description, Qty, Unit Price).
    *   Automatic Subtotal/Grand Total Calculation (Basic).
    *   Quote Status Tracking (Draft, Presented, Accepted, Declined).
    *   Quote List View.
    *   *Deferred in MVP:* PDF Generation, Emailing Quotes, Advanced Pricing Rules.
5.  **Work Order Management:**
    *   Work Order Creation (Manual, and from 'Accepted' Quote).
    *   Assign Human-Readable Work Order Number.
    *   Link to Contact/Account and originating Quote.
    *   Basic Status Tracking (Pending, Scheduled, In Progress, Completed, Cancelled).
    *   Assign Technician(s).
    *   Work Order List View.
    *   *Deferred in MVP:* Detailed Scheduling UI, Parts Tracking, Complex Status Automations, Technician Mobile View Optimizations, PDF Generation.
6.  **Invoice Management:**
    *   Invoice Creation (Manual, and from 'Completed' Work Order or 'Accepted' Quote).
    *   Assign Human-Readable Invoice Number.
    *   Link to Contact/Account and originating WO/Quote.
    *   Add/Edit/Delete Line Items.
    *   Automatic Subtotal/Grand Total Calculation.
    *   Basic Status Tracking (Draft, Sent, Paid, Cancelled).
    *   Invoice List View.
    *   *Deferred in MVP:* PDF Generation, Emailing Invoices, Payment Tracking, Accounting Integration.
7.  **Basic Settings (Admin):**
    *   User List View.
    *   Assign/Change User Roles.
    *   *Deferred in MVP:* Role Permission Editing UI, Advanced UI Configuration.

## 3. V1.0 Enhancements (Commercial Release Scope)

Building upon the MVP baseline, Version 1.0 will incorporate the following enhancements for commercial viability:

1.  **Document Generation & Delivery:**
    *   **PDF Generation:** Implement server-side PDF generation for Quotes, Work Orders, and Invoices using consistent branding and templates. (Ref: Roadmap Epics 5, 6, 8, 13)
    *   **PDF Preview:** Allow users to preview generated PDFs within the application. (Ref: Roadmap Ticket 4.1)
    *   **Emailing Documents:** Enable sending generated PDFs (Quotes, Invoices) directly from the application to the associated contact, with options for custom messages. (Ref: Roadmap Tickets 4.3, 4.4, 4.5)
2.  **Feature Completion & Refinement:**
    *   **Password Reset Frontend:** Complete the user interface for the password reset flow. (Ref: Roadmap Ticket UR-5)
    *   **Work Order Scheduling:** Implement a functional scheduling UI (e.g., basic calendar view or enhanced list view with date assignments) for Work Orders. (Ref: Roadmap Ticket WO-4)
    *   **Technician Experience:** Enhance the Technician's view with a dedicated dashboard ("My Day") showing assigned Work Orders and enabling efficient status updates. (Ref: Roadmap Tickets TM-1, TM-2, DB-4)
3.  **Automation & Communication:**
    *   **Basic Notifications:** Implement essential automated notifications, such as appointment reminders (SMS/Email). (Ref: Roadmap Epics 7, 10)
    *   *(Optional)* **Simple Workflows:** Consider implementing 1-2 high-value, simple automated workflows (e.g., status change triggers basic notification). Complex workflows remain post-V1.0. (Ref: Roadmap Epic 11)
4.  **Dashboards & Reporting:**
    *   **Role-Specific Dashboards:** Introduce initial versions of key dashboards beyond the basic landing page (e.g., CSR Command Center, Technician My Day). (Ref: Roadmap Epic 9, Tickets DB-3, DB-4)
    *   **Basic Reporting:** Implement a foundational reporting module with 1-2 essential reports (e.g., Sales Performance, Accounts Receivable Aging). (Ref: Roadmap Epic 20, Tickets RPT-1, RPT-2, RPT-4)
5.  **UI/UX Polish:**
    *   **Consistency:** Ensure strict adherence to the design system (shadcn/ui) for a cohesive look and feel.
    *   **Responsiveness:** Guarantee usability across major device types (desktop, tablet, mobile).
    *   **Intuitive Workflows:** Refine user flows for key tasks to be logical and efficient.
    *   **User Feedback:** Implement clear loading indicators, informative success messages (enhanced toasts), and user-friendly error messages/handling.
    *   **Navigation:** Implement functional breadcrumbs for clear context. (Ref: Roadmap Ticket UIX-1)
6.  **Data Handling & Audit:**
    *   **Validation:** Enhance data validation on all user input forms.
    *   **Audit Trail:** Implement a basic audit trail logging key events (e.g., creation/deletion/status changes of core records). (Ref: Roadmap Tickets AUDIT-1, AUDIT-2)
    *   **Data Integrity:** Consider potential data migration needs if schema evolves significantly. Note Convex's backup capabilities.

## 4. User Roles & Permissions (V1.0 Scope)

*   **Admin:** Full access to all MVP & V1.0 features. Requires functional UI for managing Roles & Permissions definitions (Ref: Roadmap Ticket UR-4).
*   **User/CSR:** Access expanded to include V1.0 features like PDF generation/emailing, enhanced dashboards, and basic reporting relevant to their role.
*   **Technician:** Access to enhanced "My Day" dashboard and potentially improved Work Order detail views.
*   *Note: RBAC enforcement must cover all new V1.0 features and views.*

## 5. Required Pages/Views (V1.0 Additions)

In addition to MVP pages:
*   `/password-reset/...` (Frontend flow completion)
*   `/dashboard/csr` (Example Role Dashboard)
*   `/dashboard/tech` (Example Role Dashboard)
*   `/work-orders/schedule` (Or enhanced list view)
*   `/reports` (List/Index)
*   `/reports/sales-performance` (Example Report)
*   `/reports/ar-aging` (Example Report)
*   `/settings/roles` (Admin Only - View/Edit Role Definitions)
*   *(Implicit):* UI elements for PDF Preview, Email Sending Modals.

## 6. Basic Navigation/Sidebar Structure (V1.0)

*   Maintain consistent sidebar structure.
*   Update visibility based on roles for new V1.0 sections:
    *   **Admin, CSR:** Reports (subset based on role)
    *   **Admin:** Settings (Users, Roles)
    *   **All Roles:** Role-specific Dashboard link (if applicable) replacing generic `/dashboard`.
*   Ensure logical grouping of items (e.g., Reports section).

## 7. Key Simplifications/Deferred Items (Post-V1.0)

The following remain deferred beyond V1.0:
*   Advanced/Configurable Dashboards & Widgets
*   Complex/Customizable Workflows
*   Inventory Management (Parts, Stock Levels)
*   Advanced Pricing Rules, Discounts, Complex Tax Logic
*   Full Accounting Integration (e.g., QuickBooks Sync)
*   Field-Level Security Configuration
*   Advanced UI Customization (User Overrides)
*   Customer Portal Features
*   Offline Mode for Technicians
*   Global Search Functionality
*   Advanced Reporting Features (Custom Reports, Complex Filters, Exports beyond CSV)