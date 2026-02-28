import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------------------------------
   Axios Instance (Cookie Auth)
---------------------------------- */

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  // VERY IMPORTANT
  // allows sending & receiving
  // HTTP-only cookies
  withCredentials: true,
});

/* ---------------------------------
   Request Interceptor
   (no JWT needed now)
---------------------------------- */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // cookies automatically included

    return config;
  },

  (error) => Promise.reject(error),
);

/* ---------------------------------
   Response Interceptor
   (handle auth errors)
---------------------------------- */

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  (error: AxiosError) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // session expired
      window.location.href = "/admin-login";
    }

    return Promise.reject(error);
  },
);

/* ---------------------------------
   HTTP Helpers
---------------------------------- */

export const api = {
  get<T>(endpoint: string) {
    return apiClient.get<T>(endpoint).then((res) => res.data);
  },

  post<T>(endpoint: string, body?: unknown) {
    return apiClient.post<T>(endpoint, body).then((res) => res.data);
  },

  put<T>(endpoint: string, body?: unknown) {
    return apiClient.put<T>(endpoint, body).then((res) => res.data);
  },

  patch<T>(endpoint: string, body?: unknown) {
    return apiClient.patch<T>(endpoint, body).then((res) => res.data);
  },

  delete<T>(endpoint: string, body?: unknown) {
    return apiClient
      .delete<T>(endpoint, { data: body })
      .then((res) => res.data);
  },
};

export default apiClient;
