"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Button from "../ui/button";
import LordIcon from "../common/lordIcon";
import { getAuthSession, clearAuthSession } from "@/services/authApi";
import { DEFAULT_SIDEBAR_ITEMS, type SidebarMenuItem } from "./sidebar";

export interface NavbarProps {
  brandTitle?: string;
  logoSrc?: string;
  userName?: string;
  userRole?: string;
  avatarIcon?: string | ReactNode;
  onLogout?: () => void;
  logoutText?: string;
  className?: string;
}

export default function Navbar({
  brandTitle = "Dua Putra Srikandi",
  logoSrc,
  userName = "Username",
  userRole = "Super Admin",
  onLogout,
  logoutText = "Logout Sistem",
  className = "",
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState(userName);
  const [displayRole, setDisplayRole] = useState(userRole);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      if (userName === "Username") {
        setDisplayName(session.user.username || "Super Admin");
      }
      if (userRole === "Super Admin" && session.user.role) {
        setDisplayRole(session.user.role);
      }
    }
  }, [userName, userRole]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (onLogout) {
      try {
        onLogout();
      } catch (err) {
        console.error("onLogout error:", err);
      }
    }
    clearAuthSession();
    router.replace("/?logout=1");
  };

  return (
    <>
      <header
        className={`w-full px-4 sm:px-6 md:px-12 py-3 sm:py-4 bg-white border-b border-white-80 inline-flex justify-between items-center gap-3 sm:gap-4 select-none ${className}`}
      >
        {/* Left Section: Mobile Hamburger Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Hamburger Menu Button (< lg only) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Buka Menu Navigasi"
            className="lg:hidden p-2 rounded-xl text-dark/80 hover:text-g1 hover:bg-white-90 transition-colors cursor-pointer flex items-center justify-center min-h-[44px] min-w-[44px]"
          >
            <LordIcon name="Menu" size={24} primaryColor="#0A9863" />
          </button>

          {/* Brand Logo */}
          <Link
            href="/dashboard"
            className="flex items-center cursor-pointer select-none shrink-0"
          >
            {/* Full Logo on >= 420px */}
            <img
              className="h-8 sm:h-9 w-auto object-contain transition-all aspect-[801/96] hidden min-[420px]:block"
              src={logoSrc || "/dps-logo-default.png"}
              alt={brandTitle || "DPS Logo"}
            />
            {/* Icon Logo on < 420px */}
            <img
              className="h-8 sm:h-9 w-auto object-contain transition-all block min-[420px]:hidden"
              src="/dps-logo-icon.png"
              alt={brandTitle || "DPS Logo Icon"}
            />
          </Link>
        </div>

        {/* Right Section: User Profile & Logout */}
        <div className="flex justify-start items-center gap-2 sm:gap-3 md:gap-4">
          {/* User Info & Avatar */}
          <div className="flex justify-start items-center gap-2 sm:gap-3 md:gap-4">
            <div className="hidden sm:inline-flex flex-col justify-start items-end">
              <div className="self-stretch text-right justify-start text-g1 text-sm md:text-base font-bold font-sans truncate max-w-[140px] md:max-w-none">
                {displayName}
              </div>
              <div className="text-right justify-start text-dark/75 text-xs md:text-sm font-normal font-sans">
                {displayRole}
              </div>
            </div>

            {/* Avatar Icon Pill with LordIcon */}
            <div className="size-10 sm:size-11 md:size-12 p-2 bg-white-90 rounded-full flex justify-center items-center shrink-0">
              <LordIcon name="User" size={22} primaryColor="#0A9863" />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-g1/15 mx-1 hidden sm:block" aria-hidden="true" />

          {/* Logout Button: Full pill on sm+, compact on mobile */}
          <div className="hidden sm:block">
            <Button
              type="button"
              text={logoutText}
              variant="unique-red"
              rightIcon="Logout"
              onClick={handleLogout}
            />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={logoutText}
            aria-label={logoutText}
            className="sm:hidden size-10 rounded-full bg-red-state text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <LordIcon name="Logout" size={18} primaryColor="#FFFFFF" />
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Navigation Drawer (< lg) */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Mobile"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-dark/50 backdrop-blur-xs transition-opacity animate-fade-in"
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative w-[300px] max-w-[85vw] h-full bg-white shadow-2xl z-10 flex flex-col justify-between overflow-y-auto p-5 animate-scale-in">
            {/* Drawer Header */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white-80">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img
                    className="h-8 w-auto object-contain"
                    src="/dps-logo-icon.png"
                    alt="DPS Icon"
                  />
                  <span className="text-g1 text-lg font-bold font-sans">
                    DPS CMS
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="size-9 rounded-full text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
                  title="Tutup Menu"
                >
                  <LordIcon name="Cross" size={20} primaryColor="#666666" />
                </button>
              </div>

              {/* User Profile Card inside Drawer */}
              <div className="p-3 bg-white-90 rounded-2xl flex items-center gap-3">
                <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                  <LordIcon name="User" size={20} primaryColor="#0A9863" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-g1 font-sans truncate">
                    {displayName}
                  </span>
                  <span className="text-xs text-dark/70 font-sans truncate">
                    {displayRole}
                  </span>
                </div>
              </div>

              {/* Navigation Menu List */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-dark/40 uppercase tracking-wider px-2 py-1">
                  Menu Utama
                </span>
                <nav className="flex flex-col gap-1 w-full">
                  {DEFAULT_SIDEBAR_ITEMS.map((item: SidebarMenuItem) => {
                    const isActive = pathname?.startsWith(item.href || "");
                    return (
                      <Link
                        key={item.id}
                        href={item.href || "#"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full block"
                      >
                        <Button
                          text={item.label}
                          leftIcon={item.icon}
                          variant={isActive ? "fill" : "ghost-green"}
                          className="w-full justify-start text-left px-4 min-h-[44px] cursor-pointer"
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Drawer Footer: Logout */}
            <div className="pt-5 border-t border-white-80 mt-6">
              <Button
                type="button"
                text="Logout Sistem"
                variant="unique-red"
                rightIcon="Logout"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

