import { useMemo } from "react";
import Button from "./button";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  prevText?: string;
  nextText?: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  itemLabel = "Pengguna",
  prevText = "Sebelumnya",
  nextText = "Selanjutnya",
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  const displayedCount = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`self-stretch inline-flex flex-col md:flex-row justify-between items-center gap-4 w-full font-sans ${className}`}
    >
      {/* Items Range Info */}
      <div className="justify-start text-dark/60 text-sm font-normal font-sans">
        <span>Menampilkan </span>
        <span className="text-g1 text-sm font-semibold font-sans">
          {displayedCount}
        </span>
        <span> dari </span>
        <span className="text-g1 text-sm font-semibold font-sans">
          {totalItems} {itemLabel}
        </span>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        {/* Previous Button (Unique Stroke) */}
        <Button
          type="button"
          text={prevText}
          variant="unique-stroke"
          leftIcon="Left 1"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        />

        {/* Page Numbers List */}
        <div className="flex items-center gap-2">
          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="size-8 flex items-center justify-center text-dark/40 text-sm font-medium select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={`size-8 rounded-full flex items-center justify-center text-sm font-semibold font-sans cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-g1 text-white shadow-xs"
                    : "text-g1 hover:bg-g1/10"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button (Unique Green) */}
        <Button
          type="button"
          text={nextText}
          variant="unique-green"
          rightIcon="Right 1"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </div>
    </div>
  );
}