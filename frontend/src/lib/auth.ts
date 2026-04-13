import Cookies from 'js-cookie';
import api from './api';
import { User, LoginRequest, LoginResponse, MFAVerifyRequest } from '@/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const MFA_TOKEN_KEY = 'mfa_token';
const MFA_DEVICE_TRUST_KEY = 'mfa_device_trust';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    // Check if device_trust_token exists in cookie and include it
    const deviceTrustToken = Cookies.get(MFA_DEVICE_TRUST_KEY);
    const requestPayload = {
      ...credentials,
      device_trust_token: deviceTrustToken || undefined,
    };

    const response = await api.post('/auth/login', requestPayload);
    const data = response.data;

    // Backend returns: { access_token, token_type, user_id, username, user_type }
    // Map to our LoginResponse format
    const token = data.access_token || data.token;
    const user: User = data.user || {
      uid: data.user_id,
      username: data.username,
      user_type: data.user_type,
      email: '',
      first_name: '',
      last_name: '',
      in_cloud: false,
    };

    if (data.mfa_required && data.mfa_token) {
      // Store MFA token temporarily for 2FA verification
      Cookies.set(MFA_TOKEN_KEY, data.mfa_token, { expires: 1 / 24 }); // 1 hour
      return {
        token,
        user,
        mfa_required: true,
        mfa_token: data.mfa_token,
      };
    }

    // Store token and user
    Cookies.set(TOKEN_KEY, token, { expires: 7 });
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });

    return { token, user, forward_route: data.forward_route };
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Login failed');
  }
}

export async function verifyMFA(req: MFAVerifyRequest): Promise<LoginResponse> {
  try {
    const response = await api.post('/auth/verify-mfa', req);
    const data = response.data;

    // Backend returns: { access_token, user_id, username, user_type, forward_route, device_trust_token }
    const token = data.access_token || data.token;
    const user: User = data.user || {
      uid: data.user_id,
      username: data.username,
      user_type: data.user_type,
      email: '',
      first_name: '',
      last_name: '',
      in_cloud: false,
    };

    // Store token and user
    Cookies.set(TOKEN_KEY, token, { expires: 7 });
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });

    // If device_trust_token is provided, store it
    if (data.device_trust_token) {
      Cookies.set(MFA_DEVICE_TRUST_KEY, data.device_trust_token, { expires: 7 });
    }

    // Clear MFA token
    Cookies.remove(MFA_TOKEN_KEY);

    return { token, user, forward_route: data.forward_route, device_trust_token: data.device_trust_token };
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.response?.data?.message || 'MFA verification failed');
  }
}

export function logout(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
  Cookies.remove(MFA_TOKEN_KEY);
  Cookies.remove(MFA_DEVICE_TRUST_KEY);
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

export function getUser(): User | null {
  const userStr = Cookies.get(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function hasMFAToken(): boolean {
  return !!Cookies.get(MFA_TOKEN_KEY);
}

export function getMFAToken(): string | null {
  return Cookies.get(MFA_TOKEN_KEY) || null;
}
