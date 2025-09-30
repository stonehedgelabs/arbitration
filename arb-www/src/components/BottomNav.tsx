import { User, Trophy, Play, Users, DollarSign } from "lucide-react";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { setActiveTab } from "../store/slices/sportsDataSlice.ts";

export function BottomNav() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.sportsData.activeTab);

  const handleTabChange = (tabId: string) => {
    dispatch(setActiveTab(tabId));
  };
  const tabs = [
    { id: "for-you", label: "For You", icon: User },
    { id: "scores", label: "Scores", icon: Trophy },
    { id: "play-by-play", label: "Live", icon: Play },
    { id: "social", label: "Social", icon: Users },
    { id: "bet", label: "Bet", icon: DollarSign },
  ];

  return (
    <Box
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      px="2"
      py="2"
      pb="calc(0.5rem + env(safe-area-inset-bottom))"
    >
      <HStack justify="space-around" align="center" gap="0">
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
                <Box w="5" h="5" color={isActive ? "red.500" : "gray.500"}>
                  <Icon size={20} />
                </Box>
              </Box>
              <Text
                fontSize="xs"
                color={isActive ? "red.500" : "gray.500"}
                fontWeight="normal"
                transition="all 0.2s"
              >
                {tab.label}
              </Text>
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
}
