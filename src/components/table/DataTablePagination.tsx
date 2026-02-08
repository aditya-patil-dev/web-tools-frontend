"use client";

type Props = {
    pageIndex: number;
    pageSize: number;
    totalRows: number;
    onPageIndexChange: (next: number) => void;
    onPageSizeChange: (next: number) => void;
};

const PAGE_SIZES = [10, 20, 30, 50, 100];

export default function DataTablePagination({
    pageIndex,
    pageSize,
    totalRows,
    onPageIndexChange,
    onPageSizeChange,
}: Props) {
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const canPrev = pageIndex > 0;
    const canNext = pageIndex < totalPages - 1;

    const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min(totalRows, (pageIndex + 1) * pageSize);

    return (
        <div className="dtPagination">
            <div className="dtPaginationLeft">
                <span className="dtMuted">
                    Showing <b>{from}</b>–<b>{to}</b> of <b>{totalRows}</b>
                </span>
            </div>

            <div className="dtPaginationRight">
                <select
                    className="dtSelect"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>
                            {s} / page
                        </option>
                    ))}
                </select>

                <button className="dtBtn" onClick={() => onPageIndexChange(0)} disabled={!canPrev}>
                    <i className="bi bi-chevron-double-left" />
                </button>
                <button className="dtBtn" onClick={() => onPageIndexChange(pageIndex - 1)} disabled={!canPrev}>
                    <i className="bi bi-chevron-left" />
                </button>

                <span className="dtPagePill">
                    {pageIndex + 1} / {totalPages}
                </span>

                <button className="dtBtn" onClick={() => onPageIndexChange(pageIndex + 1)} disabled={!canNext}>
                    <i className="bi bi-chevron-right" />
                </button>
                <button className="dtBtn" onClick={() => onPageIndexChange(totalPages - 1)} disabled={!canNext}>
                    <i className="bi bi-chevron-double-right" />
                </button>
            </div>
        </div>
    );
}
