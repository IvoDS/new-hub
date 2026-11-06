import type { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput, 
  Profile, 
  UpdateProfileInput, 
  CaddyRoutingState, 
  DeploymentRecord, 
  ApiResponse 
} from '@hub/shared';

const getApiBase = () => {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000/api';
  }
  return '/api';
};

/**
 * Universal fetch wrapper adding JSON parsing, SSR safety and dev-bypass headers
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include dev-admin bypass header for seamless local testing
  headers.set('x-dev-admin', 'true');

  const base = getApiBase();
  const url = `${base}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      // Short timeout on server to never block page rendering
      signal: typeof window === 'undefined' ? AbortSignal.timeout(2000) : options.signal,
    });

    if (!res.ok) {
      let errorDetail = 'API Request Failed';
      try {
        const errJson = await res.json();
        errorDetail = errJson.error?.message || errJson.message || res.statusText;
      } catch {
        errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorDetail);
    }

    const json = (await res.json()) as ApiResponse<T>;
    return json.data;
  } catch (err: any) {
    // During server-side rendering (SSR), do not crash the page if API is booting up
    if (typeof window === 'undefined') {
      console.warn(`[SSR API] Graceful fallback for ${endpoint}:`, err.message);
      return null as any;
    }
    throw err;
  }
}

export const api = {
  // Projects
  getProjects: () => fetchApi<Project[]>('/projects'),
  getProjectBySlug: (slug: string) => fetchApi<Project>(`/projects/${slug}`),
  getAllProjectsAdmin: () => fetchApi<Project[]>('/projects/admin/all'),
  createProject: (input: CreateProjectInput) =>
    fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateProject: (id: string, input: UpdateProjectInput) =>
    fetchApi<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  deleteProject: (id: string) =>
    fetchApi<{ id: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // Profile
  getProfile: () => fetchApi<Profile>('/profile'),
  updateProfile: (input: UpdateProfileInput) =>
    fetchApi<Profile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  // Deployments & Caddy Traffic Switcher
  getDeployments: () => fetchApi<{ routing: CaddyRoutingState; history: DeploymentRecord[] }>('/deployments'),
  switchSlot: (targetSlot: 'blue' | 'green', notes?: string) =>
    fetchApi<{ success: boolean; state: CaddyRoutingState; message: string }>('/deployments/switch', {
      method: 'POST',
      body: JSON.stringify({ targetSlot, notes }),
    }),
  rollback: (reason?: string) =>
    fetchApi<{ success: boolean; state: CaddyRoutingState; message: string }>('/deployments/rollback', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Uploads
  uploadFile: async (file: File): Promise<{ filename: string; url: string; mimetype: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<{ filename: string; url: string; mimetype: string }>('/uploads', {
      method: 'POST',
      body: formData,
    });
  },
};
