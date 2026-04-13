# CV3 Admin Platform - Frontend

Next.js frontend for the CV3 e-commerce admin platform, migrated from PHP/Smarty2 with Bootstrap 3.

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   ├── page.tsx            # Root page (redirect to login/dashboard)
│   │   ├── globals.css         # Global Bootstrap 3 styles
│   │   ├── login/              # Login page
│   │   └── dashboard/          # Dashboard page
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx      # Main navbar
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   ├── Footer.tsx      # Footer
│   │   │   ├── Layout.tsx      # Main layout wrapper
│   │   │   └── PopupLayout.tsx # Popup layout
│   │   └── ui/                 # Reusable UI components
│   │       ├── DataTable.tsx   # DataTables wrapper
│   │       ├── Panel.tsx       # Bootstrap panel
│   │       ├── AlertMessage.tsx
│   │       └── Breadcrumb.tsx
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state management
│   ├── lib/
│   │   ├── api.ts             # Axios instance with JWT interceptors
│   │   └── auth.ts            # Auth utilities
│   ├── hooks/
│   │   └── useApi.ts          # Custom hook for API calls
│   ├── utils/
│   │   └── helpers.ts         # Utility functions
│   └── types/
│       └── index.ts           # TypeScript types
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── next.config.js
```

## Features

- **Authentication**: JWT-based authentication with MFA support
- **Bootstrap 3 Design**: Matches legacy SB-Admin theme
- **Responsive Sidebar**: Collapsible navigation with store-specific sections
- **DataTables Integration**: jQuery DataTables with Bootstrap styling
- **API Integration**: Axios with automatic JWT header injection
- **TypeScript**: Full type safety throughout
- **State Management**: React Context for auth state

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Components

### Layout Components

#### Header.tsx
Main navigation bar with:
- CV3 branding
- Top navigation links (Dashboard, Orders, Content, etc.)
- User dropdown with logout
- Breadcrumb support

#### Sidebar.tsx
Collapsible sidebar with sections:
- Main (Dashboard, My Account, Preferences)
- BigAdmin (for developers)
- Store Settings
- Design Tools
- Inventory Management
- Customer Management
- Orders
- Marketing
- Reporting

#### Layout.tsx
Main layout wrapper combining Header, Sidebar, and Footer with flexible content area.

### UI Components

#### Panel.tsx
Bootstrap panel with variants (primary, success, danger, etc.)

#### DataTable.tsx
jQuery DataTables wrapper with Bootstrap 3 styling and responsive design.

#### AlertMessage.tsx
Dismissible alert component with success/danger/warning/info variants.

#### Breadcrumb.tsx
Navigation breadcrumb component.

## API Integration

### useApi Hook

```typescript
const { data, isLoading, error, fetchData, postData } = useApi('/endpoint');

// Fetch data
await fetchData();

// Post data
await postData({ name: 'value' });
```

### API Instance

The `api` instance automatically:
- Adds JWT token from cookies to Authorization header
- Redirects to login on 401 errors
- Handles errors consistently

```typescript
import api from '@/lib/api';

const response = await api.get('/users');
const posted = await api.post('/users', { name: 'John' });
```

## Authentication

### Login Flow

1. User enters credentials
2. If MFA required, show 2FA prompt
3. Verify MFA code
4. Store token in cookie
5. Redirect to dashboard

### Auth Context

```typescript
const { user, isAuthenticated, login, logout, verifyMFA } = useAuth();
```

## Styling

Bootstrap 3 CSS is loaded from CDN. Additional styles in `globals.css` provide:
- Custom navbar styling matching SB-Admin
- Sidebar navigation styles
- Panel and table styling
- Alert variants

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Axios instance with interceptors |
| `src/lib/auth.ts` | Auth utilities and token management |
| `src/context/AuthContext.tsx` | Auth state management |
| `src/components/layout/Layout.tsx` | Main layout component |
| `src/app/layout.tsx` | Root layout with providers |

## Development Notes

- All components are Client Components (use 'use client')
- Bootstrap 3 classes are used directly for styling
- Font Awesome 4.7.0 for icons
- DataTables for dynamic tables
- TypeScript strict mode enabled

## Migration Notes

This frontend replaces the legacy PHP/Smarty2 admin platform while maintaining:
- Visual design (Bootstrap 3 + SB-Admin theme)
- Navigation structure and sidebar layout
- Panel-based layouts
- DataTables functionality
- Icon set (Font Awesome)

API endpoints should follow RESTful conventions and return JSON responses compatible with the `ApiResponse<T>` type.
