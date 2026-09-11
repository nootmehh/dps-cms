"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import LordIcon from "@/components/common/lordIcon";

export interface ConnectGaModalProps {
  isOpen: boolean;
  isConnected: boolean;
  measurementId?: string | null;
  onSave: (connected: boolean, id: string | null) => Promise<void>;
  onClose: () => void;
}

export default function ConnectGaModal({
  isOpen,
  isConnected,
  measurementId,
  onSave,
  onClose,
}: ConnectGaModalProps) {
  const [gaId, setGaId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setGaId(measurementId || "");
  }, [measurementId, isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gaId.trim()) return;
    setSubmitting(true);
    try {
      await onSave(true, gaId.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    setSubmitting(true);
    try {
      await onSave(false, null);
      onClose();
    } catch (err) {
      console.error(err);
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
            Hubungkan Google Analytics 4
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

        {/* Form Body */}
        <form onSubmit={handleConnect} className="self-stretch flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <InputBox
              label="Measurement ID (Google Analytics 4) *"
              placeholder="G-XXXXXXXXXX"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              containerClassName="w-full max-w-none"
            />
            <p className="text-xs text-dark/60 font-sans">
              Masukkan ID Pengukuran dari properti Google Analytics 4 Anda (dimulai dengan G-).
            </p>
          </div>

          {/* Divider */}
          <div className="self-stretch h-px bg-slate-200" />

          {/* Action Buttons */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={submitting}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-center"
              >
                Putuskan Hubungan
              </button>
            ) : (
              <div />
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                type="button"
                text="Batal"
                variant="ghost-green"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto cursor-pointer"
              />
              <Button
                type="submit"
                text={submitting ? "Menyimpan..." : isConnected ? "Simpan Perubahan" : "Hubungkan"}
                variant="fill"
                disabled={submitting || !gaId.trim()}
                className="w-full sm:w-auto cursor-pointer"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
