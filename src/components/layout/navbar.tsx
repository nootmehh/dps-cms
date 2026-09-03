import { type ReactNode } from "react";
import Button from "../ui/button";
import LordIcon from "../common/lordIcon";

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
  return (
    <header
      className={`w-full px-6 md:px-12 py-4 bg-white border-b border-gray-200 inline-flex justify-between items-center gap-4 ${className}`}
    >
      {/* Left Section: Brand Logo & Title */}
      <div className="flex justify-start items-center gap-3 shrink-0">
        {logoSrc ? (
          <img
            className="w-16 h-8 object-contain"
            src={logoSrc}
            alt={brandTitle}
          />
        ) : (
          <div className="w-10 h-8 bg-g1/15 text-g1 rounded-lg flex items-center justify-center font-bold text-xs">
            DPS
          </div>
        )}
        <div className="justify-start text-dark text-xl md:text-2xl font-bold font-serif tracking-tight">
          {brandTitle}
        </div>
      </div>

      {/* Right Section: User Profile & Logout */}
      <div className="flex justify-start items-center gap-3 sm:gap-4">
        {/* User Info & Avatar */}
        <div className="flex justify-start items-center gap-3 sm:gap-4">
          <div className="inline-flex flex-col justify-start items-end">
            <div className="self-stretch text-right justify-start text-g1 text-sm md:text-base font-bold font-sans">
              {userName}
            </div>
            <div className="text-right justify-start text-dark/75 text-xs md:text-sm font-normal font-sans">
              {userRole}
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
          onClick={onLogout}
        />
      </div>
    </header>
  );
}
