"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../ui/button";
import LordIcon from "../common/lordIcon";
import { getAuthSession, clearAuthSession } from "@/services/authApi";

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
  const [displayName, setDisplayName] = useState(userName);
  const [displayRole, setDisplayRole] = useState(userRole);

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
    <header
      className={`w-full px-6 md:px-12 py-4 bg-white border-b border-white-80 inline-flex justify-between items-center gap-4 select-none ${className}`}
    >
      {/* Left Section: Brand Logo (from Compro) */}
      <Link
        href="/dashboard"
        className="flex items-center cursor-pointer select-none shrink-0"
      >
        {/* Full Logo on >= 420px */}
        <img
          className="h-9 w-auto object-contain transition-all aspect-[801/96] hidden min-[420px]:block"
          src={logoSrc || "/dps-logo-default.png"}
          alt={brandTitle || "DPS Logo"}
        />
        {/* Icon Logo on < 420px */}
        <img
          className="h-9 w-auto object-contain transition-all block min-[420px]:hidden"
          src="/dps-logo-icon.png"
          alt={brandTitle || "DPS Logo Icon"}
        />
      </Link>

      {/* Right Section: User Profile & Logout */}
      <div className="flex justify-start items-center gap-3 sm:gap-4">
        {/* User Info & Avatar */}
        <div className="flex justify-start items-center gap-3 sm:gap-4">
          <div className="inline-flex flex-col justify-start items-end">
            <div className="self-stretch text-right justify-start text-g1 text-sm md:text-base font-bold font-sans">
              {displayName}
            </div>
            <div className="text-right justify-start text-dark/75 text-xs md:text-sm font-normal font-sans">
              {displayRole}
            </div>
          </div>

          {/* Avatar Icon Pill with LordIcon */}
          <div className="size-11 md:size-12 p-2 bg-white-90 rounded-full flex justify-center items-center shrink-0">
            <LordIcon name="User" size={24} primaryColor="#0A9863" />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-g1/15 mx-1 hidden sm:block" aria-hidden="true" />

        {/* Logout Button (Using Unique Red Button Component with LordIcon) */}
        <Button
          type="button"
          text={logoutText}
          variant="unique-red"
          rightIcon="Logout"
          onClick={handleLogout}
        />
      </div>
    </header>
  );
}
