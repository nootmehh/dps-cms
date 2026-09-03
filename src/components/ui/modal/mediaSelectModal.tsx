import { useState, useEffect, useMemo } from "react";
import MediaCard from "../mediaCard";
import Pagination from "../pagination";
import InputBox from "../inputBox";
import { fetchMediaList } from "../../../shared/api/media";
import LordIcon from "../../common/lordIcon";

export interface MediaSelectModalItem {
    id: string;
    url: string;
    fileName: string;
    fileSize?: string;
}

interface MediaSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MediaSelectModalItem) => void;
    selectedId?: string;
    itemsPerPage?: number;
    initialData?: MediaSelectModalItem[];
}

export default function MediaSelectModal({
    isOpen,
    onClose,
    onSelect,
    selectedId,
    itemsPerPage = 12,
    initialData,
}: MediaSelectModalProps) {
    const [mediaList, setMediaList] = useState<MediaSelectModalItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentSelectedId, setCurrentSelectedId] = useState<string | undefined>(selectedId);

    useEffect(() => {
        if (isOpen) {
            setCurrentSelectedId(selectedId);
            setSearchQuery("");
            setCurrentPage(1);

            if (initialData && initialData.length > 0) {
                setMediaList(initialData);
            } else {
                setLoading(true);
                fetchMediaList()
                    .then((res) => {
                        const items = res.data || [];
                        const formatted = items.map((item) => ({
                            id: String(item.id),
                            url: item.url,
                            fileName: item.fileName,
                            fileSize: item.fileSize,
                        }));
                        setMediaList(formatted);
                    })
                    .catch((err) => console.error("Failed to fetch media:", err))
                    .finally(() => setLoading(false));
            }
        }
    }, [isOpen, selectedId, initialData]);

    const filteredMedia = useMemo(() => {
        return mediaList.filter((item) =>
            item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [mediaList, searchQuery]);

    const totalItems = filteredMedia.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedMedia = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMedia.slice(start, start + itemsPerPage);
    }, [filteredMedia, currentPage, itemsPerPage]);

    if (!isOpen) return null;

    const handleSelectCard = (item: MediaSelectModalItem) => {
        setCurrentSelectedId(item.id);
        onSelect(item);
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-xs animate-fade-in"
        >
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-white-80 shadow-2xl flex flex-col justify-start items-start gap-5 p-6 md:p-8 overflow-hidden animate-scale-in">
                {/* Modal Header */}
                <div className="self-stretch flex justify-between items-center w-full">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                        <div className="self-stretch justify-start text-dark/60 text-xs font-semibold font-sans tracking-wider uppercase">
                            MEDIA LIBRARY
                        </div>
                        <div className="self-stretch justify-start text-g1 text-2xl font-bold font-sans">
                            Pilih dari Media Library
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full text-dark/60 hover:bg-brand-background transition-all cursor-pointer flex items-center justify-center"
                        title="Close"
                    >
                        <LordIcon name="Delete" size={20} primaryColor="#110D31" />
                    </button>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-g1/10" />

                {/* Filters */}
                {mediaList.length > 0 && (
                    <div className="self-stretch flex flex-col md:flex-row md:items-end items-stretch gap-4 w-full">
                        <InputBox
                            label="Cari Berkas"
                            placeholder="Cari nama berkas..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            leftIcon="Global"
                            containerClassName="w-full max-w-none md:w-1/2"
                        />
                    </div>
                )}

                {/* Body Content */}
                <div className="self-stretch flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 font-sans">
                            <LordIcon name="Dashboard" size={36} trigger="loop" primaryColor="#0A9863" />
                            <p className="text-sm">Memuat media...</p>
                        </div>
                    ) : paginatedMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-sans">
                            <p className="text-base font-medium">Tidak ada media ditemukan</p>
                            <p className="text-sm opacity-80 mt-1">Coba sesuaikan pencarian atau unggah berkas baru.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {paginatedMedia.map((item) => {
                                const isSelected = currentSelectedId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelectCard(item)}
                                        className={`relative group rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                                            isSelected
                                                ? "border-g1 ring-2 ring-g1/30 shadow-md"
                                                : "border-slate-100 hover:border-slate-300 hover:shadow-xs"
                                        }`}
                                    >
                                        <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                            <img
                                                src={item.url}
                                                alt={item.fileName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 size-6 bg-g1 text-white rounded-full flex items-center justify-center shadow-md">
                                                    <LordIcon name="Right 1" size={14} primaryColor="#FFFFFF" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2.5 bg-white flex flex-col gap-0.5">
                                            <p className="text-xs font-semibold text-dark truncate" title={item.fileName}>
                                                {item.fileName}
                                            </p>
                                            {item.fileSize && (
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {item.fileSize}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Pagination */}
                {totalItems > itemsPerPage && (
                    <div className="self-stretch pt-2 border-t border-g1/10 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(page) => setCurrentPage(page)}
                            itemLabel="Berkas"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
