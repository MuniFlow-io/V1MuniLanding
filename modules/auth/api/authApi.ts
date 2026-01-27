/**
 * Auth Frontend API
 * 
 * ARCHITECTURE: Frontend API (Layer 3)
 * - HTTP communication with backend auth endpoints
 * - No business logic
 * - Just fetch wrappers
 * 
 * ELITE STANDARDS:
 * - Each function <30 lines
 * - Typed return values
 * - HTTP error checking
 */

export const authApi = {
  /**
   * Sign up new user
   */
  async signUp(email: string, password: string): Promise<void> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign up failed');
    }
  },
  
  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string): Promise<void> {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign in failed');
    }
  },
  
  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign out failed');
    }
  },
  
  /**
   * Get current session
   */
  async getSession(): Promise<{ user: { id: string; email: string } } | null> {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.session || null;
  }
};
