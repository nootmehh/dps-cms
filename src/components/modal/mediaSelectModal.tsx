import { useState, useEffect, useMemo } from "react";
import Pagination from "@/components/ui/pagination";
import InputBox from "@/components/ui/inputBox";
import { fetchMediaList } from "@/shared/api/media";
import LordIcon from "@/components/common/lordIcon";
import EmptyState from "@/components/common/emptyState";

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
                    <div className="flex-1 text-g1 text-2xl font-bold font-sans">
                        Pilih dari Media Library
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
                <div className="self-stretch h-px bg-g1/10" />

                {/* Filters */}
                {mediaList.length > 0 && (
                    <div className="self-stretch w-full">
                        <InputBox
                            label="Cari Berkas"
                            placeholder="Cari nama berkas..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            leftIcon="Search"
                            containerClassName="w-full max-w-none"
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
                        <EmptyState
                            iconName="Image 2"
                            iconSize={56}
                            primaryColor="#0A9863"
                            text={
                                searchQuery
                                    ? `Tidak ada media yang cocok dengan "${searchQuery}"`
                                    : "Belum ada berkas media di library."
                            }
                            className="py-12"
                        />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {paginatedMedia.map((item) => {
                                const isSelected = currentSelectedId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelectCard(item)}
                                        className={`w-full p-3 bg-white rounded-2xl border transition-all flex flex-col gap-2.5 group relative overflow-hidden cursor-pointer ${
                                            isSelected
                                                ? "border-g1 outline outline-2 outline-g1 ring-2 ring-g1/20 shadow-md"
                                                : "border-white-80 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-g1 hover:outline hover:outline-2 hover:outline-g1 hover:ring-2 hover:ring-g1/20"
                                        }`}
                                    >
                                        <div className="w-full aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 relative flex items-center justify-center group-hover:opacity-95 transition-opacity">
                                            <img
                                                src={item.url}
                                                alt={item.fileName}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                            />
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 size-7 bg-g1 border-2 border-white text-white rounded-full flex items-center justify-center shadow-md">
                                                    <LordIcon name="CheckCircleTick" size={16} primaryColor="#FFFFFF" secondaryColor="#FFFFFF" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 min-w-0 px-0.5">
                                            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate font-sans" title={item.fileName}>
                                                {item.fileName}
                                            </span>
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
