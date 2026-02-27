import Link from "next/link";

export default function PolicyNotFound() {
    return (
        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Page Not Found</h1>
            <p style={{ marginBottom: "2rem", opacity: 0.7 }}>
                The policy page you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
                href="/pages/privacy-policy"
                style={{
                    display: "inline-block",
                    padding: "0.6rem 1.5rem",
                    background: "var(--color-accent, #2563eb)",
                    color: "#fff",
                    borderRadius: "6px",
                    textDecoration: "none",
                }}
            >
                Go to Privacy Policy
            </Link>
        </div>
    );
}