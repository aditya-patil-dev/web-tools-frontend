import type { LoadingOptions } from "./loading.types";

type LoadingApi = {
    show: (options?: LoadingOptions) => void;
    hide: () => void;
};

let api: LoadingApi | null = null;

export function bindLoading(handlers: LoadingApi) {
    api = handlers;
}

export const loading = {
    show: (options?: LoadingOptions) => api?.show(options),
    hide: () => api?.hide(),
};
