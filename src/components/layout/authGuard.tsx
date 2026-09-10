"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { checkAuthSession, clearAuthSession, type AuthSession } from "@/services/authApi";

export interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [_session, setSession] = useState<AuthSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = () => {
      const { status, session: activeSession } = checkAuthSession();
      if (status === "expired") {
        clearAuthSession();
        router.replace("/?expired=1");
        return;
      }
      if (status === "none" || !activeSession) {
        clearAuthSession();
        router.replace("/?login_required=1");
        return;
      }
      setSession(activeSession);
      setChecked(true);
    };

    verifyAuth();

    // Periodic check every 15 seconds to ensure 30-minute security timeout is strictly enforced
    const interval = setInterval(verifyAuth, 15000);
    return () => clearInterval(interval);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen w-full bg-brand-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-g1">
          <div className="w-10 h-10 border-4 border-g1 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-dark/60 font-sans">
            Memverifikasi sesi login...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
