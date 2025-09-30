import { Button, Box, HStack } from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSelectedLeague } from "../store/slices/sportsDataSlice";

export interface League {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export function LeagueSelector() {
  const dispatch = useAppDispatch();
  const leagues = useAppSelector((state) => state.sportsData.leagues);
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  const handleLeagueChange = (leagueId: string) => {
    dispatch(setSelectedLeague(leagueId));
  };
  const getLeagueColors = (isSelected: boolean) => {
    if (isSelected) {
      // Active state - dark background with light text
      return {
        bg: "gray.600",
        border: "gray.600",
        text: "white",
      };
    } else {
      // Default state - white background with dark outline and text
      return {
        bg: "white",
        border: "gray.600",
        text: "gray.600",
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
                bg: isSelected ? colors.bg : "gray.50",
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
