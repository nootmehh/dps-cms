import { useEffect, useRef, useState, type ReactNode } from "react";

export interface DropdownOption {
  value: string;
  label: ReactNode;
  searchLabel?: string;
}

interface BaseDropdownProps {
  label?: ReactNode;
  placeholder?: string;
  options: DropdownOption[];
  containerClassName?: string;
  disabled?: boolean;
  selectClassName?: string;
  allowCustomValues?: boolean;
}

interface SingleDropdownProps extends BaseDropdownProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

interface MultipleDropdownProps extends BaseDropdownProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type DropdownProps = SingleDropdownProps | MultipleDropdownProps;

const Icon = ({
  name,
  className = "size-5 bg-current",
}: {
  name: string;
  className?: string;
}) => (
  <span
    style={{
      maskImage: `url("/icons/${name}.svg")`,
      WebkitMaskImage: `url("/icons/${name}.svg")`,
    }}
    className={`mask-contain mask-no-repeat mask-center shrink-0 inline-block ${className}`}
    aria-hidden="true"
  />
);

export default function Dropdown({
  label,
  placeholder = "Select option...",
  options,
  value,
  onChange,
  multiple = false,
  containerClassName = "",
  disabled = false,
  selectClassName = "",
  allowCustomValues = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((option) => {
    const labelStr =
      typeof option.label === "string"
        ? option.label
        : option.searchLabel || "";
    return labelStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper to check if an option is selected
  const isSelected = (val: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  // Toggle selection
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const nextValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];

      (onChange as (val: string[]) => void)(nextValues);
    } else {
      (onChange as (val: string) => void)(optionValue);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  // Remove single item in multi-select chips
  const handleRemoveItem = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      (onChange as (val: string[]) => void)(
        value.filter((v) => v !== optionValue)
      );
    }
  };

  // Get display text/elements for input field
  const getSelectedLabels = () => {
    if (multiple && Array.isArray(value)) {
      return value.map((val) => {
        const found = options.find((opt) => opt.value === val);
        return found || { value: val, label: val };
      });
    }
    const singleOpt = options.find((opt) => opt.value === value);
    if (!singleOpt && value) {
      return [{ value: value as string, label: value as string }];
    }
    return singleOpt ? [singleOpt] : [];
  };

  const selectedOptions = getSelectedLabels();

  const hasExactMatch = options.some((opt) => {
    const labelStr =
      typeof opt.label === "string" ? opt.label : opt.searchLabel || opt.value;
    return labelStr.toLowerCase() === searchQuery.trim().toLowerCase();
  });

  const showCustomAddOption =
    allowCustomValues && searchQuery.trim() !== "" && !hasExactMatch;

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[466px] inline-flex flex-col justify-start items-start gap-1 relative ${containerClassName}`}
    >
      {label && (
        <label className="self-stretch justify-start text-dark text-sm font-semibold font-sans">
          {label}
        </label>
      )}

      {/* Segmented Connected Dropdown Bar (Figma Unique Button 2-Pill Design) */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`group self-stretch h-12 rounded-[48px] inline-flex justify-center items-center gap-0 w-full cursor-pointer transition-opacity duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
        } ${selectClassName}`}
      >
        {/* Left Main Pill */}
        <div className="flex-1 h-12 px-4 py-2.5 bg-brand-background rounded-[100px] flex justify-between items-center gap-2.5 overflow-hidden transition-colors duration-200">
          <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-hidden">
            {/* Chips for Multiple Select */}
            {multiple && selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <div
                  key={opt.value}
                  className="h-8 px-3.5 py-1 bg-white text-dark text-xs font-semibold font-sans rounded-full flex items-center gap-2 shadow-xs border border-white-80 transition-colors shrink-0"
                >
                  <span>{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveItem(e, opt.value)}
                    className="size-4.5 hover:bg-red-state/15 hover:text-red-state text-dark/60 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Icon name="Close" className="size-3 bg-current" />
                  </button>
                </div>
              ))
            ) : !multiple && selectedOptions.length > 0 && !isOpen ? (
              <span className="text-dark text-sm font-medium font-sans truncate">
                {selectedOptions[0].label}
              </span>
            ) : null}

            {/* Interactive Search Input inside Select Box */}
            {(!multiple || selectedOptions.length === 0 || isOpen) && (
              <input
                type="text"
                disabled={disabled}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                placeholder={selectedOptions.length > 0 ? "" : placeholder}
                className="flex-1 bg-transparent text-dark text-sm font-normal font-sans placeholder:text-dark/40 outline-none border-none min-w-[60px]"
              />
            )}
          </div>
        </div>

        {/* Right Icon Connected Pill Segment with Green Border */}
        <div className="size-12 p-3 bg-brand-background rounded-[100px] outline outline-1 outline-offset-[-1px] outline-g1 flex justify-center items-center gap-2.5 shrink-0 transition-colors duration-200">
          <div
            className={`size-6 relative flex items-center justify-center text-g1 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <Icon name="Down 2" className="size-4 bg-g1" />
          </div>
        </div>
      </div>

      {/* Options Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-white-80 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 animate-fade-in">
          {filteredOptions.length === 0 && !showCustomAddOption ? (
            <div className="py-3 px-4 text-center text-slate-400 text-sm font-sans">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const active = isSelected(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2.5 rounded-xl flex items-center justify-between text-sm font-sans cursor-pointer transition-colors ${
                    active
                      ? "bg-g1/10 text-g1 font-semibold"
                      : "text-dark hover:bg-brand-background font-normal"
                  }`}
                >
                  <span>{option.label}</span>
                  {active && (
                    <Icon name="Tick" className="size-4 bg-g1 shrink-0" />
                  )}
                </div>
              );
            })
          )}

          {showCustomAddOption && (
            <div
              onClick={() => handleSelect(searchQuery.trim())}
              className="px-4 py-2.5 rounded-xl flex items-center justify-between text-sm font-medium font-sans text-g1 hover:bg-g1/5 cursor-pointer border-t border-white-80"
            >
              <span>Add "{searchQuery.trim()}"</span>
              <Icon name="Add" className="size-4 bg-g1 shrink-0" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}