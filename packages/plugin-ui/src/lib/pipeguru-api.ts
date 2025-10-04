/**
 * PipeGuru API Integration
 * Handles authentication and sending HTML exports to PipeGuru backend
 */

// Environment-based API URL
const PIPEGURU_URL = 'http://localhost:8000'; // Force localhost for development

console.log('[PipeGuru API] Using API URL:', PIPEGURU_URL);

const PIPEGURU_LOGIN_ENDPOINT = `${PIPEGURU_URL}/api/figma/login`;
const PIPEGURU_IMPORT_ENDPOINT = `${PIPEGURU_URL}/api/figma/import-html`;

console.log('[PipeGuru API] Login endpoint:', PIPEGURU_LOGIN_ENDPOINT);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  error?: string;
}

export interface ImportScreen {
  name: string;
  html: string;
  warnings: string[];
}

export interface ImportRequest {
  flow_name: string;
  screens: ImportScreen[];
}

export interface ImportResponse {
  success: boolean;
  flow_id: number;
  redirect_url: string;
  error?: string;
  message?: string;
}

/**
 * Login to PipeGuru API
 */
export async function loginToPipeGuru(
  email: string,
  password: string
): Promise<LoginResponse> {
  console.log('[PipeGuru API] Attempting login to:', PIPEGURU_LOGIN_ENDPOINT);

  try {
    const response = await fetch(PIPEGURU_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('[PipeGuru API] Response status:', response.status);

    const result = await response.json();
    console.log('[PipeGuru API] Response data:', result);

    if (response.ok && result.success) {
      return result;
    } else {
      throw new Error(result.error || 'Login failed');
    }
  } catch (error) {
    console.error('[PipeGuru API] Login error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Could not connect to PipeGuru');
    }
    throw error;
  }
}

/**
 * Send HTML code to PipeGuru backend
 */
export async function sendToPipeGuru(
  flowName: string,
  screens: ImportScreen[],
  authToken: string
): Promise<ImportResponse> {
  const payload = {
    flow_name: flowName,
    screens: screens
  };

  console.log('[PipeGuru API] Sending to:', PIPEGURU_IMPORT_ENDPOINT);
  console.log('[PipeGuru API] Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(PIPEGURU_IMPORT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    console.log('[PipeGuru API] Import response status:', response.status);

    const result = await response.json();
    console.log('[PipeGuru API] Import response data:', result);

    if (response.ok && result.success) {
      return result;
    } else if (response.status === 401) {
      // Token expired or invalid
      throw new Error('UNAUTHORIZED');
    } else {
      throw new Error(result.error || 'Import failed');
    }
  } catch (error) {
    console.error('[PipeGuru API] Import error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Could not connect to PipeGuru');
    }
    throw error;
  }
}
