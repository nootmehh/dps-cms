"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 bg-white rounded-4xl outline -outline-offset-1 outline-slate-200 flex flex-col justify-start items-start gap-6 shadow-2xl animate-scale-in"
      >
        {/* Title Bar */}
        <div className="self-stretch flex justify-between items-start">
          <div className="flex-1 flex flex-col justify-start items-start gap-1">
            <div className="text-dark/50 text-xs font-semibold font-sans tracking-wider uppercase">
              INTEGRASI GOOGLE ANALYTICS
            </div>
            <div className="text-dark text-xl font-bold font-sans">
              Hubungkan Google Analytics 4
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="self-stretch h-px bg-slate-200" />

        {/* Form */}
        <form onSubmit={handleConnect} className="self-stretch flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark/70 font-sans">
              Measurement ID (Google Analytics 4)
            </label>
            <InputBox
              placeholder="Contoh: G-XXXXXXXXXX"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
            />
            <p className="text-xs text-dark/50 font-sans">
              Masukkan ID Pengukuran dari properti Google Analytics 4 Anda.
            </p>
          </div>

          {/* Divider */}
          <div className="self-stretch h-px bg-slate-200 mt-2" />

          {/* Action Buttons */}
          <div className="self-stretch flex justify-between items-center pt-2">
            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                Putuskan Hubungan
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                text="Batal"
                variant="ghost-green"
                onClick={onClose}
                disabled={submitting}
              />
              <Button
                type="submit"
                text={submitting ? "Menyimpan..." : isConnected ? "Simpan Perubahan" : "Hubungkan"}
                variant="fill"
                disabled={submitting || !gaId.trim()}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
