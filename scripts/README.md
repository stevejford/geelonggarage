# Test Data Generator Scripts

This directory contains scripts for generating test data for the application.

## Chart Test Data Generator

The `chart-test-data-generator.js` script populates the database with test data specifically designed for testing chart visualizations. It creates entities with a distribution of statuses to ensure that charts display data correctly.

### Prerequisites

Before running the script, make sure you have:

1. Node.js installed
2. Required dependencies installed (`npm install`)
3. A `.env` file with your Convex URL (`NEXT_PUBLIC_CONVEX_URL`)

### Running the Script

```bash
node scripts/chart-test-data-generator.js
```

### What It Creates

The script creates:

- Accounts with random company names
- Contacts associated with accounts
- Leads with various statuses (New, Contacted, Qualified, Unqualified, Converted)
- Quotes with various statuses (Draft, Presented, Accepted, Declined)
- Work Orders with various statuses (Pending, Scheduled, In Progress, Completed)
- Invoices with various statuses (Draft, Sent, Paid, Void)

### Configuration

You can modify the `CONFIG` object at the top of the script to adjust:

- The number of entities to create
- The status distribution percentages

### Notes

- The script ensures that each status has representation to properly test chart visualizations
- Dates are distributed throughout the year to test monthly charts
- Amounts vary to test financial charts
- Relationships between entities are maintained (contacts linked to accounts, etc.)

## Roadmap Components

The following components are planned for future implementation:

- Advanced filtering for all entity lists
- Batch operations for entities
- Export functionality for reports
- Dashboard customization
- User activity logs
- Email integration for notifications
- Calendar integration for scheduling
- Document management system
- Customer portal
- Mobile app for field service
