import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { Achievement, AchievementInput, AuthSession, Comment, Paginated, Post, PostInput, PostStatus, Publication, PublicationInput, PublicComment, SiteSetting } from "./types";
import { useAuthStore } from "./auth";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
export const api = axios.create({ baseURL, headers: { Accept: "application/json" }, timeout: 20_000 });
const refreshClient = axios.create({ baseURL, headers: { Accept: "application/json" }, timeout: 20_000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshInFlight: Promise<string> | null = null;
api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  if (error.response?.status !== 401 || !original || original._retried || original.url?.includes("/admin/auth/login")) return Promise.reject(error);
  const currentToken = useAuthStore.getState().token;
  if (!currentToken) return Promise.reject(error);
  original._retried = true;
  try {
    refreshInFlight ??= refreshClient.post<AuthSession>("/admin/auth/refresh", null, { headers: { Authorization: `Bearer ${currentToken}` } })
      .then(({ data }) => { useAuthStore.getState().setSession(data.access_token, data.admin); return data.access_token; })
      .finally(() => { refreshInFlight = null; });
    const newToken = await refreshInFlight;
    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  } catch (refreshError) {
    useAuthStore.getState().clear();
    if (window.location.pathname !== "/owner-login") window.location.assign("/owner-login");
    return Promise.reject(refreshError);
  }
});

export const authApi = {
  login: (email: string, password: string) => api.post<AuthSession>("/admin/auth/login", { email, password }).then((r) => r.data),
  logout: () => api.post("/admin/auth/logout"),
  forgotPassword: (email: string) => api.post<{ message: string }>("/admin/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (email: string, token: string, password: string, password_confirmation: string) =>
    api.post<{ message: string }>("/admin/auth/reset-password", { email, token, password, password_confirmation }).then((r) => r.data),
};

export const postsApi = {
  publicList: (page = 1) => api.get<Paginated<Post>>("/posts", { params: { page } }).then((r) => r.data),
  publicGet: (slug: string) => api.get<{ data: Post }>(`/posts/${encodeURIComponent(slug)}`).then((r) => r.data.data),
  publicComments: (slug: string, page = 1) => api.get<Paginated<PublicComment>>(`/posts/${encodeURIComponent(slug)}/comments`, { params: { page } }).then((r) => r.data),
  submitPublicComment: (slug: string, input: { author_name: string; author_email?: string; body: string }) => api.post(`/posts/${encodeURIComponent(slug)}/comments`, input),
  list: (status?: PostStatus) => api.get<Paginated<Post>>("/admin/posts", { params: status ? { status } : undefined }).then((r) => r.data),
  get: (id: string) => api.get<{ data: Post }>(`/admin/posts/${id}`).then((r) => r.data.data),
  create: (input: PostInput | FormData) => api.post<{ data: Post }>("/admin/posts", input).then((r) => r.data.data),
  update: (id: string, input: PostInput | FormData) => {
    if (input instanceof FormData) {
      input.append("_method", "PATCH");
      return api.post<{ data: Post }>(`/admin/posts/${id}`, input).then((r) => r.data.data);
    }
    return api.patch<{ data: Post }>(`/admin/posts/${id}`, input).then((r) => r.data.data);
  },
  remove: (id: string) => api.delete(`/admin/posts/${id}`),
  comments: (status: Comment["status"]) => api.get<Paginated<Comment>>("/admin/comments", { params: { status } }).then((r) => r.data),
  moderate: (id: string, status: "approved" | "rejected") => api.patch(`/admin/comments/${id}`, { status }),
  removeComment: (id: string) => api.delete(`/admin/comments/${id}`),
};

export const publicationsApi = {
  publicList: (page = 1) => api.get<Paginated<Publication>>("/publications", { params: { page } }).then((r) => r.data),
  publicGet: (id: string) => api.get<{ data: Publication }>(`/publications/${id}`).then((r) => r.data.data),
  list: () => api.get<Paginated<Publication>>("/admin/publications").then((r) => r.data),
  get: (id: string) => api.get<{ data: Publication }>(`/admin/publications/${id}`).then((r) => r.data.data),
  list: (status?: "draft" | "published") => api.get<Paginated<Publication>>("/admin/publications", { params: status ? { status } : {} }).then((r) => r.data),
  create: (input: PublicationInput) => api.post<{ data: Publication }>("/admin/publications", input).then((r) => r.data.data),
  update: (id: string, input: Partial<PublicationInput>) => api.patch<{ data: Publication }>(`/admin/publications/${id}`, input).then((r) => r.data.data),
  updateStatus: (id: string, status: "draft" | "published") => api.patch<{ data: Publication }>(`/admin/publications/${id}/status`, { status }).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/admin/publications/${id}`),
};

export const achievementsApi = {
  publicList: (page = 1) => api.get<Paginated<Achievement>>("/achievements", { params: { page } }).then((r) => r.data),
  publicGet: (id: string) => api.get<{ data: Achievement }>(`/achievements/${id}`).then((r) => r.data.data),
  list: () => api.get<Paginated<Achievement>>("/admin/achievements").then((r) => r.data),
  get: (id: string) => api.get<{ data: Achievement }>(`/admin/achievements/${id}`).then((r) => r.data.data),
  create: (input: AchievementInput) => api.post<{ data: Achievement }>("/admin/achievements", input).then((r) => r.data.data),
  update: (id: string, input: Partial<AchievementInput>) => api.patch<{ data: Achievement }>(`/admin/achievements/${id}`, input).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/admin/achievements/${id}`),
};

export const siteSettingsApi = {
  publicGet: () => api.get<{ data: SiteSetting }>("/settings").then((r) => r.data.data),
  get: () => api.get<{ data: SiteSetting }>("/admin/settings").then((r) => r.data.data),
  update: (data: FormData | Record<string, string | null>) =>
    api.post<{ data: SiteSetting }>("/admin/settings", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }).then((r) => r.data.data),
};
