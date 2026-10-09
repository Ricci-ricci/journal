import React from "react";
import { Search } from "lucide-react";
import { Input } from "./Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A search field with a magnifying-glass icon. Meant to sit in the page
 * header's top-right slot (see Layout's `headerRight` prop).
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) => {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      leftIcon={<Search className="h-4 w-4" />}
    />
  );
};
