"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Button from "../ui/button";

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: string | ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface SidebarProps {
  title?: string;
  items?: SidebarMenuItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export const DEFAULT_SIDEBAR_ITEMS: SidebarMenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "Dashboard", href: "/dashboard" },
  { id: "users", label: "Kelola Pengguna", icon: "User", href: "/kelola-pengguna" },
  { id: "seo", label: "Kelola SEO", icon: "Global", href: "/kelola-seo" },
  { id: "content", label: "Kelola Konten", icon: "Document", href: "/kelola-konten" },
  { id: "services", label: "Kelola Layanan", icon: "Setting", href: "/kelola-layanan" },
  { id: "products", label: "Kelola Produk", icon: "Box", href: "/kelola-produk" },
  { id: "articles", label: "Kelola Artikel", icon: "Paper", href: "/kelola-artikel" },
  { id: "media", label: "Kelola Media", icon: "Image 2", href: "/kelola-media" },
];

export default function Sidebar({
  title = "MENU BAR",
  items = DEFAULT_SIDEBAR_ITEMS,
  activeId: controlledActiveId,
  onSelect,
  className = "",
}: SidebarProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>("services");
  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  const handleItemClick = (item: SidebarMenuItem) => {
    if (controlledActiveId === undefined) {
      setInternalActiveId(item.id);
    }
    if (onSelect) {
      onSelect(item.id);
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={`hidden md:inline-flex md:w-18 lg:w-64 md:p-3 lg:p-6 bg-white rounded-3xl lg:rounded-4xl border border-white-80 shadow-xs flex-col justify-start items-center gap-3 lg:gap-4 shrink-0 transition-all ${className}`}
    >
      {/* Menu Bar Title */}
      <div className="self-stretch text-center lg:text-left justify-start text-dark/40 text-xs lg:text-sm font-normal font-sans tracking-wider uppercase select-none">
        <span className="hidden lg:inline">{title}</span>
        <span className="lg:hidden text-[10px] font-bold">MENU</span>
      </div>

      {/* Navigation Buttons List */}
      <nav className="self-stretch flex flex-col justify-start items-center lg:items-start gap-2 w-full">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const btn = (
            <Button
              text={item.label}
              leftIcon={item.icon}
              variant={isActive ? "fill" : "ghost-green"}
              onClick={() => handleItemClick(item)}
              title={item.label}
              className="w-full justify-center lg:justify-start text-left md:px-0 lg:px-4 cursor-pointer [&>span:not(.pill-segment)]:hidden lg:[&>span:not(.pill-segment)]:inline min-h-[44px]"
            />
          );

          if (item.href && !onSelect) {
            return (
              <Link key={item.id} href={item.href} className="w-full block" title={item.label}>
                {btn}
              </Link>
            );
          }

          return <div key={item.id} className="w-full">{btn}</div>;
        })}
      </nav>
    </aside>
  );
}

