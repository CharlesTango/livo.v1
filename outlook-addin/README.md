# Livo Outlook Add-in

This is a Microsoft Outlook Add-in that allows you to create legal matters directly from Outlook.

## Features

- Create new matters with all the same fields as the web app
- Autocomplete for existing clients or create new ones
- Automatic OneDrive folder creation (if connected)
- Same authentication as the web app

## Development Setup

### Prerequisites

1. Node.js 18+ installed
2. The main Livo app running with Convex backend
3. HTTPS certificates for local development (auto-generated or custom)

### Installation

1. Navigate to the add-in directory:
   ```bash
   cd outlook-addin
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   
   This will start a webpack dev server on https://localhost:3001

### Testing the Add-in

#### Option 1: Sideload in Outlook on the Web

1. Go to Outlook on the web (https://outlook.office.com)
2. Open any email
3. Click the "..." menu → "Get Add-ins"
4. Click "My add-ins" → "Add a custom add-in" → "Add from file"
5. Upload the `manifest.xml` file from this directory

#### Option 2: Sideload in Outlook Desktop (Windows)

1. Open Outlook
2. Go to File → Manage Add-ins
3. Click "Add a custom add-in" → "Add from file"
4. Select the `manifest.xml` file

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with the compiled add-in.

## Configuration

### Convex URL

The add-in connects to the same Convex backend as the main web app. Update the URL in:

- `webpack.config.js` - DefinePlugin configuration
- `src/lib/convex.tsx` - Fallback URL

### Add-in Icons

Replace the placeholder icons in `assets/` with actual PNG icons:
- icon-16.png (16x16)
- icon-32.png (32x32)
- icon-64.png (64x64)
- icon-80.png (80x80)
- icon-128.png (128x128)

Icons should use the Livo "L" logo on a sage green (#B6D7C4) background.

## SSL Certificates

For local development, you may need to create SSL certificates:

```bash
mkdir certs
cd certs
openssl req -x509 -newkey rsa:4096 -keyout localhost.key -out localhost.crt -days 365 -nodes -subj "/CN=localhost"
```

Or use the auto-generated certificates from webpack-dev-server (you may need to accept the security warning in your browser).

## File Structure

```
outlook-addin/
├── manifest.xml          # Office Add-in manifest
├── package.json          # Dependencies and scripts
├── webpack.config.js     # Build configuration
├── tsconfig.json         # TypeScript configuration
├── assets/               # Icons and static assets
└── src/
    ├── index.tsx         # React entry point
    ├── App.tsx           # Main app component
    ├── taskpane.html     # HTML entry for taskpane
    ├── commands.html     # HTML for command functions
    ├── commands.ts       # Command handlers
    ├── components/
    │   ├── AuthLogin.tsx        # Login form
    │   └── CreateMatterForm.tsx # Matter creation form
    ├── lib/
    │   └── convex.tsx    # Convex client setup
    └── styles/
        └── globals.css   # Styling (matches web app design)
```

## Troubleshooting

### "Office is not defined" error
Make sure you're accessing the add-in through Outlook, not directly in a browser.

### Authentication issues
Ensure the Convex backend is running and the URL is correctly configured.

### CORS errors
The webpack dev server includes CORS headers. If you still see errors, check that your Convex deployment allows the add-in origin.
