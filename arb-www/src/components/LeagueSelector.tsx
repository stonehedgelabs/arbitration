import { Button, Box, HStack } from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { setSelectedLeague } from "../store/slices/sportsDataSlice.ts";
import { useNavigate, useLocation } from "react-router-dom";

export interface League {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export function LeagueSelector() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const leagues = useAppSelector((state) => state.sportsData.leagues);
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  const handleLeagueChange = (leagueId: string) => {
    dispatch(setSelectedLeague(leagueId));

    // Navigate to the appropriate URL based on current path
    const currentPath = location.pathname;
    if (currentPath.startsWith("/scores/")) {
      navigate(`/scores/${leagueId}`);
    } else if (currentPath.startsWith("/live/")) {
      navigate(`/live/${leagueId}`);
    } else if (currentPath.startsWith("/social/")) {
      navigate(`/social/${leagueId}`);
    } else {
      // Default to scores if we're on a different page
      navigate(`/scores/${leagueId}`);
    }
  };
  const getLeagueColors = (isSelected: boolean) => {
    if (isSelected) {
      // Active state - red background with white text
      return {
        bg: "red.500",
        border: "red.500",
        text: "white",
      };
    } else {
      // Default state - red outline with red text
      return {
        bg: "white",
        border: "red.500",
        text: "red.500",
      };
    }
  };

  return (
    <Box bg="white" p="4">
      {/* League selector buttons */}
      <HStack gap="2" justify="space-between">
        {leagues.map((league) => {
          const isSelected = selectedLeague === league.id;
          const colors = getLeagueColors(isSelected);

          return (
            <Button
              key={league.id}
              variant="outline"
              onClick={() => handleLeagueChange(league.id)}
              flex="1"
              h="10"
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
              whiteSpace="nowrap"
              bg={colors.bg}
              borderColor={colors.border}
              color={colors.text}
              borderWidth="1px"
              _hover={{
                bg: isSelected ? colors.bg : "red.50",
                transform: "scale(1.02)",
              }}
              _active={{
                transform: "scale(0.98)",
              }}
              transition="all 0.2s"
            >
              {league.abbreviation}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
}
