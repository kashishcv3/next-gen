# CV3 Admin Platform - Frontend Setup Guide

## Project Overview

A complete Next.js migration of the legacy PHP/Smarty2 e-commerce admin platform, maintaining the Bootstrap 3 + SB-Admin visual design while providing modern React architecture.

## Directory Structure

```
frontend/
├── public/                           # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with AuthProvider
│   │   ├── page.tsx                 # Redirect to login or dashboard
│   │   ├── globals.css              # Global Bootstrap 3 styles
│   │   ├── login/
│   │   │   └── page.tsx             # Login page with MFA support
│   │   └── dashboard/
│   │       └── page.tsx             # Dashboard page example
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Main navbar (inverse style)
│   │   │   ├── Sidebar.tsx          # Collapsible navigation sidebar
│   │   │   ├── Footer.tsx           # Footer with support links
│   │   │   ├── Layout.tsx           # Main layout wrapper
│   │   │   └── PopupLayout.tsx      # Popup/modal layout
│   │   │
│   │   └── ui/
│   │       ├── DataTable.tsx        # jQuery DataTables wrapper
│   │       ├── Panel.tsx            # Bootstrap panel component
│   │       ├── AlertMessage.tsx     # Dismissible alerts
│   │       └── Breadcrumb.tsx       # Breadcrumb navigation
│   │
│   ├── context/
│   │   └── AuthContext.tsx          # React Context for auth state
│   │
│   ├── lib/
│   │   ├── api.ts                   # Axios instance with JWT interceptors
│   │   └── auth.ts                  # Authentication utilities
│   │
│   ├── hooks/
│   │   └── useApi.ts                # Custom hook for API calls
│   │
│   ├── utils/
│   │   └── helpers.ts               # Utility functions
│   │
│   └── types/
│       └── index.ts                 # TypeScript interfaces
│
├── .env.example                      # Environment variables template
├── .gitignore
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
├── next.config.js                    # Next.js configuration
└── README.md                         # Documentation
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:8000

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 4: Build for Production

```bash
npm run build
npm start
```

## Key Features

### Authentication
- JWT-based with token storage in HttpOnly cookies
- Two-factor authentication (2FA/MFA) support
- Automatic token injection in API requests
- 401 error handling with auto-redirect to login
- Session persistence across page reloads

### Layout Components
- **Header**: Bootstrap navbar-inverse with user dropdown
- **Sidebar**: Collapsible navigation with permission-based visibility
- **Layout**: Main wrapper combining header, sidebar, footer
- **Footer**: Support links (HelpDesk, Training, Email)

### UI Components
- **Panel**: Bootstrap panel with variants (primary, success, etc.)
- **DataTable**: jQuery DataTables with Bootstrap 3 styling
- **AlertMessage**: Success/danger/warning/info alerts
- **Breadcrumb**: Navigation breadcrumbs

### API Integration
- Axios instance with automatic JWT header injection
- Request/response interceptors
- Centralized error handling
- Base URL from environment variables

### Styling
- Bootstrap 3.4.1 from CDN
- Font Awesome 4.7.0 icons
- Custom CSS in globals.css for Bootstrap 3 theme
- Responsive design with mobile support

## Core File Reference

### Authentication Files

**src/lib/auth.ts**
```typescript
login(credentials: LoginRequest) -> LoginResponse
verifyMFA(req: MFAVerifyRequest) -> LoginResponse
logout() -> void
getToken() -> string | null
getUser() -> User | null
isAuthenticated() -> boolean
```

**src/context/AuthContext.tsx**
```typescript
useAuth() -> {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login(credentials): Promise<LoginResponse>
  verifyMFA(req): Promise<LoginResponse>
  logout(): void
  refreshUser(): void
}
```

### API Files

**src/lib/api.ts**
- Axios instance configured for API calls
- Automatically adds JWT token to Authorization header
- Handles 401 errors with redirect to login
- Base URL: http://localhost:8000/api/v1

**src/hooks/useApi.ts**
```typescript
useApi(url, options?) -> {
  data: T | null
  error: AxiosError | null
  isLoading: boolean
  fetchData(config?): Promise<T>
  postData(body, config?): Promise<T>
  putData(body, config?): Promise<T>
  deleteData(config?): Promise<T>
}
```

## Sidebar Navigation Structure

The sidebar is organized into collapsible sections:

### Main Section
- Dashboard
- My Account
- Manage Users
- Preferences

### BigAdmin (Developer Only)
- Developer Tools
- Store Movement
- System Settings

### Store Settings
- Overview, Options, Shipping, Tax, Google, DNS, Features, Launch

### Design
- Template Tags, Template Library, Image Library, File Library, Forms

### Inventory
- Categories, Products, Refined Search, Discounts, Q&A, Reviews, Import/Export

### Customers
- Search, Groups, Members, Wishlists, Rewards

### Orders
- Pending, Search, Status Import, MOM Builder, Gift Certificates, Catalog Requests

### Marketing
- Meta Tags, Gateway Pages, Email Campaigns, Reminders

### Reporting
- Benchmark, Bot Tracker, Cart Abandonment, Revenue, Sales Rank, Visits

## Usage Examples

### Login Page Usage
```typescript
const { login, verifyMFA, isLoading, error } = useAuth();

// Login
const result = await login({ email: 'admin@example.com', password: 'password' });
if (result.mfa_required) {
  // Show MFA prompt
  await verifyMFA({ mfa_token: result.mfa_token, code: '123456' });
}
```

### Using Layout Component
```typescript
import Layout from '@/components/layout/Layout';

export default function MyPage() {
  return (
    <Layout
      showSidebar={true}
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'My Page' },
      ]}
    >
      <h1>Page Content</h1>
    </Layout>
  );
}
```

### Using Panel Component
```typescript
import Panel from '@/components/ui/Panel';

<Panel type="primary" heading="My Panel">
  <p>Panel content here</p>
</Panel>
```

### Using API Hook
```typescript
import { useApi } from '@/hooks/useApi';

export default function MyComponent() {
  const { data, isLoading, fetchData } = useApi('/api/users');

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  return <div>{/* Render data */}</div>;
}
```

## Migration Notes from PHP/Smarty2

### URL Structure
Old: `/admin.php?action=page`
New: `/page` (Next.js routing)

### Template Files
Old: `.tpl` files
New: `.tsx` React components

### CSS Classes
Old: Bootstrap 3 classes (maintained)
New: Same Bootstrap 3 classes in React components

### Icons
Old: Font Awesome icons via `<i class="fa fa-...">`
New: Same Font Awesome 4.7.0 classes in React

### API Calls
Old: jQuery AJAX to `/api`
New: Axios to `/api/v1` with JWT auth

### Session Management
Old: PHP sessions
New: JWT tokens in cookies

## TypeScript Types

Key types defined in `src/types/index.ts`:
- `User` - User data
- `AuthState` - Auth context state
- `LoginRequest` / `LoginResponse` - Login endpoint types
- `MFAVerifyRequest` - MFA verification request
- `ApiResponse<T>` - Standard API response wrapper
- `Store` - Store data
- `NavLink` / `SidebarSection` - Navigation structure

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Vercel auto-detects Next.js and deploys
```

### Docker
```bash
docker build -t cv3-admin .
docker run -p 3000:3000 cv3-admin
```

### Self-Hosted
```bash
npm run build
npm start
```

## Development Commands

```bash
npm run dev         # Start dev server on port 3000
npm run build       # Build for production
npm start           # Run production server
npm run lint        # Run ESLint
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

## Security Considerations

- JWT tokens stored in HttpOnly cookies
- CSRF protection via next/auth headers
- XSS protection via React's automatic escaping
- CORS handling delegated to backend
- Sensitive data not exposed in URLs

## Common Tasks

### Add New Page
1. Create folder in `src/app/page-name/`
2. Create `page.tsx` with React component
3. Use `Layout` component for consistent styling
4. Add navigation link in `Sidebar.tsx` if needed

### Add New API Endpoint
1. Use `useApi` hook or `api` instance
2. Endpoint should return `ApiResponse<T>` JSON
3. JWT token automatically included in requests

### Add New Component
1. Create file in `src/components/`
2. Make it a Client Component with `'use client'`
3. Export as default
4. Import and use in pages

## Troubleshooting

**Login redirects to login page?**
- Check API_BASE_URL in .env.local
- Verify backend is running
- Check network requests in browser DevTools

**DataTables not initializing?**
- Ensure jQuery and DataTables scripts are loaded in layout.tsx
- Use dynamic import if issues persist

**Styles not loading?**
- Clear browser cache
- Check Bootstrap CDN availability
- Verify globals.css is imported

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review component README.md files
3. Check TypeScript types for API contracts
4. Review example pages (login, dashboard)

## Next Steps

1. Install dependencies: `npm install`
2. Create `.env.local` with API base URL
3. Run development server: `npm run dev`
4. Create additional pages as needed
5. Connect to backend API endpoints
6. Deploy to production
