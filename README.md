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

## License

MIT
