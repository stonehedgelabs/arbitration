import { Button } from "./ui/button";
import { User, Trophy, Play, Users, DollarSign } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
}: MobileBottomNavProps) {
  const tabs = [
    { id: "for-you", label: "For You", icon: User },
    { id: "scores", label: "Scores", icon: Trophy },
    { id: "play-by-play", label: "Live", icon: Play },
    { id: "social", label: "Social", icon: Users },
    { id: "bet", label: "Bet", icon: DollarSign },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
