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
        variant?: "primary" | "secondary" | "danger" | "ghost";
        type?: "button" | "submit";
        isLoading?: boolean;
        loadingText?: string;
        disabled?: boolean;
        leftIcon?: React.ReactNode;
    }[];

    /** NEW - for form pages with sticky actions */
    stickyActions?: boolean;

    variant?: "card" | "flat";

    className?: string;
};