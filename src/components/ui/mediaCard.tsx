import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import LordIcon from "../common/lordIcon";

export interface MediaCardProps {
    imageUrl: string;
    fileName: string;
    fileSize?: string;
    onDelete?: () => void;
    onClick?: () => void;
    layout?: "grid" | "list";
    className?: string;
}

export default function MediaCard({
    imageUrl,
    fileName,
    fileSize: _fileSize,
    onDelete,
    onClick,
    layout = "grid",
    className = "",
}: MediaCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close preview on ESC key
    useEffect(() => {
        if (!isPreviewOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsPreviewOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPreviewOpen]);

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else {
            setIsPreviewOpen(true);
        }
    };

    const renderLightbox = () => {
        if (!isPreviewOpen || !mounted) return null;
        return createPortal(
            <div
                onClick={() => setIsPreviewOpen(false)}
                className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 md:p-10 cursor-zoom-out animate-in fade-in duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-4xl max-h-[88vh] flex flex-col items-center justify-center cursor-default"
                >
                    {/* Full Image with NO outline / border */}
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={fileName}
                            className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                        />
                    ) : null}

                    {/* Subtle caption */}
                    <div className="mt-3 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-xs sm:text-sm font-medium truncate max-w-md text-center">
                        {fileName}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    if (layout === "list") {
        return (
            <>
                <div
                    onClick={handleCardClick}
                    className={`w-full p-3.5 bg-white rounded-2xl border border-white-80 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-g1 hover:outline hover:outline-2 hover:outline-g1 hover:ring-2 hover:ring-g1/20 transition-all flex items-center justify-between gap-4 group cursor-pointer ${className}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                        <div className="size-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                            {!imageError && imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={fileName}
                                    onError={() => setImageError(true)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <LordIcon name="Image 2" size={26} primaryColor="#94a3b8" />
                            )}
                        </div>
                        <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                            <span
                                className="text-sm font-semibold text-slate-800 truncate font-sans"
                                title={fileName}
                            >
                                {fileName}
                            </span>
                        </div>
                    </div>

                    {onDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="size-9 bg-red-state hover:bg-red-600 border-2 border-white text-white rounded-xl flex justify-center items-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                            title="Hapus Media"
                        >
                            <LordIcon name="Delete" size={18} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
                        </button>
                    )}
                </div>

                {renderLightbox()}
            </>
        );
    }

    // Grid layout (default)
    return (
        <>
            <div
                onClick={handleCardClick}
                className={`w-full p-3.5 sm:p-4 bg-white rounded-3xl border border-white-80 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-g1 hover:outline hover:outline-2 hover:outline-g1 hover:ring-2 hover:ring-g1/20 transition-all flex flex-col gap-3 group relative overflow-hidden cursor-pointer ${className}`}
            >
                {/* Image Preview Box */}
                <div className="w-full aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/60 relative flex items-center justify-center group-hover:opacity-95 transition-opacity">
                    {!imageError && imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={fileName}
                            onError={() => setImageError(true)}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                    ) : (
                        <LordIcon name="Image 2" size={40} primaryColor="#cbd5e1" />
                    )}

                    {/* Floating Delete button overlay on top-right only */}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-2.5 right-2.5 size-9 sm:size-10 bg-red-state hover:bg-red-600 border-2 border-white text-white rounded-full flex justify-center items-center shadow-lg opacity-100 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer z-20"
                            title="Hapus Media"
                        >
                            <LordIcon name="Delete" size={18} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
                        </button>
                    )}
                </div>

                {/* Info Footer - File name only */}
                <div className="flex items-center justify-between gap-2 min-w-0 px-0.5">
                    <span
                        className="text-sm font-semibold text-slate-800 truncate font-sans"
                        title={fileName}
                    >
                        {fileName}
                    </span>
                </div>
            </div>

            {renderLightbox()}
        </>
    );
}