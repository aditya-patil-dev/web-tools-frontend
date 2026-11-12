"use client";

import React, { useState, useMemo } from "react";
import AppLink from "@/components/common/AppLink";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { MASTER_TOOLS, MasterTool, UserRole, getToolsByRole } from "@/config/tools-registry";
import {
  LuSparkles,
  LuPaintbrush,
  LuTrendingUp,
  LuCode,
  LuFileText,
  LuArrowRight,
} from "react-icons/lu";

interface RoleTab {
  id: UserRole;
  label: string;
  icon: React.ReactNode;
}

const ROLES: RoleTab[] = [
  { id: "all", label: "All Utilities", icon: <LuSparkles size={16} /> },
  { id: "creator", label: "Creators & Designers", icon: <LuPaintbrush size={16} /> },
  { id: "marketer", label: "SEO & Growth", icon: <LuTrendingUp size={16} /> },
  { id: "developer", label: "Developers", icon: <LuCode size={16} /> },
  { id: "office", label: "Office & Documents", icon: <LuFileText size={16} /> },
];

function getRoleBadgeClass(badge?: string): string {
  if (!badge) return "";
  const b = badge.toLowerCase();
  if (b.includes("ai")) return "highlight-card-badge badge-ai";
  if (b.includes("popular")) return "highlight-card-badge badge-popular";
  if (b.includes("fast") || b.includes("free")) return "highlight-card-badge badge-fast";
  if (b.includes("private") || b.includes("secure")) return "highlight-card-badge badge-private";
  if (b.includes("hot") || b.includes("new")) return "highlight-card-badge badge-hot";
  return "highlight-card-badge badge-popular";
}

export default function RoleExplorer() {
  const [activeRole, setActiveRole] = useState<UserRole>("all");
  const [filterQuery, setFilterQuery] = useState("");

  const filteredTools = useMemo(() => {
    let list = getToolsByRole(activeRole);
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.categoryLabel.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeRole, filterQuery]);

  return (
    <section className="role-explorer-section">
      <div className="role-explorer-top">
        <h2>Explore By What You Need To Do</h2>
        <p>
          Find the exact tool tailored to your workflow. No clutter, no waiting lines, just instant results.
        </p>

        {/* Role Switcher Pills */}
        <div className="role-tabs-bar">
          {ROLES.map((role) => {
            const count = getToolsByRole(role.id).length;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`role-tab-pill ${activeRole === role.id ? "active" : ""}`}
              >
                {role.icon}
                <span>{role.label}</span>
                <span className="role-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Tool Cards */}
      <div className="modern-tools-grid">
        {filteredTools.map((tool) => (
          <AppLink key={tool.id} href={tool.href} className="modern-tool-card">
            <div>
              <div className="card-top-row">
                <div className="card-icon-wrapper">
                  <DynamicIcon name={tool.icon} size={22} fallback={<span>🔧</span>} />
                </div>
                {tool.badge && (
                  <span className={getRoleBadgeClass(tool.badge)}>{tool.badge}</span>
                )}
              </div>

              <div className="card-body">
                <h3>{tool.title}</h3>
                <p>{tool.shortDescription}</p>
              </div>
            </div>

            <div className="card-bottom-row">
              <span className="card-category-label">{tool.categoryLabel}</span>
              <span className="card-open-arrow">
                Open Tool <LuArrowRight size={13} />
              </span>
            </div>
          </AppLink>
        ))}
      </div>
    </section>
  );
}
