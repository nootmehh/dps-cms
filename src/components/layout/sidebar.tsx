import { useState, type ReactNode } from "react";
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
  { id: "dashboard", label: "Dashboard", icon: "Dashboard", href: "/" },
  { id: "users", label: "Kelola Pengguna", icon: "User", href: "/kelola-pengguna" },
  { id: "seo", label: "Kelola SEO", icon: "Global", href: "/seo" },
  { id: "content", label: "Kelola Konten", icon: "Document", href: "/content" },
  { id: "services", label: "Kelola Layanan", icon: "Setting", href: "/services" },
  { id: "products", label: "Kelola Produk", icon: "Box", href: "/products" },
  { id: "articles", label: "Kelola Artikel", icon: "Paper", href: "/articles" },
  { id: "media", label: "Kelola Media", icon: "Image 2", href: "/media" },
];

export default function Sidebar({
  title = "MENU BAR",
  items = DEFAULT_SIDEBAR_ITEMS,
  activeId: controlledActiveId,
  onSelect,
  className = "",
}: SidebarProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>("users");
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
      className={`w-64 p-6 bg-white rounded-[32px] border border-white-80 shadow-xs inline-flex flex-col justify-start items-center gap-4 ${className}`}
    >
      {/* Menu Bar Title */}
      <div className="self-stretch justify-start text-dark/60 text-sm font-normal font-sans tracking-wider uppercase select-none">
        {title}
      </div>

      {/* Navigation Buttons List */}
      <nav className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <Button
              key={item.id}
              text={item.label}
              leftIcon={item.icon}
              variant={isActive ? "fill" : "ghost-green"}
              onClick={() => handleItemClick(item)}
              className="w-full justify-start! text-left pl-4 cursor-pointer"
            />
          );
        })}
      </nav>
    </aside>
  );
}
