import { IconButton, Spinner } from "@chakra-ui/react";
import { RefreshCw, RotateCcw } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  loading: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  ariaLabel?: string;
  icon?: "refresh" | "rotate"; // Added icon prop to choose between RefreshCw and RotateCcw
}

export const RefreshButton = ({
  onClick,
  loading,
  size = "sm",
  ariaLabel = "Refresh",
  icon = "rotate", // Default to RotateCcw for consistency with Reddit
}: RefreshButtonProps) => {
  const IconComponent = icon === "refresh" ? RefreshCw : RotateCcw;

  return (
    <IconButton
      aria-label={ariaLabel}
      size={size}
      variant="ghost"
      color="text.400"
      onClick={onClick}
      loading={loading}
      spinner={<Spinner size={size} />}
      bg="linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.05) 100%)"
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.25)"
      _hover={{
        bg: "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.1) 100%)",
        transform: "translateY(-1px)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.3)",
      }}
      _active={{
        transform: "translateY(0)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
      }}
      transition="all 0.2s ease"
      borderRadius="lg"
    >
      <IconComponent size={16} />
    </IconButton>
  );
};
