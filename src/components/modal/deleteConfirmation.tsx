import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import LordIcon from "@/components/common/lordIcon";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title?: string;
    message?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Remove User",
    message = "Are you sure you want to remove this user? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            console.error("Confirmation error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-125 p-5 sm:p-6 bg-white rounded-t-[32px] sm:rounded-4xl outline -outline-offset-1 outline-slate-200 flex flex-col justify-start items-start gap-5 sm:gap-6 shadow-2xl animate-scale-in"
            >
                {/* Title Bar */}
                <div className="self-stretch inline-flex justify-between items-center">
                    <div className="flex-1 text-dark text-xl font-bold font-sans">
                        {title}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="Tutup"
                    >
                        <LordIcon name="Cross" size={20} primaryColor="#666666" />
                    </button>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-200" />

                {/* Message Body */}
                <div className="self-stretch text-slate-600 text-sm font-normal font-sans leading-relaxed">
                    {message}
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-200" />

                {/* Action Buttons */}
                <div className="self-stretch flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3">
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        text="Batal"
                        variant="ghost-green"
                        className="w-full sm:w-auto cursor-pointer"
                    />
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={submitting}
                        text={submitting ? "Menghapus..." : "Ya, Hapus"}
                        variant="fill"
                        className="w-full sm:w-auto cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}