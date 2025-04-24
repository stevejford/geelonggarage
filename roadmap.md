# Roadmap for MVP and V1.0 Implementation

## Phase 1: Core Infrastructure & Authentication (2 weeks)

- [x] **1.1 Database Schema Enhancement**
  - [x] Schema Updates for Leads, Contacts, Accounts, Quotes, Work Orders, Invoices
  - [x] Establish relationships between entities
  - [x] Create appropriate indexes for efficient queries

- [x] **1.2 Authentication & Authorization Completion**
  - [x] Password Reset Frontend
  - [x] Role Management UI for admins
  - [x] RBAC Implementation for all MVP features

- [x] **1.3 Core API Development**
  - [x] CRUD Operations for all core entities
  - [x] Status Transitions for leads, quotes, work orders, invoices
  - [x] Number Generation utilities for quotes, work orders, invoices
  - [x] Fix critical TypeScript compilation errors in Convex functions

- [x] **1.4 Testing & Validation**
  - [x] Unit Tests for core APIs
  - [x] Integration Tests for data flow
  - [x] Manual Testing of authentication and authorization

## Phase 2: Lead & Contact Management (2 weeks)

- [x] **2.1 Lead Management UI**
  - [x] Lead Creation Form
  - [x] Lead List View (filterable/sortable)
  - [x] Lead Detail View
  - [x] Lead Status Workflow

- [x] **2.2 Contact & Account Management UI**
  - [x] Contact Creation Form
  - [x] Account/Property Creation Form
  - [x] Contact-Account Linking
  - [x] List Views for contacts and accounts

- [x] **2.3 WordPress Inquiry Integration**
  - [x] Endpoint Testing
  - [x] Lead Creation Flow

- [x] **2.4 Testing & Validation**
  - [x] UI Testing
  - [x] Data Validation
  - [x] Integration Testing

## Phase 3: Quote Management (2 weeks)

- [x] **3.1 Quote Creation & Management**
  - [x] Quote Creation Form
  - [x] Line Item Management
  - [x] Calculation Logic
  - [x] Quote Status Workflow

- [x] **3.2 Quote List & Detail Views**
  - [x] Quote List View
  - [x] Quote Detail View

- [x] **3.3 Testing & Validation**
  - [x] Calculation Testing
  - [x] Status Flow Testing
  - [x] UI Testing

## Phase 4: Work Order Management (2 weeks)

- [x] **4.1 Work Order Creation & Management**
  - [x] Work Order Creation (manual and from quotes)
  - [x] Technician Assignment
  - [x] Status Workflow

- [x] **4.2 Work Order List & Detail Views**
  - [x] Work Order List View
  - [x] Work Order Detail View

- [x] **4.3 Testing & Validation**
  - [x] Quote to Work Order Flow
  - [x] Status Flow Testing
  - [x] UI Testing

## Phase 5: Invoice Management (2 weeks)

- [x] **5.1 Invoice Creation & Management**
  - [x] Invoice Creation (manual, from work orders, from quotes)
  - [x] Line Item Management
  - [x] Calculation Logic
  - [x] Invoice Status Workflow

- [x] **5.2 Invoice List & Detail Views**
  - [x] Invoice List View
  - [x] Invoice Detail View

- [x] **5.3 Testing & Validation**
  - [x] Work Order to Invoice Flow
  - [x] Quote to Invoice Flow
  - [x] Calculation Testing
  - [x] Status Flow Testing

## Phase 6: MVP Integration & Testing (2 weeks)

- [x] **6.1 End-to-End Workflow Testing**
  - [x] Lead to Invoice Flow
  - [x] Data Consistency
  - [x] Performance Testing

- [x] **6.2 UI/UX Refinement**
  - [x] Consistency Check
  - [x] Navigation Improvements
  - [x] Error Handling

- [ ] **6.3 UI Component Implementation**
  - [ ] Tabs Component Implementation (Priority)
  - [ ] Alert Component Implementation (Priority)
  - [ ] Chart Visualizations Enhancement

- [ ] **6.4 MVP Deployment & Stabilization**
  - [x] Deployment
  - [ ] Monitoring
  - [ ] Bug Fixing
  Important: we will deploy to convex I will have to upgrade possibly so just prompt me to do that . if you need more info on deployment then use our context7 mcp

## Phase 7: V1.0 Document Generation & Delivery (3 weeks)

- [ ] **7.1 PDF Generation**
  - [ ] PDF Templates for quotes, work orders, invoices
    - [ ] Create responsive HTML templates based on provided designs
    - [ ] Implement dynamic data binding for customer/business information
    - [ ] Add support for line items with proper calculations
    - [ ] Include conditional sections based on document type
    - [ ] Design header/footer with logo and business details
  - [ ] Server-side Generation
    - [ ] Implement PDF generation using Puppeteer or similar library
    - [ ] Create Convex serverless functions for PDF generation
    - [ ] Add caching mechanism for generated PDFs
    - [ ] Implement proper error handling for failed generations
  - [ ] Preview Functionality
    - [ ] Create preview modal with accurate representation
    - [ ] Add zoom and page navigation controls
    - [ ] Implement print functionality
    - [ ] Add download options (PDF, possibly other formats)
    - [ ] Enable sharing via link or email
  Important: I have HTML templates to share with what I want the invoice and quote to look like - please ask for these when starting implementation

- [ ] **7.2 Email Integration**
  - [ ] Email Templates
    - [ ] Design responsive HTML email templates
    - [ ] Create templates for quotes, invoices, work orders
    - [ ] Implement dynamic content insertion
    - [ ] Add support for attachments (PDFs)
    - [ ] Design professional header/footer with branding
  - [ ] Email Sending UI
    - [ ] Create intuitive email composition interface
    - [ ] Implement template selection dropdown
    - [ ] Add recipient management (To, CC, BCC)
    - [ ] Create subject line suggestions based on content
    - [ ] Add email scheduling functionality
  - [ ] Custom Messages
    - [ ] Enable custom message editing with rich text
    - [ ] Create saved message templates for quick use
    - [ ] Implement personalization tokens
    - [ ] Add signature management
    - [ ] Create email tracking functionality
  Important: We will use Mailgun for email integration - use context7 MCP to get more implementation details when needed

- [ ] **7.3 Testing & Validation**
  - [ ] PDF Generation Testing
    - [ ] Test template rendering with various data inputs
    - [ ] Verify calculations and formatting in generated PDFs
    - [ ] Test PDF generation performance and optimization
    - [ ] Validate PDF compatibility across different viewers
    - [ ] Test edge cases (large documents, special characters)
  - [ ] Email Delivery Testing
    - [ ] Verify email delivery to various email providers
    - [ ] Test email rendering across different email clients
    - [ ] Validate attachment functionality
    - [ ] Test email tracking and analytics
    - [ ] Verify email scheduling and queuing
  - [ ] UI Testing
    - [ ] Test preview functionality across browsers
    - [ ] Validate responsive design for all interfaces
    - [ ] Test accessibility compliance
    - [ ] Perform usability testing with real users
    - [ ] Verify integration with existing workflows

## Phase 8: V1.0 Feature Completion & Refinement (Adjusted Timeline Needed)

- [ ] **8.1 Enhanced Data Tracking**
  - [ ] Comprehensive Customer Interaction History (Notes, Calls, Emails)
  - [ ] Detailed Service History per Property/Asset
  - [ ] Basic Inventory Management

- [ ] **8.2 Reckon Accounting Integration (Invoice Sync)**
  - [ ] Develop API for Invoice Export
  - [ ] Implement Invoice Sync to Reckon

- [ ] **8.3 Advanced Scheduling & Real-time Map Dispatch**
  - [ ] Web-based Dispatch Dashboard with Map View
  - [ ] Display Jobs on Map (Status Color-coding)
  - [ ] Display Technician Locations on Map (Real-time)
  - [ ] Drag-and-Drop Scheduling/Assignment
  - [ ] Nearest Technician Identification for Emergencies
  - [ ] Clickable Map Icons for Details (Job/Technician)
  - [ ] Filtering Options (Status, Technician, Date)

- [ ] **8.4 Enhanced Mobile Technician Application (Expo) with Location Sharing**
  - [ ] Develop Expo Mobile App (Basic structure with navigation setup)
  - [ ] Implement Real-time Location Sharing
  - [ ] View Assigned Jobs on In-App Map
  - [ ] Update Statuses from Mobile App (Reflects on Dispatch Map)
  - [ ] Record Parts/Materials Used
  - [ ] Capture Signatures
  - [ ] Add Notes and Upload Photos (Linked to Job)
  - [ ] Access Customer Service History
  - [ ] Offline Capabilities
  - [ ] Mobile-Optimized UI/UX

- [ ] **8.5 Basic Notifications**
  - [ ] Notification System
  - [ ] Email/SMS Integration
  - [ ] Appointment Reminders

- [ ] **8.6 Testing & Validation**
  - [ ] Data Tracking Testing
  - [ ] Integration Testing (Reckon)
  - [ ] Scheduling & Dispatch Testing (Map Features)
  - [ ] Mobile App Testing (Location, Status, Data Entry)
  - [ ] Notification Testing

## Phase 9: V1.0 Dashboards & Reporting (2 weeks)

- [x] **9.1 Role-Specific Dashboards**
  - [x] CSR Dashboard
  - [x] Technician Dashboard
  - [x] Admin Dashboard

- [x] **9.2 Basic Reporting**
  - [x] Report Framework
  - [x] Sales Performance Report
  - [x] Accounts Receivable Aging Report

- [ ] **9.3 Testing & Validation**
  - [ ] Dashboard Testing
  - [ ] Report Testing
  - [ ] Performance Testing

## Phase 10: V1.0 UI/UX Polish & Data Handling (2 weeks)

- [ ] **10.1 UI/UX Polish**
  - [ ] Design System Consistency
  - [ ] Responsive Design
  - [ ] User Feedback
  - [ ] Navigation Improvements

- [ ] **10.2 Data Handling & Audit**
  - [ ] Input Validation
  - [ ] Audit Trail
  - [ ] Data Integrity

- [ ] **10.3 Final Testing & Deployment**
  - [ ] Comprehensive Testing
  - [ ] User Acceptance Testing
  - [ ] Production Deployment
  - [ ] Monitoring & Support

## Timeline Summary

- **MVP Development**: Phases 1-6 (12 weeks)
- **V1.0 Development**: Phases 7-10 (Adjusted Timeline Needed)
- **Total Timeline**: To be determined after scoping new features

## Verification Strategy

To ensure each phase is working correctly before moving to the next:

1. **Unit Testing**: Automated tests for individual components and APIs
2. **Integration Testing**: Tests for interactions between components
3. **Manual Testing**: Hands-on testing of UI and workflows
4. **Checkpoint Reviews**: Review completion of each phase before proceeding
5. **Continuous Integration**: Automated build and test process
6. **Staging Environment**: Test in a production-like environment before deployment

## Notes

- To mark an item as complete, change `[ ]` to `[x]` in the markdown file
- Each phase should be fully tested before moving to the next phase
- Regular progress reviews should be conducted to identify and address any issues early
