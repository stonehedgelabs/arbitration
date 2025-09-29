import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";

interface FavoriteButtonProps {
  teamName: string;
  isFavorite: boolean;
  onToggle: (teamName: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon";
}

export function FavoriteButton({
  teamName,
  isFavorite,
  onToggle,
  size = "md",
  variant = "icon",
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (variant === "button") {
    return (
      <Button
        variant={isFavorite ? "default" : "outline"}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(teamName);
        }}
        className="ios-button-press ios-haptic flex items-center gap-2"
      >
        <motion.div
          animate={{ scale: isFavorite ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Heart
            className={`${iconSizes.sm} ${isFavorite ? "fill-current" : ""}`}
          />
        </motion.div>
        {isFavorite ? "Following" : "Follow"}
      </Button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(teamName);
      }}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ios-button-press ios-haptic ${
        isFavorite
          ? "bg-red-500 text-white"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      <motion.div
        animate={{
          scale: isFavorite ? [1, 1.3, 1] : 1,
          rotate: isFavorite ? [0, -10, 10, 0] : 0,
        }}
        transition={{
          duration: isFavorite ? 0.3 : 0.1,
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <Heart
          className={`${iconSizes[size]} ${isFavorite ? "fill-current" : ""}`}
        />
      </motion.div>
    </motion.button>
  );
}
