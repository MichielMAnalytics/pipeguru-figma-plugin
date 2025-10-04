/**
 * PipeGuru API Integration
 * Handles sending HTML exports to PipeGuru backend
 */

// Placeholder endpoint - replace with actual PipeGuru API endpoint
const PIPEGURU_API_ENDPOINT = "https://api.pipeguru.ai/figma/import";

export interface PipeGuruPayload {
  html: string;
  framework: string;
  designName?: string;
  nodeId?: string;
  fileId?: string;
  timestamp: string;
}

export interface PipeGuruResponse {
  success: boolean;
  message?: string;
  id?: string;
}

/**
 * Extract OAuth token from URL parameters
 * Token should be passed by pipeguru.ai when opening the plugin
 */
export function getAuthTokenFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || params.get("auth_token") || null;
  } catch (error) {
    console.error("Failed to extract auth token from URL:", error);
    return null;
  }
}

/**
 * Send HTML code to PipeGuru backend
 */
export async function sendToPipeGuru(
  payload: PipeGuruPayload,
  authToken?: string | null
): Promise<PipeGuruResponse> {
  const token = authToken || getAuthTokenFromUrl();

  if (!token) {
    throw new Error("Authentication token not found. Please open this plugin from PipeGuru.");
  }

  try {
    const response = await fetch(PIPEGURU_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data: PipeGuruResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Could not connect to PipeGuru");
    }
    throw error;
  }
}

/**
 * Check if the plugin was opened with a valid auth token
 */
export function hasAuthToken(): boolean {
  return getAuthTokenFromUrl() !== null;
}

/**
 * Get the current Figma file and node information
 */
export async function getFigmaContext(): Promise<{
  fileId: string | null;
  nodeId: string | null;
  nodeName: string | null;
}> {
  // This would need to be populated by the plugin backend
  // For now, return placeholders
  return {
    fileId: null,
    nodeId: null,
    nodeName: null,
  };
}
