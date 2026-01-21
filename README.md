# Livo - Legal Matter Management

A modern legal practice management application for in-house lawyers and small legal teams. Built with Next.js and Convex.

## Features

- **Client Management**: Add, edit, and organize your clients with detailed profiles
- **Matter Tracking**: Create and manage legal matters with status, priority, and timeline tracking
- **Dashboard**: Get an overview of your practice with recent matters and statistics
- **Secure Authentication**: Email/password authentication powered by Convex Auth

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Convex (real-time, serverless database)
- **Authentication**: Convex Auth with Password provider

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd livo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Convex:
   ```bash
   npx convex dev
   ```
   This will prompt you to create a new project or link to an existing one.

4. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Convex URL (provided after running `npx convex dev`)

5. Run the development server:
   ```bash
   npm run dev:frontend
   ```

6. In a separate terminal, run Convex:
   ```bash
   npm run dev:backend
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── (protected)/       # Protected pages (dashboard, matters, clients)
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── matters/           # Matter-related components
│   └── clients/           # Client-related components
└── lib/                   # Utility functions

convex/
├── schema.ts              # Database schema
├── auth.ts                # Authentication configuration
├── clients.ts             # Client CRUD operations
└── matters.ts             # Matter CRUD operations
```

## Design System

### Colors

- **Primary** (#2B3856): Used for headings, buttons, and primary actions
- **Accent** (#AAF0D1): Used for highlights and call-to-action elements
- **Secondary** (#DADBDD): Used for borders and disabled states
- **Neutral** (#F5F5F5): Used for backgrounds

### Typography

- Font Family: Libre Baskerville (serif)
- Clean, traditional look with modern functionality

### Components

- Rounded corners (12px border-radius)
- Soft shadows for depth
- Consistent spacing and padding

## OneDrive Integration

Livo supports connecting to Microsoft OneDrive to store matter documents. Each matter can have an associated OneDrive folder that is automatically created when the matter is created.

### Azure App Registration Setup

To enable OneDrive integration, you need to register an application in Microsoft Azure:

1. **Go to Azure Portal**: Navigate to [Azure Portal](https://portal.azure.com) and sign in with your Microsoft account.

2. **Create App Registration**:
   - Go to "Azure Active Directory" > "App registrations" > "New registration"
   - Name: "Livo - Legal Matter Management" (or your preferred name)
   - Supported account types: Select "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Select "Web" and enter: `{YOUR_CONVEX_DEPLOYMENT_URL}/api/auth/microsoft/callback`
     - Example: `https://your-project.convex.site/api/auth/microsoft/callback`

3. **Configure API Permissions**:
   - Go to "API permissions" > "Add a permission" > "Microsoft Graph"
   - Select "Delegated permissions" and add:
     - `Files.ReadWrite` - Read and write access to user files
     - `offline_access` - Maintain access to data (for refresh tokens)
   - Click "Grant admin consent" if you have admin privileges (optional, users will consent individually otherwise)

4. **Create Client Secret**:
   - Go to "Certificates & secrets" > "New client secret"
   - Description: "Livo Production" (or similar)
   - Expiration: Choose based on your security requirements (recommended: 24 months)
   - Copy the secret value immediately (it won't be shown again)

5. **Configure Convex Environment Variables**:
   ```bash
   npx convex env set MICROSOFT_CLIENT_ID "your-application-client-id"
   npx convex env set MICROSOFT_CLIENT_SECRET "your-client-secret-value"
   npx convex env set CONVEX_SITE_URL "https://your-project.convex.site"
   ```

   You can find your Application (client) ID on the app registration overview page.

6. **Configure Next.js Environment Variables**:
   Add to your `.env.local`:
   ```
   NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site
   ```

### How It Works

- Users connect their OneDrive account from their Profile page
- When creating a new matter, a folder is automatically created in OneDrive under `Livo Matters/{Client Name} - {Matter Title}`
- Click the "Documents" folder in any matter to open the OneDrive folder in a new tab
- Users can disconnect their OneDrive at any time from their Profile

## License

MIT
