import { api } from "@/lib/api/api";

interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            full_name: string;
            email: string;
            role: string;
        };
        workspace: {
            id: string;
            name: string;
        };
    };
    token: string;
    expires_in: number;
}

export const authApi = {

    async login(email: string, password: string) {

        const res = await api.post<LoginResponse>(
            "/users/login",
            {
                email,
                password,
                client: "admin",
            }
        );

        return res;
    }

};