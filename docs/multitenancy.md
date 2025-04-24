# Multi-Tenant SaaS Architecture

This document outlines the architecture and implementation details for transforming the Geelong Garage application into a multi-tenant SaaS product using Clerk, Convex, and Render.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Multi-Tenancy Models](#multi-tenancy-models)
3. [Clerk Integration](#clerk-integration)
4. [Convex Multi-Tenancy](#convex-multi-tenancy)
5. [Render Deployment](#render-deployment)
6. [Tenant Provisioning](#tenant-provisioning)
7. [Authentication Flow](#authentication-flow)
8. [Data Isolation](#data-isolation)
9. [Cost Considerations](#cost-considerations)
10. [Security Best Practices](#security-best-practices)
11. [Implementation Roadmap](#implementation-roadmap)
12. [Tenant Customization](#tenant-customization)

## Architecture Overview

The SaaS version of Geelong Garage will use:

- **Clerk**: For authentication, user management, and organization-based multi-tenancy
- **Convex**: For backend data storage and business logic
- **Render**: For deployment and hosting of tenant instances

The architecture follows a "silo model" where each tenant gets their own isolated deployment while maintaining a unified authentication system.

```
┌─────────────────────────────────────────────────────────────┐
│                     Clerk (Authentication)                   │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│  │ Organization│   │ Organization│   │ Organization│        │
│  │  (Tenant 1) │   │  (Tenant 2) │   │  (Tenant 3) │        │
│  └─────────────┘   └─────────────┘   └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Render Deploy  │ │  Render Deploy  │ │  Render Deploy  │
│   (Tenant 1)    │ │   (Tenant 2)    │ │   (Tenant 3)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Convex Database │ │ Convex Database │ │ Convex Database │
│   (Tenant 1)    │ │   (Tenant 2)    │ │   (Tenant 3)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Multi-Tenancy Models

### Silo Model (Recommended)

Each tenant gets their own isolated deployment:

**Advantages:**
- Complete data isolation
- Customization per tenant
- Independent scaling
- Easier compliance with data residency requirements

**Disadvantages:**
- Higher infrastructure costs
- More complex deployment pipeline
- Harder to maintain and update

### Shared Infrastructure Model (Alternative)

A single application with tenant isolation at the data level:

**Advantages:**
- Lower infrastructure costs
- Easier maintenance and updates
- Simpler architecture

**Disadvantages:**
- Requires careful data isolation
- Risk of data leakage between tenants
- Less flexibility for tenant-specific customizations

## Clerk Integration

### Organization-Based Multi-Tenancy

Clerk's Organizations feature provides built-in multi-tenancy support:

1. **Organization = Tenant**:
   - Each tenant is represented as a Clerk Organization
   - Users can belong to multiple organizations/tenants
   - Organization-specific roles and permissions

2. **JWT Configuration**:
   ```json
   {
     "aud": "convex",
     "org": {
       "id": "{{org.id}}",
       "role": "{{org.role}}",
       "slug": "{{org.slug}}"
     },
     "user": {
       "id": "{{user.id}}",
       "email": "{{user.primary_email_address}}"
     }
   }
   ```

3. **Organization Switching**:
   - Implement UI for switching between organizations
   - Redirect to the appropriate tenant URL when switching

### Role-Based Access Control

Leverage Clerk's organization roles:

```typescript
// Check if user has admin role in current organization
const { has } = useOrganization();
if (has({ role: "org:admin" })) {
  // Show admin features
}
```

## Convex Multi-Tenancy

### Separate Deployments Approach

Create a separate Convex deployment for each tenant:

1. **Deployment Naming**:
   - Use a consistent naming pattern: `app-{tenant-id}`
   - Store the mapping between tenants and deployments

2. **Configuration**:
   - Each deployment has its own URL and API keys
   - Environment variables in Render specify the Convex deployment

3. **Data Migration**:
   - Develop scripts for initial data setup
   - Create tools for migrating between deployments if needed

### Tenant Field Approach (Alternative)

If using a shared Convex deployment:

1. **Schema Modification**:
   ```typescript
   // Add tenantId to all tables
   users: defineTable({
     firstName: v.string(),
     lastName: v.string(),
     email: v.string(),
     tenantId: v.string(),
     // ...other fields
   }).index("by_email", ["email"])
     .index("by_tenant", ["tenantId"]),
   ```

2. **Query Filtering**:
   ```typescript
   export const listUsers = query({
     handler: async (ctx) => {
       const identity = await ctx.auth.getUserIdentity();
       if (!identity) return [];

       const tenantId = identity.org?.id;
       return await ctx.db
         .query("users")
         .filter(q => q.eq(q.field("tenantId"), tenantId))
         .collect();
     }
   });
   ```

## Render Deployment

### Blueprint Specification

Create a `render.yaml` blueprint for automated deployments:

```yaml
# render.yaml
services:
  - type: web
    name: garage-{{.Env.TENANT_ID}}
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: TENANT_ID
        value: {{.Env.TENANT_ID}}
      - key: CLERK_PUBLISHABLE_KEY
        value: {{.Env.CLERK_PUBLISHABLE_KEY}}
      - key: CLERK_SECRET_KEY
        sync: false
      - key: CONVEX_DEPLOYMENT
        value: {{.Env.CONVEX_DEPLOYMENT_PREFIX}}-{{.Env.TENANT_ID}}
```

### Custom Domain Configuration

Set up custom domains for each tenant:

1. **Subdomain Approach**:
   - `tenant1.geelonggarage.com`
   - `tenant2.geelonggarage.com`

2. **Custom Domain Approach**:
   - `tenant1-company.com` (with DNS configuration)
   - Requires additional setup in Render and Clerk

## Tenant Provisioning

### Provisioning API

Create an admin API for tenant provisioning:

```typescript
export const createTenant = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify the current user is a super admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.role !== "super_admin") {
      throw new ConvexError("Only super admins can create tenants");
    }

    // 2. Create Clerk organization
    const clerk = await getClerkClient();
    const org = await clerk.organizations.createOrganization({
      name: args.name,
      slug: args.slug,
    });

    // 3. Add admin user to organization
    await clerk.organizations.addMember({
      organizationId: org.id,
      userId: args.adminEmail,
      role: "org:admin",
    });

    // 4. Trigger Render deployment via webhook
    await fetch("https://provisioning-service.geelonggarage.com/create-tenant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PROVISIONING_API_KEY}`
      },
      body: JSON.stringify({
        tenantId: args.slug,
        orgId: org.id,
        adminEmail: args.adminEmail,
      }),
    });

    return { success: true, tenantId: args.slug, orgId: org.id };
  }
});
```

### Provisioning Service

A separate service to handle Render API calls:

1. **Service Responsibilities**:
   - Create new Render deployments
   - Set up new Convex deployments
   - Configure environment variables
   - Initialize tenant data

2. **Implementation**:
   - Node.js service with Express
   - Secure API endpoints
   - Logging and monitoring
   - Error handling and retries

## Authentication Flow

### Single Sign-On

Implement single sign-on across tenants:

1. **Main Authentication**:
   - Users sign in at `auth.geelonggarage.com`
   - Clerk handles authentication and session management

2. **Tenant Access**:
   - After authentication, show available organizations
   - Redirect to the selected tenant's URL

3. **Session Sharing**:
   - Clerk maintains the session across subdomains
   - No need to re-authenticate when switching tenants

### Tenant-Specific Login

For direct tenant access:

1. **Subdomain Recognition**:
   - Detect the tenant from the subdomain
   - Pre-select the organization in Clerk

2. **Organization Enforcement**:
   - Ensure the user belongs to the requested organization
   - Redirect to organization selection if needed

## Data Isolation

### Ensuring Tenant Data Separation

Implement strict data isolation:

1. **Access Control**:
   - Every database query must include tenant filtering
   - Create middleware/hooks to enforce tenant isolation

2. **Validation**:
   - Validate tenant ID in all mutations
   - Prevent cross-tenant data access

3. **Audit Logging**:
   - Log all data access with tenant information
   - Set up alerts for potential isolation breaches

## Cost Considerations

### Infrastructure Costs

Estimate per-tenant costs:

1. **Render**:
   - Web service: $7/month (minimum)
   - Additional services as needed

2. **Convex**:
   - Free tier: 1M function calls, 1GB storage
   - Beyond free tier: Usage-based pricing

3. **Clerk**:
   - Free for first 500 MAU
   - $0.05/MAU beyond free tier

### Pricing Strategy

Develop a pricing strategy:

1. **Tiered Pricing**:
   - Basic: $X/month (limited users, features)
   - Professional: $Y/month (more users, all features)
   - Enterprise: Custom pricing (dedicated resources)

2. **Per-User Pricing**:
   - Base fee + per-user fee
   - Volume discounts for larger tenants

3. **Feature-Based Pricing**:
   - Core features in base plan
   - Premium features as add-ons

## Security Best Practices

### Tenant Isolation

Ensure proper tenant isolation:

1. **Code Review**:
   - Review all database queries for tenant filtering
   - Use automated tools to detect isolation issues

2. **Testing**:
   - Create tests specifically for tenant isolation
   - Simulate cross-tenant access attempts

3. **Monitoring**:
   - Set up alerts for unusual access patterns
   - Regular security audits

### Authentication Security

Strengthen authentication:

1. **MFA Enforcement**:
   - Require multi-factor authentication for admins
   - Encourage MFA for all users

2. **Session Management**:
   - Appropriate session timeouts
   - Device management and session revocation

3. **Access Logging**:
   - Log all authentication events
   - Monitor for suspicious activities

## Implementation Roadmap

### Phase 1: Foundation

1. **Clerk Organization Setup**:
   - Configure Clerk for organization-based multi-tenancy
   - Set up JWT templates with organization information

2. **Convex Multi-Tenancy**:
   - Implement tenant isolation in database schema
   - Create tenant-aware queries and mutations

3. **Render Blueprint**:
   - Create deployment blueprint
   - Test automated deployment

### Phase 2: Provisioning

1. **Admin Portal**:
   - Build tenant management UI
   - Implement tenant creation workflow

2. **Provisioning Service**:
   - Develop service for automated tenant setup
   - Create data initialization scripts

3. **Tenant Lifecycle Management**:
   - Implement tenant suspension/reactivation
   - Develop tenant data export/deletion

### Phase 3: Enhancement

1. **Tenant Customization**:
   - Allow tenant-specific branding
   - Support tenant-specific configurations

2. **Analytics and Monitoring**:
   - Implement tenant usage metrics
   - Set up tenant-specific monitoring

3. **Billing Integration**:
   - Connect to billing system
   - Implement usage-based billing

## Tenant Customization

The silo model excels at supporting tenant-specific customizations. Here's how to implement comprehensive customization capabilities:

### Branding and UI Customization

1. **Tenant Configuration Table**:
   ```typescript
   // In convex/schema.ts
   tenantConfig: defineTable({
     tenantId: v.string(),
     logoUrl: v.optional(v.string()),
     primaryColor: v.optional(v.string()),
     secondaryColor: v.optional(v.string()),
     fontFamily: v.optional(v.string()),
     customCss: v.optional(v.string()),
     customJs: v.optional(v.string()),
     favicon: v.optional(v.string()),
     companyName: v.string(),
     supportEmail: v.optional(v.string()),
     supportPhone: v.optional(v.string()),
     address: v.optional(v.string()),
     termsUrl: v.optional(v.string()),
     privacyUrl: v.optional(v.string()),
     updatedAt: v.number(),
   }).index("by_tenantId", ["tenantId"]),
   ```

2. **Theme Provider Implementation**:
   ```tsx
   // In src/providers/ThemeProvider.tsx
   export function ThemeProvider({ children }: { children: React.ReactNode }) {
     const { organization } = useOrganization();
     const tenantId = organization?.id;

     // Fetch tenant configuration from Convex
     const tenantConfig = useQuery(api.tenants.getConfig, { tenantId });

     // Create CSS variables for the tenant's theme
     const themeStyles = useMemo(() => {
       if (!tenantConfig) return {};

       return {
         "--primary-color": tenantConfig.primaryColor || "#0f172a",
         "--secondary-color": tenantConfig.secondaryColor || "#6366f1",
         "--font-family": tenantConfig.fontFamily || "Inter, sans-serif",
         // Add more theme variables as needed
       };
     }, [tenantConfig]);

     // Apply custom CSS if provided
     useEffect(() => {
       if (tenantConfig?.customCss) {
         const styleElement = document.createElement("style");
         styleElement.textContent = tenantConfig.customCss;
         document.head.appendChild(styleElement);

         return () => {
           document.head.removeChild(styleElement);
         };
       }
     }, [tenantConfig?.customCss]);

     // Apply custom JS if provided
     useEffect(() => {
       if (tenantConfig?.customJs) {
         const scriptElement = document.createElement("script");
         scriptElement.textContent = tenantConfig.customJs;
         document.body.appendChild(scriptElement);

         return () => {
           document.body.removeChild(scriptElement);
         };
       }
     }, [tenantConfig?.customJs]);

     return (
       <div style={themeStyles as React.CSSProperties}>
         {children}
       </div>
     );
   }
   ```

3. **Admin UI for Customization**:
   - Create a dedicated "Appearance" section in the admin settings
   - Allow uploading logos, setting colors, and previewing changes
   - Provide a CSS editor for advanced customizations

### Feature Customization

1. **Feature Flags Table**:
   ```typescript
   // In convex/schema.ts
   tenantFeatures: defineTable({
     tenantId: v.string(),
     featureKey: v.string(),
     enabled: v.boolean(),
     configuration: v.optional(v.any()),
     updatedAt: v.number(),
   }).index("by_tenant_feature", ["tenantId", "featureKey"]),
   ```

2. **Feature Flag Hook**:
   ```tsx
   // In src/hooks/useFeatureFlag.ts
   export function useFeatureFlag(featureKey: string) {
     const { organization } = useOrganization();
     const tenantId = organization?.id;

     const featureFlags = useQuery(api.tenants.getFeatureFlags, { tenantId });

     // Check if the feature is enabled for this tenant
     const isEnabled = useMemo(() => {
       if (!featureFlags) return false;
       return featureFlags.some(flag =>
         flag.featureKey === featureKey && flag.enabled
       );
     }, [featureFlags, featureKey]);

     // Get feature configuration if available
     const config = useMemo(() => {
       if (!featureFlags) return undefined;
       const flag = featureFlags.find(f => f.featureKey === featureKey);
       return flag?.configuration;
     }, [featureFlags, featureKey]);

     return { isEnabled, config };
   }
   ```

3. **Using Feature Flags in Components**:
   ```tsx
   function AdvancedReporting() {
     const { isEnabled, config } = useFeatureFlag("advanced_reporting");

     if (!isEnabled) return null;

     return (
       <div>
         <h2>Advanced Reporting</h2>
         {/* Use config to customize the feature */}
         {config?.showRealTimeData && (
           <RealTimeDataVisualization />
         )}
       </div>
     );
   }
   ```

### Custom Workflows and Business Logic

1. **Workflow Configuration Table**:
   ```typescript
   // In convex/schema.ts
   tenantWorkflows: defineTable({
     tenantId: v.string(),
     workflowKey: v.string(),
     steps: v.array(v.object({
       id: v.string(),
       name: v.string(),
       type: v.string(),
       config: v.optional(v.any()),
       nextSteps: v.array(v.string()),
     })),
     updatedAt: v.number(),
   }).index("by_tenant_workflow", ["tenantId", "workflowKey"]),
   ```

2. **Workflow Engine**:
   ```typescript
   // In src/lib/workflowEngine.ts
   export async function executeWorkflow(
     workflowKey: string,
     data: any,
     tenantId: string
   ) {
     // Fetch workflow configuration
     const workflow = await convex.query(api.tenants.getWorkflow, {
       tenantId,
       workflowKey
     });

     if (!workflow) {
       throw new Error(`Workflow ${workflowKey} not found for tenant ${tenantId}`);
     }

     // Start with the first step
     let currentStep = workflow.steps.find(step => step.id === "start");
     let currentData = data;

     // Execute each step in the workflow
     while (currentStep) {
       // Execute the step based on its type
       const stepResult = await executeStep(currentStep, currentData, tenantId);

       // Determine the next step
       const nextStepId = determineNextStep(currentStep, stepResult);
       if (!nextStepId) break;

       // Move to the next step
       currentStep = workflow.steps.find(step => step.id === nextStepId);
       currentData = stepResult;
     }

     return currentData;
   }
   ```

3. **Admin UI for Workflow Customization**:
   - Visual workflow builder with drag-and-drop interface
   - Step configuration forms
   - Workflow testing and validation tools

### Custom Fields and Data Models

1. **Custom Fields Table**:
   ```typescript
   // In convex/schema.ts
   tenantCustomFields: defineTable({
     tenantId: v.string(),
     entityType: v.string(), // "contact", "account", "workOrder", etc.
     fieldKey: v.string(),
     fieldType: v.string(), // "text", "number", "date", "select", etc.
     label: v.string(),
     required: v.boolean(),
     options: v.optional(v.array(v.string())), // For select fields
     defaultValue: v.optional(v.any()),
     displayOrder: v.number(),
     updatedAt: v.number(),
   }).index("by_tenant_entity", ["tenantId", "entityType"]),
   ```

2. **Dynamic Form Generation**:
   ```tsx
   // In src/components/DynamicForm.tsx
   export function DynamicForm({
     entityType,
     initialData,
     onSubmit
   }: DynamicFormProps) {
     const { organization } = useOrganization();
     const tenantId = organization?.id;

     // Fetch custom fields for this entity type
     const customFields = useQuery(api.tenants.getCustomFields, {
       tenantId,
       entityType
     });

     // Create form state
     const [formData, setFormData] = useState(initialData || {});

     // Handle form submission
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       onSubmit(formData);
     };

     if (!customFields) return <div>Loading form...</div>;

     return (
       <form onSubmit={handleSubmit}>
         {/* Render standard fields */}
         {/* ... */}

         {/* Render custom fields */}
         {customFields.map(field => (
           <div key={field.fieldKey}>
             <label htmlFor={field.fieldKey}>{field.label}</label>
             {renderFieldInput(field, formData, setFormData)}
           </div>
         ))}

         <button type="submit">Submit</button>
       </form>
     );
   }

   // Helper function to render the appropriate input for each field type
   function renderFieldInput(field, formData, setFormData) {
     switch (field.fieldType) {
       case "text":
         return (
           <input
             type="text"
             id={field.fieldKey}
             value={formData[field.fieldKey] || ""}
             onChange={e =>
               setFormData({...formData, [field.fieldKey]: e.target.value})
             }
             required={field.required}
           />
         );
       // Handle other field types...
     }
   }
   ```

3. **Admin UI for Custom Fields**:
   - Field management interface
   - Field type selection
   - Validation rules configuration

### Integration Customization

1. **Integration Configuration Table**:
   ```typescript
   // In convex/schema.ts
   tenantIntegrations: defineTable({
     tenantId: v.string(),
     integrationType: v.string(), // "stripe", "mailchimp", "zapier", etc.
     enabled: v.boolean(),
     config: v.object({
       apiKey: v.optional(v.string()),
       webhookUrl: v.optional(v.string()),
       customFields: v.optional(v.map(v.string())),
       // Other integration-specific configuration
     }),
     updatedAt: v.number(),
   }).index("by_tenant_integration", ["tenantId", "integrationType"]),
   ```

2. **Integration Service**:
   ```typescript
   // In src/services/integrationService.ts
   export async function executeIntegration(
     integrationType: string,
     action: string,
     data: any,
     tenantId: string
   ) {
     // Fetch integration configuration
     const integration = await convex.query(api.tenants.getIntegration, {
       tenantId,
       integrationType
     });

     if (!integration || !integration.enabled) {
       console.log(`Integration ${integrationType} not enabled for tenant ${tenantId}`);
       return null;
     }

     // Execute the integration based on its type
     switch (integrationType) {
       case "stripe":
         return await executeStripeIntegration(action, data, integration.config);
       case "mailchimp":
         return await executeMailchimpIntegration(action, data, integration.config);
       // Handle other integration types...
       default:
         throw new Error(`Unknown integration type: ${integrationType}`);
     }
   }
   ```

3. **Admin UI for Integration Management**:
   - Integration marketplace
   - Configuration forms for each integration
   - Testing tools for validating integrations

### Deployment Considerations for Customizations

1. **Code vs. Configuration**:
   - Store as much as possible as configuration data
   - Minimize the need for custom code deployments
   - Use feature flags to control access to new features

2. **Update Strategy**:
   - Deploy updates to all tenant instances
   - Use database migrations to update customization schemas
   - Provide backward compatibility for custom configurations

3. **Performance Optimization**:
   - Cache tenant configurations
   - Lazy-load custom components
   - Optimize database queries for custom fields

### Managing Updates Across Customized Tenant Silos

Updating multiple tenant instances while preserving their customizations is one of the most challenging aspects of a multi-tenant SaaS architecture. Here's a comprehensive approach:

#### Centralized Deployment Orchestration

1. **Deployment Registry**:
   ```typescript
   // In convex/schema.ts
   tenantDeployments: defineTable({
     tenantId: v.string(),
     currentVersion: v.string(),
     deploymentUrl: v.string(),
     lastUpdated: v.number(),
     updateStatus: v.string(), // "up-to-date", "pending", "in-progress", "failed"
     customizations: v.array(v.string()), // List of active customization keys
     updateHistory: v.array(v.object({
       version: v.string(),
       timestamp: v.number(),
       status: v.string(),
       notes: v.optional(v.string()),
     })),
   }).index("by_tenantId", ["tenantId"])
     .index("by_status", ["updateStatus"]),
   ```

2. **Deployment Orchestration Service**:
   ```typescript
   // In services/deployment-orchestrator.js
   async function deployUpdateToAllTenants(version, options = {}) {
     const {
       batchSize = 5,
       waitTimeBetweenBatches = 10 * 60 * 1000, // 10 minutes
       skipTenantIds = []
     } = options;

     // Get all tenant deployments
     const tenants = await db.query("tenantDeployments")
       .filter(q => !skipTenantIds.includes(q.field("tenantId")))
       .collect();

     // Group tenants into batches
     const batches = [];
     for (let i = 0; i < tenants.length; i += batchSize) {
       batches.push(tenants.slice(i, i + batchSize));
     }

     // Deploy to each batch sequentially
     for (const [batchIndex, batch] of batches.entries()) {
       console.log(`Deploying batch ${batchIndex + 1} of ${batches.length}`);

       // Update all tenants in this batch in parallel
       await Promise.all(batch.map(tenant =>
         deployUpdateToTenant(tenant.tenantId, version)
       ));

       // Wait between batches (except after the last batch)
       if (batchIndex < batches.length - 1) {
         console.log(`Waiting ${waitTimeBetweenBatches/60000} minutes before next batch`);
         await new Promise(resolve => setTimeout(resolve, waitTimeBetweenBatches));
       }
     }

     console.log(`Deployment of version ${version} completed to all tenants`);
   }
   ```

#### Tenant-Aware Deployment Process

1. **Pre-Deployment Customization Backup**:
   ```typescript
   async function backupTenantCustomizations(tenantId) {
     // Backup all customization tables for this tenant
     const customizations = {};

     // Backup tenant config
     const config = await db.query("tenantConfig")
       .withIndex("by_tenantId", q => q.eq("tenantId", tenantId))
       .first();
     if (config) customizations.config = config;

     // Backup feature flags
     const features = await db.query("tenantFeatures")
       .withIndex("by_tenant_feature", q => q.eq("tenantId", tenantId))
       .collect();
     if (features.length) customizations.features = features;

     // Backup workflows
     const workflows = await db.query("tenantWorkflows")
       .withIndex("by_tenant_workflow", q => q.eq("tenantId", tenantId))
       .collect();
     if (workflows.length) customizations.workflows = workflows;

     // Backup custom fields
     const customFields = await db.query("tenantCustomFields")
       .withIndex("by_tenant_entity", q => q.eq("tenantId", tenantId))
       .collect();
     if (customFields.length) customizations.customFields = customFields;

     // Backup integrations
     const integrations = await db.query("tenantIntegrations")
       .withIndex("by_tenant_integration", q => q.eq("tenantId", tenantId))
       .collect();
     if (integrations.length) customizations.integrations = integrations;

     // Store backup in a separate table
     await db.insert("tenantBackups", {
       tenantId,
       timestamp: Date.now(),
       version: await getCurrentVersion(tenantId),
       customizations,
     });

     return customizations;
   }
   ```

2. **Customization-Aware Deployment**:
   ```typescript
   async function deployUpdateToTenant(tenantId, version) {
     try {
       // Update deployment status
       await db.patch(
         await db.query("tenantDeployments")
           .withIndex("by_tenantId", q => q.eq("tenantId", tenantId))
           .first()._id,
         {
           updateStatus: "in-progress",
           lastUpdated: Date.now(),
         }
       );

       // 1. Backup current customizations
       const customizations = await backupTenantCustomizations(tenantId);

       // 2. Trigger Render deployment with version tag
       await fetch(`https://api.render.com/v1/services/${getTenantRenderServiceId(tenantId)}/deploys`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${process.env.RENDER_API_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           clearCache: 'clear',
           gitRef: version,
         }),
       });

       // 3. Wait for deployment to complete
       await waitForRenderDeployment(tenantId);

       // 4. Apply database migrations for this version
       await applyDatabaseMigrations(tenantId, version);

       // 5. Restore compatible customizations
       await restoreCompatibleCustomizations(tenantId, customizations, version);

       // 6. Update deployment record
       await db.patch(
         await db.query("tenantDeployments")
           .withIndex("by_tenantId", q => q.eq("tenantId", tenantId))
           .first()._id,
         {
           currentVersion: version,
           updateStatus: "up-to-date",
           lastUpdated: Date.now(),
           updateHistory: [...currentHistory, {
             version,
             timestamp: Date.now(),
             status: "success",
           }],
         }
       );

       return { success: true, tenantId, version };
     } catch (error) {
       console.error(`Deployment failed for tenant ${tenantId}:`, error);

       // Update deployment record with failure
       await db.patch(
         await db.query("tenantDeployments")
           .withIndex("by_tenantId", q => q.eq("tenantId", tenantId))
           .first()._id,
         {
           updateStatus: "failed",
           lastUpdated: Date.now(),
           updateHistory: [...currentHistory, {
             version,
             timestamp: Date.now(),
             status: "failed",
             notes: error.message,
           }],
         }
       );

       return { success: false, tenantId, version, error: error.message };
     }
   }
   ```

#### Schema Migration System

1. **Version-Controlled Migrations**:
   ```typescript
   // In migrations/index.js
   const migrations = {
     "v1.0.0": [],
     "v1.1.0": [
       require("./v1.1.0/add-custom-field-validation"),
       require("./v1.1.0/update-workflow-schema"),
     ],
     "v1.2.0": [
       require("./v1.2.0/add-integration-webhooks"),
     ],
     // Add more versions as needed
   };

   async function applyDatabaseMigrations(tenantId, targetVersion) {
     // Get current version
     const deployment = await db.query("tenantDeployments")
       .withIndex("by_tenantId", q => q.eq("tenantId", tenantId))
       .first();

     const currentVersion = deployment.currentVersion;

     // Determine which migrations need to be applied
     const versionsToApply = Object.keys(migrations)
       .filter(version => compareVersions(version, currentVersion) > 0 &&
                          compareVersions(version, targetVersion) <= 0)
       .sort(compareVersions);

     // Apply each version's migrations in sequence
     for (const version of versionsToApply) {
       console.log(`Applying migrations for version ${version} to tenant ${tenantId}`);

       for (const migration of migrations[version]) {
         await migration.apply(tenantId);
       }
     }
   }
   ```

2. **Customization Compatibility Checker**:
   ```typescript
   async function restoreCompatibleCustomizations(tenantId, customizations, version) {
     // Get compatibility rules for this version
     const compatibilityRules = getCompatibilityRules(version);

     // Restore tenant config with compatibility transformations
     if (customizations.config) {
       const transformedConfig = applyCompatibilityTransforms(
         customizations.config,
         compatibilityRules.config
       );
       await db.patch(customizations.config._id, transformedConfig);
     }

     // Restore feature flags with compatibility transformations
     if (customizations.features) {
       for (const feature of customizations.features) {
         if (compatibilityRules.features[feature.featureKey]) {
           const transformedFeature = applyCompatibilityTransforms(
             feature,
             compatibilityRules.features[feature.featureKey]
           );
           await db.patch(feature._id, transformedFeature);
         }
       }
     }

     // Apply similar transformations for workflows, custom fields, and integrations
     // ...
   }
   ```

#### Rollback Capability

1. **Rollback Process**:
   ```typescript
   async function rollbackTenant(tenantId, targetVersion) {
     // Find the most recent backup for the target version
     const backup = await db.query("tenantBackups")
       .withIndex("by_tenant_version", q =>
         q.eq("tenantId", tenantId).eq("version", targetVersion))
       .order("desc")
       .first();

     if (!backup) {
       throw new Error(`No backup found for tenant ${tenantId} at version ${targetVersion}`);
     }

     // Deploy the target version
     await deployUpdateToTenant(tenantId, targetVersion);

     // Restore the customizations from the backup
     await restoreCustomizationsFromBackup(tenantId, backup);

     return { success: true, tenantId, version: targetVersion };
   }
   ```

#### Admin Dashboard for Deployment Management

1. **Deployment Status Dashboard**:
   - Overview of all tenant deployments
   - Filtering by version, status, and tenant
   - Batch update scheduling interface

2. **Tenant-Specific Deployment Controls**:
   - Version history for each tenant
   - Rollback capability
   - Customization comparison between versions

3. **Deployment Notifications**:
   - Email notifications for deployment status
   - Tenant admin notifications for upcoming updates
   - Maintenance window scheduling

#### Testing Strategy for Customized Deployments

1. **Canary Deployments**:
   - Deploy to a small subset of tenants first
   - Monitor for issues before wider rollout
   - Select representative tenants with diverse customizations

2. **Customization Simulation Testing**:
   - Create test tenants with various customization combinations
   - Automated testing of update process against these tenants
   - Regression testing for customization compatibility

3. **Sandbox Environment**:
   - Provide tenants with a sandbox environment to test updates
   - Allow preview of how their customizations will work with updates
   - Gather feedback before production deployment

---

This architecture provides a scalable foundation for a multi-tenant SaaS version of Geelong Garage, leveraging the strengths of Clerk, Convex, and Render while maintaining proper tenant isolation and security. The comprehensive customization capabilities enable each tenant to tailor the application to their specific needs without requiring custom code deployments.
