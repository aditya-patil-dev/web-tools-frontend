import type { AdminNavItem } from "@/config/adminNav";

export function isRouteActive(
    pathname: string,
    href?: string,
    match: "exact" | "prefix" = "prefix"
) {
    if (!href) return false;
    if (match === "exact") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href);
}

export function itemHasActiveChild(pathname: string, item: AdminNavItem): boolean {
    if (!item.children?.length) return false;
    return item.children.some((c) => {
        const selfActive = isRouteActive(pathname, c.href, c.match ?? "prefix");
        const deepActive = c.children ? itemHasActiveChild(pathname, c) : false;
        return selfActive || deepActive;
    });
}
