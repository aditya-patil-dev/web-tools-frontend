export type PageHeaderProps = {
    title: string;
    subtitle?: string;

    breadcrumbs?: {
        label: string;
        href?: string;
    }[];

    showBack?: boolean;
    onBack?: () => void;

    actions?: {
        label: string;
        icon?: string;
        onClick?: () => void;
        href?: string;
        variant?: "primary" | "secondary" | "danger";
    }[];

    /** NEW */
    variant?: "card" | "flat";

    className?: string;
};
