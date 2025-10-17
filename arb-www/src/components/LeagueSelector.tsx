import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import {
  setSelectedLeague,
  setSelectedDate,
} from "../store/slices/sportsDataSlice.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { Select, createListCollection, HStack, Icon } from "@chakra-ui/react";
import { League as ConfigLeague } from "./../config.ts";
import { getCurrentLocalDate } from "../utils.ts";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleLeagueChange = (leagueId: string) => {
    dispatch(setSelectedLeague(leagueId));

    // Reset date to today when league changes
    dispatch(setSelectedDate(getCurrentLocalDate()));

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

  // Create collection for the select
  const leagueCollection = createListCollection({
    items: leagues.map((league) => ({
      label: league.abbreviation,
      value: league.id,
      disabled:
        league.id === ConfigLeague.NHL || league.id === ConfigLeague.MLS,
    })),
  });

  return (
    <Select.Root
      collection={leagueCollection}
      value={[selectedLeague]}
      onValueChange={(e) => handleLeagueChange(e.value[0])}
      onOpenChange={(e) => setIsOpen(e.open)}
      size="sm"
      variant="outline"
      bg="primary.25"
      borderColor="text.200"
      color="text.500"
      w="22"
      _focus={{
        borderColor: "accent.400",
        boxShadow: "0 0 0 1px var(--chakra-colors-accent-400)",
      }}
    >
      <Select.Trigger>
        <HStack justify="space-between" w="full">
          <Select.ValueText placeholder="League" fontSize="xs" />
          <Icon boxSize="3" color="text.400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isOpen ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
            </svg>
          </Icon>
        </HStack>
      </Select.Trigger>
      <Select.Content
        bg="primary.100"
        borderColor="text.200"
        color="text.500"
        boxShadow="lg"
        zIndex="50"
        position="absolute"
        top="100%"
        left="0"
        right="0"
        mt="1"
      >
        {leagues.map((league) => {
          const isDisabled =
            league.id === ConfigLeague.NHL || league.id === ConfigLeague.MLS;
          return (
            <Select.Item
              key={league.id}
              item={league.id}
              opacity={isDisabled ? 0.5 : 1}
              cursor={isDisabled ? "not-allowed" : "pointer"}
              _selected={{
                bg: "primary.300",
                color: "text.500",
              }}
            >
              {league.abbreviation}
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
