import { useState, useRef, useEffect, useMemo, ReactNode } from "react";
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
    fileSize?: string;
}

const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileNameFromUrl = (url: string) => {
    try {
        const parts = url.split("/");
        return parts[parts.length - 1].split("?")[0] || "image.png";
    } catch {
        return "image.png";
    }
};

const normalizeName = (name: string) => {
    return name
        .toLowerCase()
        .replace(/\.[^/.]+$/, "") // strip extension
        .replace(/^[\d_-]+/, "") // strip timestamp/random prefix
        .replace(/[^a-z0-9]/g, ""); // strip non-alphanumerics
};

// Helper to check if a local file has already been uploaded/converted and exists in existingImageUrls or defaultImageUrl
const isFileAlreadyUploaded = (file: File, urls: string[]) => {
    const normFile = normalizeName(file.name);
    if (!normFile) return false;

    return urls.some((url) => {
        if (!url || typeof url !== "string") return false;
        try {
            const urlFileName = getFileNameFromUrl(url);
            const normUrl = normalizeName(urlFileName);
            if (!normUrl) return false;

            return normUrl === normFile || normUrl.endsWith(normFile) || normUrl.includes(normFile);
        } catch {
            return false;
        }
    });
};

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

    // Compute object URLs synchronously for selected files so previews are immediately available
    const filePreviews = useMemo(() => {
        return selectedFiles.map((file) => {
            if (file.type.startsWith("image/")) {
                try {
                    return URL.createObjectURL(file);
                } catch {
                    return "";
                }
            }
            return "";
        });
    }, [selectedFiles]);

    // Clean up revoked URLs when filePreviews change or on unmount
    useEffect(() => {
        return () => {
            filePreviews.forEach((url) => {
                if (url) {
                    try {
                        URL.revokeObjectURL(url);
                    } catch {
                        // ignore
                    }
                }
            });
        };
    }, [filePreviews]);

    const validExistingUrls = useMemo(() => {
        return (existingImageUrls || []).filter(
            (url): url is string => typeof url === "string" && url.trim().length > 0
        );
    }, [existingImageUrls]);

    const validDefaultUrl =
        typeof defaultImageUrl === "string" && defaultImageUrl.trim().length > 0
            ? defaultImageUrl.trim()
            : null;

    const allKnownUrls = useMemo(() => {
        return [
            ...validExistingUrls,
            ...(validDefaultUrl ? [validDefaultUrl] : []),
        ];
    }, [validExistingUrls, validDefaultUrl]);

    // Keep selectedFiles clean of any files that have already been converted/uploaded to the server
    useEffect(() => {
        if (selectedFiles.length === 0) return;
        const remaining = selectedFiles.filter((file) => !isFileAlreadyUploaded(file, allKnownUrls));
        if (remaining.length !== selectedFiles.length) {
            setSelectedFiles(remaining);
        }
    }, [allKnownUrls, selectedFiles]);

    // Filter local files: only show ones that are not already present in the existing/default URLs
    const pendingSelectedFiles = useMemo(() => {
        return selectedFiles.filter((file) => !isFileAlreadyUploaded(file, allKnownUrls));
    }, [selectedFiles, allKnownUrls]);

    const [urlSizes, setUrlSizes] = useState<Record<string, number>>({});

    // Fetch Content-Length or blob size for existing server URLs so we can display their exact size
    useEffect(() => {
        allKnownUrls.forEach((url) => {
            if (!url || urlSizes[url]) return;
            fetch(url, { method: "HEAD" })
                .then((res) => {
                    const cl = res.headers.get("content-length");
                    if (cl) {
                        const bytes = parseInt(cl, 10);
                        if (!isNaN(bytes) && bytes > 0) {
                            setUrlSizes((prev) => ({ ...prev, [url]: bytes }));
                            return;
                        }
                    }
                    return fetch(url).then((r) => r.blob()).then((b) => {
                        if (b && b.size > 0) {
                            setUrlSizes((prev) => ({ ...prev, [url]: b.size }));
                        }
                    });
                })
                .catch(() => {
                    // ignore if fetch fails
                });
        });
    }, [allKnownUrls, urlSizes]);

    const getFormattedSizeLabel = (bytes?: number): string => {
        if (bytes && bytes > 0) {
            return `${formatFileSize(bytes)} • Tersimpan`;
        }
        return "Tersimpan";
    };

    // Build unified display images list, ensuring only non-empty, non-duplicate URLs are included
    const allImages: DisplayImageItem[] = useMemo(() => {
        const existingItems: DisplayImageItem[] = validExistingUrls.map((url, idx) => ({
            id: `existing-${idx}-${url}`,
            type: "existing" as const,
            url,
            name: getFileNameFromUrl(url),
            existingUrl: url,
            fileSize: getFormattedSizeLabel(urlSizes[url]),
        }));

        if (!multiple) {
            // In single file mode, at most 1 image can be displayed
            if (pendingSelectedFiles.length > 0) {
                const f = pendingSelectedFiles[0];
                const fileIdx = selectedFiles.indexOf(f);
                return [{
                    id: `file-0-${f.name}-${f.lastModified}`,
                    type: "file" as const,
                    url: filePreviews[fileIdx] || "",
                    name: f.name,
                    file: f,
                    fileIndex: fileIdx >= 0 ? fileIdx : 0,
                    fileSize: getFormattedSizeLabel(f.size),
                }].filter((img) => typeof img.url === "string" && img.url.trim().length > 0);
            }

            if (validDefaultUrl) {
                return [{
                    id: `default-${validDefaultUrl}`,
                    type: "existing" as const,
                    url: validDefaultUrl,
                    name: defaultImageLabel || getFileNameFromUrl(validDefaultUrl),
                    existingUrl: validDefaultUrl,
                    fileSize: getFormattedSizeLabel(urlSizes[validDefaultUrl]),
                }];
            }

            return existingItems.slice(0, 1).map((item) => ({
                ...item,
                fileSize: item.fileSize || getFormattedSizeLabel(urlSizes[item.url]),
            }));
        }

        // In multiple mode: combine existing uploaded URLs with any local files that haven't been uploaded yet
        const defaultItem: DisplayImageItem[] =
            validDefaultUrl && !validExistingUrls.includes(validDefaultUrl)
                ? [{
                    id: `default-${validDefaultUrl}`,
                    type: "existing" as const,
                    url: validDefaultUrl,
                    name: defaultImageLabel || getFileNameFromUrl(validDefaultUrl),
                    existingUrl: validDefaultUrl,
                    fileSize: getFormattedSizeLabel(urlSizes[validDefaultUrl]),
                }]
                : [];

        const pendingItems: DisplayImageItem[] = pendingSelectedFiles.map((f) => {
            const idx = selectedFiles.indexOf(f);
            return {
                id: `file-${idx}-${f.name}-${f.lastModified}`,
                type: "file" as const,
                url: filePreviews[idx] || "",
                name: f.name,
                file: f,
                fileIndex: idx,
                fileSize: getFormattedSizeLabel(f.size),
            };
        });

        return [...existingItems, ...defaultItem, ...pendingItems]
            .map((item) => ({
                ...item,
                fileSize: item.fileSize || getFormattedSizeLabel(item.file ? item.file.size : urlSizes[item.url]),
            }))
            .filter((img) => typeof img.url === "string" && img.url.trim().length > 0);
    }, [
        validExistingUrls,
        validDefaultUrl,
        defaultImageLabel,
        multiple,
        pendingSelectedFiles,
        selectedFiles,
        filePreviews,
        urlSizes,
    ]);

    const safeActiveIndex = allImages.length > 0
        ? Math.min(Math.max(0, activeImageIndex), allImages.length - 1)
        : 0;
    const currentActive = allImages[safeActiveIndex] || null;

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);

        if (!multiple) {
            const newFile = newFiles[0];

            // Clear previous existing/default images in single mode so it replaces cleanly
            if (validDefaultUrl && onRemoveDefaultImage) {
                onRemoveDefaultImage();
            }
            if (validExistingUrls.length > 0 && onRemoveExistingImage) {
                validExistingUrls.forEach((url) => onRemoveExistingImage(url));
            }

            setSelectedFiles([newFile]);
            onFilesSelected?.([newFile]);
            setActiveImageIndex(0);
            if (inputRef.current) inputRef.current.value = "";
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
            setSelectedFiles([]);
            onFilesSelected?.([]);
        } else if (img.type === "file") {
            if (!multiple) {
                setSelectedFiles([]);
                onFilesSelected?.([]);
            } else if (typeof img.fileIndex === "number") {
                const updated = selectedFiles.filter((_, i) => i !== img.fileIndex);
                setSelectedFiles(updated);
                onFilesSelected?.(updated);
            }
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
        if (inputRef.current) {
            inputRef.current.value = "";
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
            if (!multiple) {
                // In single mode: replace existing image
                if (validDefaultUrl && onRemoveDefaultImage) {
                    onRemoveDefaultImage();
                }
                if (validExistingUrls.length > 0 && onRemoveExistingImage) {
                    validExistingUrls.forEach((url) => onRemoveExistingImage(url));
                }

                if (onSelectMediaUrl) {
                    onSelectMediaUrl(item.url);
                    setSelectedFiles([]);
                    setActiveImageIndex(0);
                    return;
                }

                const response = await fetch(item.url);
                const blob = await response.blob();
                const file = new File([blob], item.fileName, { type: blob.type || "image/jpeg" });
                setSelectedFiles([file]);
                onFilesSelected?.([file]);
                setActiveImageIndex(0);
                return;
            }

            // In multiple mode
            const currentTotal = allImages.length;
            if (currentTotal >= maxFiles) {
                showNotification(
                    `Maksimal ${maxFiles} gambar telah tercapai. Hapus salah satu gambar terlebih dahulu jika ingin menambahkan dari Media Library.`,
                    "error"
                );
                return;
            }

            if (onAddExistingUrl) {
                onAddExistingUrl(item.url);
                setActiveImageIndex(allImages.length);
                return;
            }

            const response = await fetch(item.url);
            const blob = await response.blob();
            const file = new File([blob], item.fileName, { type: blob.type || "image/jpeg" });

            const updated = [...selectedFiles, file];
            setSelectedFiles(updated);
            onFilesSelected?.(updated);
            setActiveImageIndex(allImages.length);
        } catch (error) {
            console.error("Error creating File from media selection:", error);
            showNotification("Gagal memuat gambar dari Media Library.", "error");
        }
    };

    const hasActiveImage =
        allImages.length > 0 &&
        !!currentActive &&
        typeof currentActive.url === "string" &&
        currentActive.url.trim().length > 0;
    const showDropzone = allImages.length === 0;

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

        if (info) {
            return (
                <div className="inline-flex items-center gap-1.5">
                    <label className="text-dark text-sm font-semibold font-sans">
                        {labelContent}
                    </label>
                    <InfoButton info={info} title={labelText.replace(/\*/g, "").trim()} />
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
            {(label || enableMediaLibrary) && (
                <div className="self-stretch flex justify-between items-center mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {renderLabel()}
                        {labelInfo && (
                            <span className="text-xs text-dark/60 font-normal font-sans">
                                {labelInfo}
                            </span>
                        )}
                    </div>
                    {enableMediaLibrary && (
                        <Button
                            type="button"
                            variant="ghost-green"
                            size="sm"
                            leftIcon="Image 2"
                            text="Pilih dari Media Library"
                            onClick={() => {
                                if (multiple && allImages.length >= maxFiles) {
                                    showNotification(`Maksimal ${maxFiles} gambar telah tercapai.`, "error");
                                } else {
                                    setIsMediaModalOpen(true);
                                }
                            }}
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
                {previewLayout === "large" && hasActiveImage && currentActive && currentActive.url && (
                    <div className="self-stretch flex flex-col gap-3 w-full">
                        {/* Main Large Image Card */}
                        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-brand-background group flex items-center justify-center border border-white-80 shadow-xs">
                            <img
                                src={currentActive.url}
                                alt={currentActive.name || "Preview"}
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
                                            {img.url ? (
                                                <img
                                                    src={img.url}
                                                    alt={img.name || "Thumbnail"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                    <LordIcon name="Image 2" size={24} primaryColor="#94a3b8" />
                                                </div>
                                            )}
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

                {/* Dropzone Box: Shown only when no active image (State 1) */}
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
                    <div className="self-stretch flex flex-col gap-3.5 w-full animate-fadeIn">
                        {/* List File Terpilih */}
                        <div className="flex flex-col gap-2.5 w-full">
                            {allImages.map((img, idx) => (
                                <div
                                    key={img.id}
                                    className="flex items-center justify-between p-3 bg-white border border-white-80 hover:border-g1/40 rounded-2xl shadow-2xs transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                                        {/* Thumbnail kecil */}
                                        <div className="size-12 rounded-xl overflow-hidden bg-brand-background border border-white-80 shrink-0 flex items-center justify-center">
                                            {img.url ? (
                                                <img
                                                    src={img.url}
                                                    alt={img.name || "Thumbnail"}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <LordIcon name="Image 2" size={24} primaryColor="#0A9863" />
                                            )}
                                        </div>

                                        {/* Nama file + Ukuran */}
                                        <div className="flex flex-col min-w-0 flex-1 text-left">
                                            <span
                                                className="text-sm font-semibold text-dark truncate font-sans"
                                                title={img.name}
                                            >
                                                {img.name}
                                            </span>
                                            <span className="text-xs text-dark/60 font-medium font-sans mt-0.5">
                                                {img.fileSize || "Gambar WebP • Tersimpan"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Button hapus gambar */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage(img, idx);
                                        }}
                                        className="size-8 sm:size-9 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 border border-red-100"
                                        title="Hapus gambar"
                                    >
                                        <LordIcon name="Delete" size={16} primaryColor="#f94c4c" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Di bawah list, tampilkan tombol "Upload Image" full width */}
                        <div className="flex flex-col gap-2 w-full pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                leftIcon="Image 2"
                                text="Upload Image"
                                onClick={triggerBrowse}
                                className="w-full justify-center text-center cursor-pointer shadow-2xs font-semibold"
                            />
                        </div>
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
