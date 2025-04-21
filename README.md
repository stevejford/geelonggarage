# Geelong Garage

A comprehensive garage management system built with Next.js, Convex, and Clerk.

## Features

- Lead Management
- Contact & Account Management
- Quote Management
- Work Order Management
- Invoice Management
- Role-Based Access Control
- Settings Management

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, shadcn/ui
- **Backend**: Convex (serverless backend)
- **Authentication**: Clerk
- **Deployment**: Render

## Deployment

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account
- Clerk account
- Render account

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/stevejford/geelonggarage.git
   cd geelonggarage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   VITE_CONVEX_URL=your_convex_url
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Deploying to Render

1. Fork this repository to your GitHub account.

2. Log in to your Render account and create a new Web Service.

3. Connect your GitHub repository.

4. Render will automatically detect the `render.yaml` configuration file.

5. Set the following environment variables in Render:
   - `CONVEX_DEPLOY_KEY`: Your Convex deployment key
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `CLERK_SECRET_KEY`: Your Clerk secret key
   - `VITE_CONVEX_URL`: Your Convex URL (e.g., https://patient-tern-95.convex.cloud)
   - `PORT`: 10000

6. Click "Create Web Service" to deploy.

### Updating from Local Environment

To update your Render deployment from your local environment:

1. Make changes to your code locally.

2. Test your changes with:
   ```bash
   npm run dev
   ```

3. Deploy Convex functions:
   ```bash
   npx convex deploy
   ```

4. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

5. Render will automatically deploy the updated code.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
