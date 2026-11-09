import type { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput, 
  Profile, 
  UpdateProfileInput, 
  CaddyRoutingState, 
  DeploymentRecord, 
  ApiResponse,
  SiteContent,
  UpdateSiteContentInput,
  AuthUser,
  TriggerDeployRequest,
  DeploymentJobStatus
} from '@hub/shared';

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hub_admin_token');
  }
  return null;
};

export const setStoredToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('hub_admin_token', token);
    } else {
      localStorage.removeItem('hub_admin_token');
    }
  }
};

const getApiBase = () => {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000/api';
  }
  return '/api';
};

/**
 * Universal fetch wrapper adding JSON parsing, SSR safety and auth headers
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach real JWT token if stored, otherwise allow local dev bypass
  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (process.env.NODE_ENV !== 'production') {
    headers.set('x-dev-admin', 'true');
  }

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
  getDeploymentLiveStatus: () => fetchApi<DeploymentJobStatus>('/deployments/live-status'),
  triggerDeployment: (input?: TriggerDeployRequest) =>
    fetchApi<{ jobId: string; targetSlot: 'blue' | 'green'; autoSwitch: boolean; message?: string }>('/deployments/trigger-build', {
      method: 'POST',
      body: JSON.stringify(input || {}),
    }),
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

  // Dynamic Site Content & Competencies
  getContent: () => fetchApi<SiteContent>('/content'),
  updateContent: (input: UpdateSiteContentInput) =>
    fetchApi<SiteContent>('/content', {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  resetContent: () =>
    fetchApi<SiteContent>('/content/reset', {
      method: 'POST',
    }),

  // Authentication & Session
  login: async (email: string, name?: string): Promise<{ token: string; user: AuthUser }> => {
    const data = await fetchApi<{ token: string; user: AuthUser }>('/auth/sso-exchange', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
    if (data?.token) {
      setStoredToken(data.token);
    }
    return data;
  },
  getAuthUser: () => fetchApi<AuthUser>('/auth/me'),
  logout: () => {
    setStoredToken(null);
  },
};
