"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, InputHTMLAttributes, forwardRef } from "react";

export interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface AutocompleteProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  options: AutocompleteOption[];
  value: string; // The text input value
  selectedId: string | null; // The selected option's value (ID)
  onChange: (text: string, selectedOption: AutocompleteOption | null) => void;
  placeholder?: string;
  emptyMessage?: string;
}

const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  ({ 
    className, 
    label, 
    error, 
    id, 
    options, 
    value, 
    selectedId,
    onChange, 
    placeholder,
    emptyMessage = "No matches found",
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter options based on input value
    const filteredOptions = value.trim()
      ? options.filter(option => 
          option.label.toLowerCase().includes(value.toLowerCase()) ||
          option.sublabel?.toLowerCase().includes(value.toLowerCase())
        )
      : options;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset highlighted index when filtered options change
    useEffect(() => {
      setHighlightedIndex(-1);
    }, [value]);

    // Scroll highlighted item into view
    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const highlightedItem = listRef.current.children[highlightedIndex] as HTMLElement;
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // When typing, clear the selection and notify parent
      onChange(newValue, null);
      setIsOpen(true);
    };

    const handleOptionClick = (option: AutocompleteOption) => {
      onChange(option.label, option);
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setIsOpen(true);
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionClick(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    const handleFocus = () => {
      setIsOpen(true);
    };

    // Check if current value matches an existing option
    const hasExactMatch = options.some(
      opt => opt.label.toLowerCase() === value.toLowerCase()
    );

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            id={id}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={cn(
              "input",
              error && "ring-2 ring-accent-error/20 border-accent-error",
              selectedId && "pr-10",
              className
            )}
            autoComplete="off"
            {...props}
          />
          
          {/* Selected indicator */}
          {selectedId && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg 
                className="w-5 h-5 text-accent-success" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          )}

          {/* Dropdown */}
          {isOpen && (
            <ul
              ref={listRef}
              className="absolute z-50 w-full mt-2 bg-white rounded-m shadow-subtle border border-neutral-light max-h-60 overflow-auto"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    onClick={() => handleOptionClick(option)}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors",
                      index === highlightedIndex && "bg-primary/20",
                      selectedId === option.value && "bg-primary/10",
                      index !== highlightedIndex && selectedId !== option.value && "hover:bg-neutral-light/50"
                    )}
                  >
                    <div className="font-medium text-secondary">{option.label}</div>
                    {option.sublabel && (
                      <div className="text-sm text-secondary/50">{option.sublabel}</div>
                    )}
                  </li>
                ))
              ) : value.trim() ? (
                <li className="px-4 py-3 text-secondary/50 italic">
                  {emptyMessage}
                  <span className="block text-xs mt-1 text-secondary/40">
                    &quot;{value}&quot; will be created as a new client
                  </span>
                </li>
              ) : (
                <li className="px-4 py-3 text-secondary/50 italic">
                  Start typing to search or enter a new client name
                </li>
              )}
            </ul>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-accent-error">{error}</p>}
        
        {/* New client indicator */}
        {value.trim() && !selectedId && !hasExactMatch && !isOpen && (
          <p className="mt-1.5 text-xs text-primary font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New client will be created
          </p>
        )}
      </div>
    );
  }
);

Autocomplete.displayName = "Autocomplete";

export { Autocomplete };
