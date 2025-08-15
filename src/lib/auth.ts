export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  organization: string;
  jobTitle: string;
}

// Login function - calls real API
export async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string; role?: string }> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok) {
      // Wait a moment for the cookie to be properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true, role: data.role };
    } else {
      return { success: false, error: data.message || 'Login failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error occurred' };
  }
}

// Register function - calls real API
export async function register(userData: RegisterData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.message || 'Registration failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error occurred' };
  }
}

// Get current user from API
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

// Check if user is authenticated by trying to get current user
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Logout function - clears server-side cookie
export async function logout(): Promise<void> {
  try {
    // Clear the HttpOnly cookie by making a request that will expire it
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Redirect to login regardless of API call success
    window.location.href = '/login';
  }
}