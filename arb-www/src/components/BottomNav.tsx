import { Trophy, Play, Users } from "lucide-react";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import { useAppSelector } from "../store/hooks.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggleSimple } from "./ThemeToggle";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  const handleTabChange = (tabId: string) => {
    switch (tabId) {
      // case "for-you":
      //   navigate("/fyp");
      //   break;
      case "scores":
        navigate(`/scores/${selectedLeague}`);
        break;
      case "play-by-play":
        navigate(`/live/${selectedLeague}`);
        break;
      case "social":
        navigate(`/social/${selectedLeague}`);
        break;
      // case "bet":
      //   navigate("/bet");
      //   break;
    }
  };

  // Determine active tab from current location
  const getActiveTab = () => {
    const path = location.pathname;
    // if (path === "/fyp") return "for-you"; // Commented out - For You tab is hidden
    if (path.startsWith("/scores")) return "scores";
    if (path.startsWith("/live")) return "play-by-play";
    if (path.startsWith("/social")) return "social";
    // if (path === "/bet") return "bet"; // Commented out - Bet tab is hidden
    return "scores"; // default to scores since for-you is hidden
  };

  const activeTab = getActiveTab();
  const tabs = [
    // { id: "for-you", label: "For You", icon: User },
    { id: "scores", label: "Scores", icon: Trophy },
    { id: "play-by-play", label: "Live", icon: Play },
    { id: "social", label: "Social", icon: Users },
    // { id: "bet", label: "Bet", icon: DollarSign },
  ];

  return (
    <Box
      bg="primary.25"
      borderTop="1px"
      borderColor="border.100"
      px="2"
      py="2"
      pb="calc(0.5rem + env(safe-area-inset-bottom))"
    >
      <HStack justify="space-between" align="center" gap="0">
        <HStack justify="space-around" align="center" gap="0" flex="1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <VStack
                key={tab.id}
                gap="1"
                align="center"
                cursor="pointer"
                onClick={() => handleTabChange(tab.id)}
                _active={{ transform: "scale(0.95)" }}
                transition="all 0.2s"
                flex="1"
              >
                <Box
                  w="10"
                  h="10"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  bg="transparent"
                  transition="all 0.2s"
                >
                  <Box w="5" h="5" color={isActive ? "accent.100" : "text.300"}>
                    <Icon size={20} />
                  </Box>
                </Box>
                <Text
                  fontSize="xs"
                  color={isActive ? "accent.100" : "text.300"}
                  fontWeight="normal"
                  transition="all 0.2s"
                >
                  {tab.label}
                </Text>
              </VStack>
            );
          })}
        </HStack>

        {/* Theme toggle - positioned on the right */}
        <Box ml="2">
          <ThemeToggleSimple size="sm" />
        </Box>
      </HStack>
    </Box>
  );
}
