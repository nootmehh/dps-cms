"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Button from "@/components/ui/button";
import InputBox from "@/components/ui/inputBox";
import Notification from "@/components/ui/notification";
import MediaCard from "@/components/ui/mediaCard";
import Pagination from "@/components/ui/pagination";
import EmptyState from "@/components/common/emptyState";
import DeleteConfirmationModal from "@/components/modal/deleteConfirmation";
import {
  type MediaItem,
  uploadImage,
  deleteImage,
  processZipFile,
  saveStoredMediaList,
  getStoredMediaList,
  formatBytes,
} from "@/shared/api/media";

export default function KelolaMediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [_loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingBatch, setUploadingBatch] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "default";
  }>({
    isOpen: false,
    message: "",
    type: "default",
  });

  const triggerNotif = (
    message: string,
    type: "success" | "error" | "default" = "default"
  ) => {
    setNotification({
      isOpen: true,
      message,
      type,
    });
  };

  // Load media items on mount
  const loadMedia = useCallback(() => {
    try {
      setLoading(true);
      const items = getStoredMediaList();
      setMediaList(items);
    } catch (err) {
      console.error("Failed to load media list:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUploadClick = () => {
    if (uploading || uploadingBatch) return;
    fileInputRef.current?.click();
  };

  const handleBatchClick = () => {
    if (uploading || uploadingBatch) return;
    batchInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      triggerNotif("Pilih berkas foto/gambar yang valid.", "error");
      return;
    }

    setUploading(true);
    triggerNotif(`Mengunggah & mengonversi "${file.name}" ke WebP...`, "default");

    try {
      const uploadedUrl = await uploadImage(file, "media");
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const webpFileName = `${baseName}.webp`;

      const newMedia: MediaItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        url: uploadedUrl,
        fileName: webpFileName,
        fileSize: formatBytes(file.size),
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const updated = [newMedia, ...mediaList];
      setMediaList(updated);
      saveStoredMediaList(updated);
      triggerNotif(`Berkas "${webpFileName}" berhasil diunggah!`, "success");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal mengunggah berkas.";
      triggerNotif(`Gagal mengunggah: ${errorMsg}`, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBatchFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const zipFile = files[0];
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      triggerNotif("Pilih berkas arsip .ZIP yang valid.", "error");
      return;
    }

    setUploadingBatch(true);
    triggerNotif(`Mengekstrak dan memproses arsip ZIP "${zipFile.name}"...`, "default");

    try {
      const uploadedItems = await processZipFile(zipFile, "media", (progress) => {
        triggerNotif(
          `Memproses ZIP: ${progress.current}/${progress.total} (${progress.currentFileName})...`,
          "default"
        );
      });

      const updated = [...uploadedItems, ...mediaList];
      setMediaList(updated);
      saveStoredMediaList(updated);
      triggerNotif(
        `Berhasil mengunggah ${uploadedItems.length} foto dari "${zipFile.name}"!`,
        "success"
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memproses batch ZIP.";
      triggerNotif(`Gagal memproses ZIP: ${errorMsg}`, "error");
    } finally {
      setUploadingBatch(false);
      if (batchInputRef.current) {
        batchInputRef.current.value = "";
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;

    try {
      await deleteImage(mediaToDelete.id);
      const updated = mediaList.filter((item) => item.id !== mediaToDelete.id);
      setMediaList(updated);
      saveStoredMediaList(updated);
      triggerNotif(`Berkas "${mediaToDelete.fileName}" berhasil dihapus!`, "success");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menghapus media.";
      triggerNotif(`Gagal menghapus: ${errorMsg}`, "error");
    } finally {
      setMediaToDelete(null);
    }
  };

  // Search & Filter Logic
  const filteredMedia = useMemo(() => {
    return mediaList.filter((media) =>
      media.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mediaList, searchQuery]);

  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedia.slice(start, start + itemsPerPage);
  }, [filteredMedia, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-white-90 flex flex-col items-center lg:overflow-hidden">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={batchInputRef}
        accept=".zip,application/zip,application/x-zip-compressed"
        onChange={handleBatchFileChange}
        className="hidden"
      />

      {/* Top Navbar */}
      <Navbar
        brandTitle="Dua Putra Srikandi"
        userName="Username"
        userRole="Super Admin"
        onLogout={() => triggerNotif("Anda telah logout dari sistem", "error")}
      />

      {/* Main Body */}
      <main className="w-full max-w-360 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex-1 flex flex-col md:flex-row justify-center items-start gap-6 lg:overflow-hidden min-h-0 h-full">
        {/* Sidebar Component */}
        <Sidebar activeId="media" className="shrink-0 h-fit" />

        {/* Content Card */}
        <div className="flex-1 h-full p-4 sm:p-6 md:p-8 bg-white rounded-3xl sm:rounded-4xl border border-white-80 shadow-xs flex flex-col justify-start items-start gap-5 w-full overflow-hidden min-h-0">
          {/* Header Row */}
          <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
            <div className="flex-1 flex flex-col justify-start items-start gap-1">
              <h1 className="self-stretch justify-start text-g1 text-2xl md:text-3xl font-bold font-sans">
                Kelola Media
              </h1>
              <p className="text-dark text-sm font-normal font-sans">
                Kelola dan unggah aset media di halaman ini
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full sm:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                type="button"
                text={uploading ? "Mengunggah..." : "Unggah Gambar"}
                variant="fill"
                rightIcon="Add"
                disabled={uploading || uploadingBatch}
                onClick={handleUploadClick}
                className="w-full sm:w-auto shrink-0 cursor-pointer"
              />
              <Button
                type="button"
                text={uploadingBatch ? "Memproses ZIP..." : "Unggah Batch (ZIP)"}
                variant="stroke"
                leftIcon="Attachment"
                disabled={uploading || uploadingBatch}
                onClick={handleBatchClick}
                className="w-full sm:w-auto shrink-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Top Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Filter & Search Row */}
          <div className="self-stretch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full shrink-0">
            <div className="w-full sm:max-w-xs">
              <InputBox
                placeholder="Cari nama berkas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon="Search"
              />
            </div>
          </div>

          {/* Media Grid Container */}
          <div className="self-stretch flex-1 bg-white flex flex-col justify-start items-start gap-2 overflow-x-hidden overflow-y-auto min-h-0 w-full pr-1">
            {filteredMedia.length === 0 ? (
              <EmptyState
                text={
                  searchQuery
                    ? `Tidak ada berkas media yang sesuai dengan pencarian "${searchQuery}".`
                    : "Belum ada berkas media yang tersedia saat ini. Unggah gambar atau berkas ZIP untuk memulai."
                }
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5 w-full p-1">
                {paginatedMedia.map((media) => (
                  <MediaCard
                    key={media.id}
                    imageUrl={media.url}
                    fileName={media.fileName}
                    fileSize={media.fileSize}
                    onDelete={() => setMediaToDelete(media)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Divider */}
          <div className="w-full h-px bg-g1/10 shrink-0" aria-hidden="true" />

          {/* Pagination Component */}
          <div className="self-stretch shrink-0">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredMedia.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="Berkas"
            />
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!mediaToDelete}
        title="Hapus Aset Media"
        message={
          mediaToDelete
            ? `Apakah Anda yakin ingin menghapus berkas "${mediaToDelete.fileName}"? Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setMediaToDelete(null)}
      />

      {/* Toast Notification */}
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
