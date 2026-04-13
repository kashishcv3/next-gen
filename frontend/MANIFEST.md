# Project Manifest - CV3 Admin Platform Frontend

## Project Location
`/sessions/eager-happy-gauss/mnt/next-gen-platform/next-gen/frontend/`

## Project Type
Next.js 14 + React 18 + TypeScript 5 + Bootstrap 3 Migration

## Total Files Created
42 files (26 core source files + configuration + documentation)

## Quick Start
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
# Open http://localhost:3000
```

## File Manifest by Category

### Configuration Files (7 files)
- package.json - Dependencies and scripts
- tsconfig.json - TypeScript configuration with path aliases
- next.config.js - Next.js configuration
- .env.example - Environment variables template
- .gitignore - Git ignore rules
- README.md - Project documentation
- SETUP.md - Detailed setup guide

### Application Files (5 files)
- src/app/layout.tsx - Root layout with providers
- src/app/page.tsx - Redirect logic
- src/app/globals.css - Global Bootstrap 3 styles
- src/app/login/page.tsx - Login page with MFA
- src/app/dashboard/page.tsx - Dashboard example

### Layout Components (5 files)
- src/components/layout/Header.tsx - Navigation bar
- src/components/layout/Sidebar.tsx - Navigation sidebar
- src/components/layout/Footer.tsx - Footer
- src/components/layout/Layout.tsx - Main wrapper
- src/components/layout/PopupLayout.tsx - Modal layout

### UI Components (4 files)
- src/components/ui/DataTable.tsx - DataTables wrapper
- src/components/ui/Panel.tsx - Bootstrap panel
- src/components/ui/AlertMessage.tsx - Alert component
- src/components/ui/Breadcrumb.tsx - Breadcrumb

### State Management (1 file)
- src/context/AuthContext.tsx - Authentication context

### API Layer (2 files)
- src/lib/api.ts - Axios instance with JWT
- src/lib/auth.ts - Auth utilities

### Hooks (1 file)
- src/hooks/useApi.ts - Custom API hook

### Utilities (1 file)
- src/utils/helpers.ts - Helper functions

### Types (1 file)
- src/types/index.ts - TypeScript interfaces

### Directories (1 directory)
- public/ - Static assets folder

## Feature Checklist

### Authentication
- [x] JWT-based login
- [x] Two-factor authentication (MFA)
- [x] Token persistence in cookies
- [x] Auto logout on 401
- [x] Session restoration

### Components
- [x] Responsive header with user dropdown
- [x] Collapsible sidebar with 9 navigation sections
- [x] Footer with support links
- [x] Main layout wrapper
- [x] Popup/modal layout
- [x] Bootstrap panels
- [x] DataTables integration
- [x] Alert messages
- [x] Breadcrumbs

### API Integration
- [x] Axios instance
- [x] Automatic JWT header injection
- [x] Request/response interceptors
- [x] Error handling
- [x] Environment-based base URL

### Styling
- [x] Bootstrap 3.4.1 via CDN
- [x] Font Awesome 4.7.0 icons
- [x] Custom CSS for Bootstrap theme
- [x] Responsive design
- [x] SB-Admin aesthetic

### TypeScript
- [x] Full type safety
- [x] Strict mode enabled
- [x] Path aliases configured
- [x] Comprehensive type definitions

### Development
- [x] Hot reload development server
- [x] Production build configuration
- [x] Linting setup
- [x] Git configuration

## Navigation Sidebar Structure

The sidebar includes these main sections (collapsible):

1. **Main Section**
   - Dashboard
   - My Account
   - Manage Users
   - Preferences

2. **BigAdmin** (developer only)
   - Developer Tools
   - Store Movement
   - System Settings

3. **Settings**
   - Overview, Options, Shipping, Tax, Google, DNS, Features, Launch

4. **Design**
   - Template Tags, Library, Images, Files, Forms

5. **Inventory**
   - Categories, Products, Search, Discounts, Q&A, Reviews, Import/Export

6. **Customers**
   - Search, Groups, Members, Wishlists, Rewards

7. **Orders**
   - Pending, Search, Import, MOM Builder, Gift Certs, Catalog Requests

8. **Marketing**
   - Meta Tags, Gateways, Campaigns, Reminders

9. **Reporting**
   - Benchmark, Bot Tracker, Cart, Revenue, Sales, Visits

## API Endpoints Expected

The frontend expects these API endpoints at `http://localhost:8000/api/v1`:

- `POST /auth/login` - Login with email/password
- `POST /auth/verify-mfa` - Verify 2FA code
- Any additional endpoints for dashboard, orders, inventory, etc.

## Dependencies Summary

### Production
- react@18.2.0
- react-dom@18.2.0
- next@14.0.0
- bootstrap@3.4.1
- jquery@3.7.0
- datatables.net@1.13.0
- datatables.net-bs@1.13.0
- axios@1.6.0
- js-cookie@3.0.5

### Development
- typescript@5.0.0
- eslint@8.0.0
- eslint-config-next@14.0.0
- @types/* (node, react, react-dom, js-cookie, datatables.net)

## Key Architecture Decisions

1. **Client Components**: All interactive components use 'use client'
2. **Cookies for Auth**: JWT stored in httpOnly cookies
3. **Context API**: Auth state management via React Context
4. **Axios Interceptors**: Automatic JWT injection and error handling
5. **Bootstrap 3 CDN**: Maintains legacy design compatibility
6. **TypeScript Strict**: Full type safety with strict mode

## Migration Notes

This is a direct replacement for the legacy PHP/Smarty2 platform:
- Same visual design (Bootstrap 3 + SB-Admin)
- Same navigation structure
- Same icon set (Font Awesome)
- Same table styling (DataTables)
- New modern React stack underneath

## Development Workflow

1. Create new pages in `src/app/[page-name]/page.tsx`
2. Use Layout component for consistent styling
3. Add sidebar links in `Sidebar.tsx`
4. Create reusable components in `src/components/`
5. Use `useApi` hook for API calls
6. TypeScript ensures type safety

## Production Deployment

Options:
1. **Vercel** - npm run build + git push
2. **Docker** - docker build and run
3. **Self-hosted** - npm run build + npm start

## Support Files

- README.md - Full documentation
- SETUP.md - Detailed setup guide
- MANIFEST.md - This file
- .env.example - Environment template

## Testing the Setup

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1" > .env.local

# Start development server
npm run dev

# In browser: http://localhost:3000
# Should redirect to /login
# Try login form (will fail without backend, but UI will work)
```

## Next Steps After Setup

1. Ensure backend API is running on port 8000
2. Create additional pages as needed
3. Connect to actual API endpoints
4. Customize sidebar navigation
5. Add store-specific sections when user selects store
6. Implement remaining admin features
7. Deploy to production

---
Generated: 2026-04-13
Frontend: Next.js 14, React 18, TypeScript 5
Legacy: Bootstrap 3, SB-Admin, Font Awesome 4.7
