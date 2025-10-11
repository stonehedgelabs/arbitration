import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import {
  setSelectedLeague,
  setSelectedDate,
} from "../store/slices/sportsDataSlice.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { Toggle } from "./Toggle";
import { League as ConfigLeague } from "./../config.ts";
import { getCurrentLocalDate } from "../utils.ts";

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

  // Convert leagues to toggle items
  const leagueItems = leagues.map((league) => ({
    id: league.id,
    label: league.name,
    value: league.id,
    abbreviation: league.abbreviation,
    disabled: league.id === ConfigLeague.NHL || league.id === ConfigLeague.MLS, // Disable NHL and MLS
  }));

  return (
    <Toggle
      variant="league-buttons"
      connected={true}
      items={leagueItems}
      selectedValue={selectedLeague}
      onSelectionChange={handleLeagueChange}
    />
  );
}
