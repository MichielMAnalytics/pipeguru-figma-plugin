/**
 * Authentication storage utilities for PipeGuru
 * Manages token and user information in Figma client storage
 */

export interface StoredUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: StoredUser | null;
}

// Message types for communication between UI and plugin backend
export const AUTH_MESSAGES = {
  STORE_TOKEN: 'pipeguru-store-token',
  GET_TOKEN: 'pipeguru-get-token',
  CLEAR_TOKEN: 'pipeguru-clear-token',
  CHECK_AUTH: 'pipeguru-check-auth',
  TOKEN_RESPONSE: 'pipeguru-token-response',
  AUTH_STATE_RESPONSE: 'pipeguru-auth-state-response',
} as const;

/**
 * Request to store authentication data in Figma client storage
 */
export function storeAuthData(token: string, user: StoredUser): void {
  parent.postMessage(
    {
      pluginMessage: {
        type: AUTH_MESSAGES.STORE_TOKEN,
        token,
        user,
      },
    },
    '*'
  );
}

/**
 * Request to get the stored token
 */
export function requestAuthState(): void {
  parent.postMessage(
    {
      pluginMessage: {
        type: AUTH_MESSAGES.CHECK_AUTH,
      },
    },
    '*'
  );
}

/**
 * Request to clear authentication data
 */
export function clearAuthData(): void {
  parent.postMessage(
    {
      pluginMessage: {
        type: AUTH_MESSAGES.CLEAR_TOKEN,
      },
    },
    '*'
  );
}
