"use client";

export default function DataTableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="dtSkeleton">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="dtSkeletonRow">
                    {Array.from({ length: cols }).map((__, c) => (
                        <div key={c} className="dtSkeletonCell" />
                    ))}
                </div>
            ))}
        </div>
    );
}
