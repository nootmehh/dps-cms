import { useState, useRef, useEffect } from "react";
import Button from "./button";
import MediaSelectModal, { MediaSelectModalItem } from "./modal/mediaSelectModal";
import LordIcon from "../common/lordIcon";

export interface UploadFileProps {
    label?: string;
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
    className?: string;
}

export default function UploadFile({
    label = "Unggah Berkas",
    onFilesSelected,
    descriptionPrefix,
    descriptionValue,
    multiple = false,
    accept = "image/*",
    maxFiles = 5,
    initialFiles = [],
    existingImageUrls = [],
    onRemoveExistingImage,
    defaultImageUrl,
    defaultImageLabel = "Saved Image",
    onRemoveDefaultImage,
    enableMediaLibrary = true,
    className = "",
}: UploadFileProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync if initialFiles changes
    useEffect(() => {
        if (initialFiles && initialFiles.length > 0) {
            setSelectedFiles(initialFiles);
        }
    }, [initialFiles]);

    // Handle previews
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

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        let newFiles = Array.from(files);

        if (!multiple) {
            newFiles = [newFiles[0]];
            setSelectedFiles(newFiles);
            onFilesSelected?.(newFiles);
            return;
        }

        const totalAllowed = maxFiles - selectedFiles.length;
        if (totalAllowed <= 0) return;

        const filesToAdd = newFiles.slice(0, totalAllowed);
        const updated = [...selectedFiles, ...filesToAdd];
        setSelectedFiles(updated);
        onFilesSelected?.(updated);
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

    const removeFile = (index: number) => {
        const updated = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updated);
        onFilesSelected?.(updated);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const triggerBrowse = () => {
        inputRef.current?.click();
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileNameFromUrl = (url: string) => {
        try {
            const parts = url.split("/");
            return parts[parts.length - 1].split("?")[0] || "image.png";
        } catch {
            return "image.png";
        }
    };

    const handleMediaLibrarySelect = async (item: MediaSelectModalItem) => {
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const file = new File([blob], item.fileName, { type: blob.type || "image/jpeg" });

            if (!multiple) {
                setSelectedFiles([file]);
                onFilesSelected?.(file ? [file] : []);
            } else {
                if (selectedFiles.length < maxFiles) {
                    const updated = [...selectedFiles, file];
                    setSelectedFiles(updated);
                    onFilesSelected?.(updated);
                }
            }
        } catch (error) {
            console.error("Error creating File from media selection:", error);
        }
    };

    const canUploadMore = multiple ? selectedFiles.length < maxFiles : selectedFiles.length === 0;

    return (
        <div className={`w-full max-w-116.5 inline-flex flex-col justify-start items-start gap-1 relative ${className}`}>
            {/* Label header */}
            <div className="self-stretch flex justify-between items-center">
                <label className="text-dark text-sm font-semibold font-sans">{label}</label>
                {enableMediaLibrary && (
                    <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="text-xs font-semibold text-g1 hover:underline cursor-pointer flex items-center gap-1 font-sans"
                    >
                        <LordIcon name="Image 2" size={14} primaryColor="#0A9863" />
                        Pilih dari Media Library
                    </button>
                )}
            </div>

            {/* Upload Area container */}
            <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                <input
                    ref={inputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />

                {/* Dropzone Box */}
                {canUploadMore && (
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={triggerBrowse}
                        className={`self-stretch py-10 px-4 rounded-3xl outline-1 -outline-offset-1 transition-all cursor-pointer flex flex-col justify-start items-center gap-2.5 overflow-hidden ${dragActive
                            ? "outline-g1 bg-g1/5 scale-[0.99] outline-dashed"
                            : "outline-white-80 hover:bg-white-90 bg-white"
                            }`}
                    >
                        <div className="flex flex-col justify-start items-center gap-3">
                            <div className="size-12 rounded-full bg-brand-background flex items-center justify-center">
                                <LordIcon name="Image 2" size={28} primaryColor="#0A9863" />
                            </div>

                            <div className="flex flex-col justify-start items-center gap-1">
                                <div className="text-center justify-start text-dark text-sm font-medium font-sans">
                                    Tarik & Letakkan di sini <br />atau <span className="text-g1 hover:underline font-semibold cursor-pointer">Pilih Berkas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* File list preview */}
                {(selectedFiles.length > 0 || defaultImageUrl || existingImageUrls.length > 0) && (
                    <div className="self-stretch flex flex-col gap-2 bg-brand-background/60 p-4 rounded-2xl border border-white-80">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                            Berkas Terpilih ({multiple
                                ? (selectedFiles.length + existingImageUrls.length + (defaultImageUrl ? 1 : 0))
                                : (selectedFiles.length > 0 ? selectedFiles.length : (defaultImageUrl ? 1 : 0))
                            })
                        </div>

                        {/* Existing Saved URLs */}
                        {existingImageUrls.map((url, idx) => (
                            <div
                                key={`existing-${idx}`}
                                className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-xs"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <img
                                        src={url}
                                        alt={`Existing ${idx}`}
                                        className="size-10 rounded-lg object-cover border border-slate-200"
                                    />
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate max-w-100 font-sans">
                                            {getFileNameFromUrl(url)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onRemoveExistingImage) {
                                            onRemoveExistingImage(url);
                                        }
                                    }}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-state hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                    title="Hapus gambar"
                                >
                                    <LordIcon name="Delete" size={16} primaryColor="#f94c4c" />
                                </button>
                            </div>
                        ))}

                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-xs"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {file.type.startsWith("image/") && previews[index] ? (
                                        <img
                                            src={previews[index]}
                                            alt={file.name}
                                            className="size-10 rounded-lg object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <div className="size-10 rounded-lg bg-g1/10 text-g1 flex items-center justify-center border border-g1/20">
                                            <LordIcon name="Attachment" size={20} primaryColor="#0A9863" />
                                        </div>
                                    )}
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate max-w-100 font-sans">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-g1 font-sans">
                                            {formatBytes(file.size)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-state hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                    title="Hapus berkas"
                                >
                                    <LordIcon name="Delete" size={16} primaryColor="#f94c4c" />
                                </button>
                            </div>
                        ))}

                        {/* Render active default image preview */}
                        {selectedFiles.length === 0 && defaultImageUrl && (
                            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-xs">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <img
                                        src={defaultImageUrl}
                                        alt={defaultImageLabel}
                                        className="size-10 rounded-lg object-cover border border-slate-200"
                                    />
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <div className="text-sm font-medium text-slate-800 truncate max-w-100 font-sans">
                                            {defaultImageLabel}
                                        </div>
                                        <div className="text-xs text-g1 font-sans truncate max-w-100">
                                            {getFileNameFromUrl(defaultImageUrl)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onRemoveDefaultImage) {
                                            onRemoveDefaultImage();
                                        }
                                    }}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-state hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                    title="Hapus gambar aktif"
                                >
                                    <LordIcon name="Delete" size={16} primaryColor="#f94c4c" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Media Select Modal */}
            <MediaSelectModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelect={(item) => {
                    handleMediaLibrarySelect(item);
                    setIsMediaModalOpen(false);
                }}
            />
        </div>
    );
}
