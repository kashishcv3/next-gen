export interface User {
  id: string;
  uid?: number;
  email: string;
  name: string;
  username?: string;
  user_type?: string;
  role: string;
  permissions: string[];
  store_id?: string;
  is_developer?: boolean;
  first_name?: string;
  last_name?: string;
  in_cloud?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  access_token?: string;
  user_id?: number;
  username?: string;
  user_type?: string;
  mfa_required?: boolean;
  mfa_token?: string;
  forward_route?: string;
  device_trust_token?: string;
}

export interface MFAVerifyRequest {
  mfa_token: string;
  code: string;
  trust_device?: boolean;
}

export interface Store {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface DataTableOptions {
  columns: string[];
  data: any[];
  pageLength?: number;
  responsive?: boolean;
  searching?: boolean;
  ordering?: boolean;
  info?: boolean;
  paging?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavLink {
  label: string;
  href: string;
  icon?: string;
  submenu?: NavLink[];
  permission?: string;
  visible?: boolean;
}

export interface SidebarSection {
  title: string;
  items: NavLink[];
  permission?: string;
  visible?: boolean;
}
