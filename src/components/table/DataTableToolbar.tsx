"use client";

import { useMemo } from "react";

type Props = {
    title?: string;
    subtitle?: string;

    globalFilter: string;
    onGlobalFilterChange: (v: string) => void;

    // column visibility
    canToggleColumns: boolean;
    columnsForToggle: { id: string; label: string; visible: boolean; toggle: () => void }[];

    rightActions?: React.ReactNode;
};

export default function DataTableToolbar({
    title,
    subtitle,
    globalFilter,
    onGlobalFilterChange,
    canToggleColumns,
    columnsForToggle,
    rightActions,
}: Props) {
    const hasHeaderText = useMemo(() => !!title || !!subtitle, [title, subtitle]);

    return (
        <div className="dtToolbar">
            <div className="dtToolbarLeft">
                {hasHeaderText && (
                    <div className="dtTitleBlock">
                        {title && <div className="dtTitle">{title}</div>}
                        {subtitle && <div className="dtSubtitle">{subtitle}</div>}
                    </div>
                )}

                <div className="dtSearch">
                    <i className="bi bi-search dtSearchIcon" />
                    <input
                        className="dtSearchInput"
                        value={globalFilter}
                        onChange={(e) => onGlobalFilterChange(e.target.value)}
                        placeholder="Search..."
                    />
                </div>
            </div>

            <div className="dtToolbarRight">
                {rightActions}

                {canToggleColumns && (
                    <div className="dtColToggleWrap">
                        <button className="dtBtn" type="button">
                            <i className="bi bi-columns-gap" />
                            Columns
                        </button>

                        <div className="dtColMenu">
                            <div className="dtColMenuTitle">Show / Hide</div>
                            {columnsForToggle.map((c) => (
                                <label key={c.id} className="dtColItem">
                                    <input
                                        type="checkbox"
                                        checked={c.visible}
                                        onChange={c.toggle}
                                    />
                                    <span>{c.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
