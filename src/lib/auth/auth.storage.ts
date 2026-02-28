export const authStorage = {

    set(
        token: string,
        user: any,
        workspace: any,
        remember: boolean
    ) {

        const storage =
            remember
                ? localStorage
                : sessionStorage;

        storage.setItem("admin_token", token);
        storage.setItem("admin_user", JSON.stringify(user));

        // cookie for middleware
        document.cookie =
            `admin_token=${token}; path=/; max-age=86400`;

    },


    clear() {

        localStorage.clear();
        sessionStorage.clear();

        document.cookie =
            "admin_token=; path=/; max-age=0";

    },


    getToken() {

        return (
            localStorage.getItem("admin_token") ||
            sessionStorage.getItem("admin_token")
        );

    }

};