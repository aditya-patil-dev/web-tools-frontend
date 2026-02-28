import { authStorage } from "./auth.storage";

export function requireAdminAuth(router: any) {

    const token = authStorage.getToken();

    if (!token) {

        router.push("/admin-login");

        return false;
    }

    return true;
}