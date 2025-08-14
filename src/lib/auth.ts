import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/auth-token=([^;]+)/);
    return match ? match[1] : null;
  }
  return null;
}

export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');
  return token?.value || null;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export async function logout() {
  removeAuthToken();
  window.location.href = '/login';
}

// Mock user data - replace with actual API calls
export function getCurrentUser(): User | null {
  const token = getAuthToken();
  if (!token) return null;

  // Mock user data based on token
  // In a real app, you'd decode the JWT or make an API call
  return {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'admin'
  };
}