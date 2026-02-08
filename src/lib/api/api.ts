import axios, { AxiosError, AxiosInstance } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------------------------------
   Axios Instance
---------------------------------- */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------------
   Request Interceptor (JWT)
---------------------------------- */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ---------------------------------
   Response Interceptor (Optional)
---------------------------------- */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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

  delete<T>(endpoint: string, body?: unknown) {
    return apiClient
      .delete<T>(endpoint, { data: body })
      .then((res) => res.data);
  },
};

export default apiClient;
