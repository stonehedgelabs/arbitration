import { IconButton, Button } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  variant?: "icon" | "text";
  size?: "xs" | "sm" | "md" | "lg";
  ariaLabel?: string;
  children?: React.ReactNode;
}

export const BackButton = ({
  onClick,
  variant = "icon",
  size = "sm",
  ariaLabel = "Go back",
  children,
}: BackButtonProps) => {
  if (variant === "text") {
    return (
      <Button
        onClick={onClick}
        variant="ghost"
        size={size}
        color="text.400"
        _hover={{
          bg: "text.50",
        }}
      >
        <ArrowLeft size={16} />
        {children || "Go Back"}
      </Button>
    );
  }

  return (
    <IconButton
      aria-label={ariaLabel}
      variant="ghost"
      size={size}
      onClick={onClick}
      color="text.500"
      bg="primary.100"
      backgroundImage="linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.05) 100%)"
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.25)"
      _hover={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.1) 100%)",
        transform: "translateY(-1px)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.3)",
      }}
      _active={{
        transform: "translateY(0)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
      }}
      transition="all 0.2s ease"
    >
      <ArrowLeft size={20} />
    </IconButton>
  );
};
