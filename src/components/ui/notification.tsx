import { useEffect, useState } from "react";
import LordIcon from "../common/lordIcon";

export type NotificationType = "error" | "default" | "success" | "info";

export interface NotificationProps {
    isOpen: boolean;
    message: string;
    type?: NotificationType;
    onClose: () => void;
    duration?: number; // duration in ms, defaults to 4000. Set to 0 to disable auto-close.
    className?: string;
}

const variantConfig: Record<
    NotificationType,
    {
        container: string;
        iconName: string;
        iconColor: string;
        textColor: string;
    }
> = {
    success: {
        container: "bg-green-50/95 border-green-200/60 shadow-green-100/40 text-green-800",
        iconName: "check-circle-tick",
        iconColor: "#0A9863",
        textColor: "text-green-800",
    },
    error: {
        container: "bg-red-50/95 border-red-200/60 shadow-red-100/40 text-red-800",
        iconName: "check-cross",
        iconColor: "#F94C4C",
        textColor: "text-red-800",
    },
    default: {
        container: "bg-blue-50/95 border-blue-200/60 shadow-blue-100/40 text-blue-800",
        iconName: "info-circle",
        iconColor: "#4C94F9",
        textColor: "text-blue-800",
    },
    info: {
        container: "bg-blue-50/95 border-blue-200/60 shadow-blue-100/40 text-blue-800",
        iconName: "info-circle",
        iconColor: "#4C94F9",
        textColor: "text-blue-800",
    },
};

export default function Notification({
    isOpen,
    message,
    type = "default",
    onClose,
    duration = 4000,
    className = "",
}: NotificationProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [animateState, setAnimateState] = useState<"enter" | "exit">("exit");
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const frame = requestAnimationFrame(() => {
                setAnimateState("enter");
            });
            return () => cancelAnimationFrame(frame);
        } else {
            setAnimateState("exit");
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && duration > 0 && !isHovered) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, isHovered, onClose]);

    if (!shouldRender) return null;

    const currentVariant = variantConfig[type] || variantConfig.default;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-hover-target="true"
            className={`group notification-card fixed top-24 right-6 z-50 max-w-sm w-full md:max-w-md rounded-2xl border px-4 py-3.5 flex items-start justify-between gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform font-sans ${animateState === "enter"
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 translate-x-8 scale-95"
                } ${currentVariant.container} ${className}`}
        >
            {/* Content wrapper */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* State Icon with hover animation */}
                <div className="shrink-0 mt-0.5 group-hover:scale-115 transition-transform duration-300 ease-out">
                    <LordIcon
                        name={currentVariant.iconName}
                        size={22}
                        primaryColor={currentVariant.iconColor}
                        secondaryColor={currentVariant.iconColor}
                        trigger="hover"
                        target=".notification-card"
                    />
                </div>

                {/* Text-sm Message */}
                <div className={`text-sm font-medium leading-relaxed wrap-break-word ${currentVariant.textColor}`}>
                    {message}
                </div>
            </div>

            {/* Close Button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="size-7 rounded-full text-black hover:text-black/70 hover:bg-black/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Tutup"
            >
                <LordIcon name="Cross" size={16} primaryColor="#666666" />
            </button>
        </div>
    );
}