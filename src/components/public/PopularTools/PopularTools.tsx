"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import AppLink from '@/components/common/AppLink';
import { POPULAR_TOOLS } from "./tools.config";
import DynamicIcon from "@/components/ui/DynamicIcon";

interface Tool {
    title: string;
    description: string;
    icon: string;
    href: string;
    badge?: string | null;
    category?: string;
}
interface PopularToolsConfig {
    header: { title: string; subtitle: string };
    tools: Tool[];
    footer: { text: string; href: string };
}
interface PopularToolsProps {
    config?: PopularToolsConfig;
}

const DEFAULT_CONFIG: PopularToolsConfig = {
    header: {
        title: "Popular <span>Tools</span>",
        subtitle: "Our most-used tools by people like you",
    },
    tools: POPULAR_TOOLS,
    footer: { text: "View All Tools →", href: "/tools" },
};

export default function PopularTools({ config = DEFAULT_CONFIG }: PopularToolsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasMoved, setHasMoved] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setHasMoved(false);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => {
        // Delay resetting isDragging to allow the click handler to run
        setTimeout(() => setIsDragging(false), 0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast factor
        if (Math.abs(x - startX) > 5) {
            setHasMoved(true);
        }
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleLinkClick = (e: React.MouseEvent) => {
        if (hasMoved) {
            e.preventDefault();
        }
    };

    return (
        <section className="tools-wrapper">
            <div className="tools-container">
                <div className="tools-header">
                    <h2 dangerouslySetInnerHTML={{ __html: config.header.title }} />
                    <p>{config.header.subtitle}</p>
                </div>

                <div
                    className={`tools-grid horizontal-row ${isDragging ? 'dragging' : ''}`}
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: isDragging ? 'none' : 'auto'
                    }}
                >
                    {config.tools.map((tool, index) => (
                        <div
                            key={index}
                            className="tool-card"
                            onDragStart={(e) => e.preventDefault()}
                        >
                            <AppLink
                                href={tool.href}
                                className="tool-card-link"
                                onClick={handleLinkClick}
                            >
                                <div className="tool-glow"></div>
                                {tool.badge && <span className="tool-card-badge">{tool.badge}</span>}
                                <div className="tool-icon">
                                    <DynamicIcon name={tool.icon} size={32} fallback={<span>🔧</span>} />
                                </div>
                                <div className="tool-content">
                                    <h3>{tool.title}</h3>
                                    <p>{tool.description}</p>
                                </div>
                                <div className="tool-card-footer">
                                    {tool.category && <span className="tool-usage-tag">{tool.category}</span>}
                                    <div className="tool-action-icon">
                                        <DynamicIcon name="LuArrowRight" size={16} />
                                    </div>
                                </div>
                            </AppLink>
                        </div>
                    ))}
                </div>

                <div className="tools-footer">
                    <AppLink href={config.footer.href} className="tools-view-all">
                        {config.footer.text}
                    </AppLink>
                </div>
            </div>
        </section>
    );
}