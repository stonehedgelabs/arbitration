import { memo } from "react";
import { Box, Input } from "@chakra-ui/react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export const SearchBar = memo(function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <Box position="relative" w="full">
      {/* Search icon inside the input */}
      <Box
        position="absolute"
        left="3"
        top="50%"
        transform="translateY(-50%)"
        zIndex="1"
        color="text.400"
        pointerEvents="none"
      >
        <Search size={20} />
      </Box>

      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        bg="primary.25"
        borderColor="text.300"
        pl="10" // Add left padding to make room for the search icon
        _focus={{
          borderColor: "buttons.primary.bg",
          boxShadow: "0 0 0 1px var(--chakra-colors-buttons-primary-bg)",
        }}
        w="full"
      />
    </Box>
  );
});
