import { useState, useRef, useEffect, ReactNode } from "react";
import Button from "./button";
import MediaSelectModal, { MediaSelectModalItem } from "@/components/modal/mediaSelectModal";
import Notification, { NotificationType } from "./notification";
import LordIcon from "../common/lordIcon";
import InfoButton from "./infoButton";

export interface UploadFileProps {
    label?: ReactNode;
    info?: string;
    labelInfo?: ReactNode;
    onFilesSelected?: (files: File[]) => void;
    multiple?: boolean;
    accept?: string;
    maxFiles?: number;
    initialFiles?: File[];
    existingImageUrls?: string[];
    onRemoveExistingImage?: (url: string) => void;
    defaultImageUrl?: string;
    defaultImageLabel?: string;
    onRemoveDefaultImage?: () => void;
    enableMediaLibrary?: boolean;
    mediaLibraryCategory?: string;
    descriptionPrefix?: string;
    descriptionValue?: string;
    fileTypesHint?: string;
    previewLayout?: "compact" | "large";
    onAddExistingUrl?: (url: string) => void;
    onSelectMediaUrl?: (url: string) => void;
    onError?: (message: string) => void;
    className?: string;
}

interface DisplayImageItem {
    id: string;
    type: "existing" | "file";
    url: string;
    name: string;
    file?: File;
    fileIndex?: number;
    existingUrl?: string;
}

export default function UploadFile({
    label = "Unggah Berkas",
    info,
    labelInfo,
    onFilesSelected,
    descriptionPrefix,
    descriptionValue,
    fileTypesHint = "(PNG, JPG, WebP)",
    multiple = false,
    accept = "image/*",
    maxFiles = 4,
    initialFiles = [],
    existingImageUrls = [],
    onRemoveExistingImage,
    defaultImageUrl,
    defaultImageLabel = "Saved Image",
    onRemoveDefaultImage,
    enableMediaLibrary = true,
    previewLayout = "compact",
    onAddExistingUrl,
    onSelectMediaUrl,
    onError,
    className = "",
}: UploadFileProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isReplaceHovered, setIsReplaceHovered] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

    const [notification, setNotification] = useState<{
        isOpen: boolean;
        message: string;
        type: NotificationType;
    }>({
        isOpen: false,
        message: "",
        type: "error",
    });

    const showNotification = (message: string, type: NotificationType = "error") => {
        setNotification({
            isOpen: true,
            message,
            type,
        });
        onError?.(message);
    };

    const inputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    // Sync if initialFiles changes
    useEffect(() => {
        if (initialFiles && initialFiles.length > 0) {
            setSelectedFiles(initialFiles);
        }
    }, [initialFiles]);

    // Handle previews for newly selected local files
    useEffect(() => {
        const newPreviews = selectedFiles.map((file) => {
            if (file.type.startsWith("image/")) {
                return URL.createObjectURL(file);
            }
            return "";
        });
        setPreviews(newPreviews);

        return () => {
            newPreviews.forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [selectedFiles]);

    const getFileNameFromUrl = (url: string) => {
        try {
            const parts = url.split("/");
            return parts[parts.length - 1].split("?")[0] || "image.png";
        } catch {
            return "image.png";
        }
    };

    // Build unified display images list
    const allImages: DisplayImageItem[] = [
        ...existingImageUrls.map((url, idx) => ({
            id: `existing-${idx}-${url}`,
            type: "existing" as const,
            url,
            name: getFileNameFromUrl(url),
            existingUrl: url,
        })),
        ...(defaultImageUrl && !existingImageUrls.includes(defaultImageUrl)
            ? [{
                id: `default-${defaultImageUrl}`,
                type: "existing" as const,
                url: defaultImageUrl,
                name: defaultImageLabel || getFileNameFromUrl(defaultImageUrl),
                existingUrl: defaultImageUrl,
            }]
            : []),
        ...selectedFiles.map((f, idx) => ({
            id: `file-${idx}-${f.name}-${f.lastModified}`,
            type: "file" as const,
            url: previews[idx] || "",
            name: f.name,
            file: f,
            fileIndex: idx,
        })),
    ];

    const safeActiveIndex = allImages.length > 0
        ? Math.min(Math.max(0, activeImageIndex), allImages.length - 1)
        : 0;
    const currentActive = allImages[safeActiveIndex] || null;

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        let newFiles = Array.from(files);

        if (!multiple) {
            newFiles = [newFiles[0]];
            setSelectedFiles(newFiles);
            onFilesSelected?.(newFiles);
            setActiveImageIndex(0);
            return;
        }

        const currentTotal = allImages.length;
        const totalAllowed = maxFiles - currentTotal;

        if (totalAllowed <= 0) {
            showNotification(
                `Maksimal ${maxFiles} gambar telah tercapai. Tidak dapat mengunggah lebih dari ${maxFiles} gambar.`,
                "error"
            );
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        if (newFiles.length > totalAllowed) {
            showNotification(
                `Maksimal gambar yang dapat diunggah adalah ${maxFiles} gambar. Hanya ${totalAllowed} gambar yang berhasil ditambahkan.`,
                "error"
            );
        }

        const filesToAdd = newFiles.slice(0, totalAllowed);
        const updated = [...selectedFiles, ...filesToAdd];
        setSelectedFiles(updated);
        onFilesSelected?.(updated);
        // Focus the newly added image
        setActiveImageIndex(allImages.length);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleRemoveImage = (img: DisplayImageItem, index: number) => {
        if (img.type === "existing") {
            if (img.existingUrl) {
                onRemoveExistingImage?.(img.existingUrl);
            }
            if (img.url === defaultImageUrl) {
                onRemoveDefaultImage?.();
            }
        } else if (img.type === "file" && typeof img.fileIndex === "number") {
            const updated = selectedFiles.filter((_, i) => i !== img.fileIndex);
            setSelectedFiles(updated);
            onFilesSelected?.(updated);
        }

        if (safeActiveIndex >= index && safeActiveIndex > 0) {
            setActiveImageIndex(safeActiveIndex - 1);
        }
    };

    const triggerBrowse = () => {
        if (multiple && allImages.length >= maxFiles) {
            showNotification(
                `Maksimal ${maxFiles} gambar telah tercapai. Hapus salah satu gambar terlebih dahulu jika ingin mengunggah yang lain.`,
                "error"
            );
            return;
        }
        inputRef.current?.click();
    };

    const handleReplaceBrowse = () => {
        replaceInputRef.current?.click();
    };

    const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentActive) {
            const newFile = e.target.files[0];
            if (currentActive.type === "existing") {
                if (currentActive.existingUrl) {
                    onRemoveExistingImage?.(currentActive.existingUrl);
                }
                if (currentActive.url === defaultImageUrl) {
                    onRemoveDefaultImage?.();
                }
                const updated = [...selectedFiles, newFile];
                setSelectedFiles(updated);
                onFilesSelected?.(updated);
            } else if (currentActive.type === "file" && typeof currentActive.fileIndex === "number") {
                const updated = [...selectedFiles];
                updated[currentActive.fileIndex] = newFile;
                setSelectedFiles(updated);
                onFilesSelected?.(updated);
            }
            if (replaceInputRef.current) {
                replaceInputRef.current.value = "";
            }
        }
    };

    const handleMediaLibrarySelect = async (item: MediaSelectModalItem) => {
        try {
            const currentTotal = allImages.length;
            if (multiple && currentTotal >= maxFiles) {
                showNotification(
                    `Maksimal ${maxFiles} gambar telah tercapai. Hapus salah satu gambar terlebih dahulu jika ingin menambahkan dari Media Library.`,
                    "error"
                );
                return;
            }

            if (multiple && onAddExistingUrl) {
                onAddExistingUrl(item.url);
                setActiveImageIndex(allImages.length);
                return;
            }

            if (!multiple && onSelectMediaUrl) {
                onSelectMediaUrl(item.url);
                setActiveImageIndex(0);
                return;
            }

            const response = await fetch(item.url);
            const blob = await response.blob();
            const file = new File([blob], item.fileName, { type: blob.type || "image/jpeg" });

            if (!multiple) {
                setSelectedFiles([file]);
                onFilesSelected?.([file]);
                setActiveImageIndex(0);
            } else {
                if (currentTotal < maxFiles) {
                    const updated = [...selectedFiles, file];
                    setSelectedFiles(updated);
                    onFilesSelected?.(updated);
                    setActiveImageIndex(allImages.length);
                }
            }
        } catch (error) {
            console.error("Error creating File from media selection:", error);
            showNotification("Gagal memuat gambar dari Media Library.", "error");
        }
    };

    const hasActiveImage = allImages.length > 0;
    const showDropzone = previewLayout === "large"
        ? allImages.length === 0
        : multiple
        ? allImages.length < maxFiles
        : allImages.length === 0;

    const renderLabel = () => {
        if (!label) return null;

        let labelContent: ReactNode = label;
        const labelText = typeof label === "string" ? label : "Informasi";

        if (typeof label === "string") {
            if (label.includes("*")) {
                const parts = label.split("*");
                labelContent = (
                    <>
                        {parts[0]}
                        <span className="text-red-state">*</span>
                        {parts.slice(1).join("*")}
                    </>
                );
            }
        }

        if (info || labelInfo) {
            return (
                <div className="inline-flex items-center gap-1.5">
                    <label className="text-dark text-sm font-semibold font-sans">
                        {labelContent}
                    </label>
                    {info ? (
                        <InfoButton info={info} title={labelText.replace(/\*/g, "").trim()} />
                    ) : (
                        labelInfo
                    )}
                </div>
            );
        }

        return <label className="text-dark text-sm font-semibold font-sans">{labelContent}</label>;
    };

    const renderEmphasizedHint = (text: string) => {
        const trimmed = text.trim();
        if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
            const inner = trimmed.slice(1, -1);
            return (
                <>
                    (<span className="font-semibold text-dark/80">{inner}</span>)
                </>
            );
        }
        return <span className="font-semibold text-dark/80">{trimmed}</span>;
    };

    return (
        <div className={`w-full inline-flex flex-col justify-start items-start gap-1 relative ${className}`}>
            {/* Label header */}
            {(label || (enableMediaLibrary && !hasActiveImage)) && (
                <div className="self-stretch flex justify-between items-center mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {renderLabel()}
                        {labelInfo && (
                            <span className="text-xs text-dark/60 font-normal font-sans">
                                {labelInfo}
                            </span>
                        )}
                    </div>
                    {enableMediaLibrary && !hasActiveImage && (
                        <Button
                            type="button"
                            variant="ghost-green"
                            size="sm"
                            leftIcon="Image 2"
                            text="Pilih dari Media Library"
                            onClick={() => setIsMediaModalOpen(true)}
                        />
                    )}
                </div>
            )}

            {/* Hidden Inputs */}
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
            <input
                ref={replaceInputRef}
                type="file"
                accept={accept}
                onChange={handleReplaceFileChange}
                className="hidden"
            />

            {/* Upload Area container */}
            <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                {/* LARGE PREVIEW LAYOUT */}
                {previewLayout === "large" && hasActiveImage && currentActive && (
                    <div className="self-stretch flex flex-col gap-3 w-full">
                        {/* Main Large Image Card */}
                        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-brand-background group flex items-center justify-center border border-white-80 shadow-xs">
                            <img
                                src={currentActive.url}
                                alt={currentActive.name}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />

                            {/* Gradient Overlay for controls */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-90 transition-opacity" />

                            {/* Top info & action buttons */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleReplaceBrowse}
                                    onMouseEnter={() => setIsReplaceHovered(true)}
                                    onMouseLeave={() => setIsReplaceHovered(false)}
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
                                        isReplaceHovered
                                            ? "bg-g1/15 text-g1 border-g1/40"
                                            : "bg-white text-dark/80 border-white-70"
                                    }`}
                                    title="Ganti foto saat ini"
                                >
                                    <LordIcon
                                        name="Edit"
                                        size={14}
                                        primaryColor={isReplaceHovered ? "#0A9863" : "#110D31"}
                                    />
                                    <span className={`transition-colors duration-150 ${isReplaceHovered ? "text-g1 font-semibold" : "text-dark/80 font-semibold"}`}>
                                        Ganti Foto
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(currentActive, safeActiveIndex)}
                                    className="size-8 bg-red-state hover:bg-red-state/90 border border-red-300 hover:border-red-400 text-white rounded-full shadow-md backdrop-blur-xs flex items-center justify-center hover:opacity-80 active:opacity-60 active:scale-95 transition-all cursor-pointer"
                                    title="Hapus gambar"
                                >
                                    <LordIcon name="Delete" size={16} primaryColor="#FFFFFF" />
                                </button>
                            </div>

                            {/* Bottom meta info */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white select-none">
                                <div className="flex flex-col gap-0.5 max-w-[80%]">
                                    <span className="text-sm font-semibold truncate drop-shadow-sm">
                                        {currentActive.name}
                                    </span>
                                    {allImages.length > 1 && (
                                        <span className="text-xs text-white/80 font-medium font-sans">
                                            Gambar {safeActiveIndex + 1} dari {allImages.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail strip if multiple images */}
                        {allImages.length > 1 && (
                            <div className="flex items-center gap-2.5 overflow-x-auto py-1 w-full">
                                {allImages.map((img, idx) => {
                                    const isActive = idx === safeActiveIndex;
                                    return (
                                        <div
                                            key={img.id}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative group shrink-0 size-20 sm:size-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                                                isActive
                                                    ? "border-g1 ring-2 ring-g1/30 shadow-md scale-100"
                                                    : "border-white-80 hover:border-g1/50 opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveImage(img, idx);
                                                }}
                                                className="absolute top-1 right-1 size-6 bg-red-state/90 hover:bg-red-state text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                                                title="Hapus foto ini"
                                            >
                                                <LordIcon name="Delete" size={13} primaryColor="#FFFFFF" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Buttons under the first image being uploaded */}
                        {allImages.length < maxFiles && (
                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    leftIcon="Image 2"
                                    text="Unggah Gambar Lainnya"
                                    onClick={triggerBrowse}
                                />
                                {enableMediaLibrary && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        leftIcon="Attachment"
                                        text="Pilih Lainnya dari Media Library"
                                        onClick={() => {
                                            if (allImages.length >= maxFiles) {
                                                showNotification(`Maksimal ${maxFiles} gambar telah tercapai.`, "error");
                                            } else {
                                                setIsMediaModalOpen(true);
                                            }
                                        }}
                                    />
                                )}
                                <span className="text-xs text-dark/50 font-normal font-sans ml-1">
                                    ({allImages.length}/{maxFiles} gambar terunggah)
                                </span>
                            </div>
                        )}
                        {allImages.length >= maxFiles && (
                            <div className="text-xs text-dark/50 font-medium font-sans pt-1 flex items-center gap-1.5">
                                <span>Maksimal {maxFiles} gambar tercapai</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Dropzone Box: Shown when no active image (or in compact mode when slots available) */}
                {showDropzone && (
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={triggerBrowse}
                        data-hover-target="true"
                        className={`dropzone-box group self-stretch ${
                            previewLayout === "large" ? "py-16 sm:py-20" : "py-14 sm:py-16"
                        } px-4 rounded-3xl transition-all duration-200 cursor-pointer flex flex-col justify-start items-center gap-2.5 overflow-hidden border border-white-80 hover:border-g1 hover:opacity-80 hover:shadow-[0px_4px_16px_0px_rgba(6,137,81,0.12)] active:opacity-60 ${
                            dragActive
                                ? "border-2 border-g1 bg-g1/10 border-dashed"
                                : "bg-brand-background"
                        }`}
                    >
                        <div className="flex flex-col justify-start items-center gap-3">
                            <LordIcon
                                name="Image 2"
                                size={32}
                                primaryColor="#0A9863"
                                trigger="hover"
                                target=".dropzone-box"
                            />

                            <div className="flex flex-col justify-start items-center gap-1">
                                <div className="text-center justify-start text-dark/70 text-xs font-medium font-sans">
                                    Tarik & Letakkan berkas foto di sini <br />atau{" "}
                                    <span className="text-g1 hover:underline font-semibold cursor-pointer">
                                        Pilih Berkas dari Komputer
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPACT File list preview (default when previewLayout is "compact") */}
                {previewLayout === "compact" && hasActiveImage && (
                    <div className="self-stretch flex flex-col gap-2 bg-brand-background p-4 rounded-3xl">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                            Berkas Terpilih ({allImages.length})
                        </div>

                        {allImages.map((img, idx) => (
                            <div
                                key={img.id}
                                className="flex items-center justify-between p-2.5 bg-white border border-white-70 rounded-2xl shadow-xs"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {img.url ? (
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="size-10 rounded-lg object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <div className="size-10 rounded-lg bg-g1/10 text-g1 flex items-center justify-center border border-g1/20">
                                            <LordIcon name="Attachment" size={20} primaryColor="#0A9863" />
                                        </div>
                                    )}
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate max-w-100 font-sans">
                                            {img.name}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage(img, idx);
                                    }}
                                    className="size-8 rounded-full border border-transparent hover:border-red-state/30 bg-transparent hover:bg-red-state/10 text-slate-400 hover:text-red-state flex items-center justify-center hover:opacity-80 active:opacity-60 active:scale-95 transition-all cursor-pointer"
                                    title="Hapus gambar"
                                >
                                    <LordIcon name="Delete" size={16} primaryColor="#f94c4c" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Suggested size info under the box */}
            {(descriptionPrefix || descriptionValue || fileTypesHint) && (
                <p className="w-full text-center text-xs text-dark/60 font-normal font-sans pt-1">
                    {fileTypesHint && (
                        <>
                            {renderEmphasizedHint(fileTypesHint)}
                            {", "}
                        </>
                    )}
                    {descriptionPrefix
                        ? descriptionPrefix.endsWith(":")
                            ? `${descriptionPrefix} `
                            : `${descriptionPrefix}: `
                        : descriptionValue
                        ? "Ukuran Disarankan: "
                        : ""}
                    {descriptionValue && renderEmphasizedHint(descriptionValue)}
                </p>
            )}

            {/* Media Select Modal */}
            <MediaSelectModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelect={(item) => {
                    handleMediaLibrarySelect(item);
                    setIsMediaModalOpen(false);
                }}
            />

            {/* Notification Toast for Errors */}
            <Notification
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
