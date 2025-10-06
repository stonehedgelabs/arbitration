import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Heart, ArrowRight } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Box,
  VStack,
  Text,
  HStack,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { setFavoriteTeams } from "../store/slices/favoritesSlice.ts";
import { SearchBar } from "./SearchBar";
import { allTeams, Team } from "../teams";

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const leagues = ["all", "NFL", "NBA", "MLB", "NHL", "MLS"];
  const leagueCollection = createListCollection({ items: leagues });

  // Filter teams based on selected league and search query
  const filteredTeams = useMemo(() => {
    let filtered = allTeams;

    // Filter by league
    if (selectedLeague !== "all") {
      filtered = filtered.filter((team) => team.league === selectedLeague);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          team.city?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [selectedLeague, searchQuery]);

  // Get teams by league for display
  const teamsByLeague = useMemo(() => {
    const grouped: { [key: string]: Team[] } = {};

    filteredTeams.forEach((team) => {
      if (!grouped[team.league]) {
        grouped[team.league] = [];
      }
      grouped[team.league].push(team);
    });

    return grouped;
  }, [filteredTeams]);

  const handleComplete = () => {
    if (selectedTeams.length > 0 && userType) {
      dispatch(setFavoriteTeams({ teams: selectedTeams, userType }));
    }
    navigate("/scores/nfl");
  };

  const toggleTeam = (teamName: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName)
        ? prev.filter((team) => team !== teamName)
        : [...prev, teamName],
    );
  };

  const handleContinue = () => {
    handleComplete();
  };

  const handleSkip = () => {
    navigate("/scores/nfl");
  };

  return (
    <Box
      minH="100vh"
      w="100vw"
      display="flex"
      flexDirection="column"
      bg="primary.25"
    >
      {/* Skip Button - Top Right */}
      <Box position="absolute" top="4" right="4" zIndex="10">
        <Button
          variant="ghost"
          onClick={handleSkip}
          size="xs"
          bg={"primary.300"}
          color="text.400"
          fontSize="xs"
          px="2"
          py="1"
        >
          Skip
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ marginLeft: "4px" }}
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </Button>
      </Box>

      {/* Scrollable Content */}
      <Box flex={1} overflowY="auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ padding: "1rem", paddingBottom: "8rem" }}
        >
          {/* Header */}
          <VStack gap="8" textAlign="center" pt="8">
            <Box
              w="64px"
              h="64px"
              bg="linear-gradient(to bottom right, #030213, #030213cc)"
              borderRadius="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
            >
              <Heart className="w-8 h-8" color={"white"} />
            </Box>
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold">
                Follow Your Teams
              </Text>
              <Text color="gray.400" textAlign="center">
                {userType === "guest"
                  ? "Select teams to see personalized content in your For You feed"
                  : "Choose your favorite teams to get personalized updates and content"}
              </Text>
            </VStack>
          </VStack>

          {/* League Selector and Search */}
          <VStack gap="4" mt="8">
            {/* League Dropdown */}
            <Box w="full" fontSize={"sm"}>
              <Text fontSize="sm" fontWeight="medium" mb="2" color="text.400">
                Select League
              </Text>
              <Select.Root
                value={[selectedLeague]}
                onValueChange={(details) => setSelectedLeague(details.value[0])}
                collection={leagueCollection}
              >
                <Select.Trigger w="full" bg="primary.25" borderColor="text.400">
                  <Select.ValueText placeholder="Select League" />
                </Select.Trigger>
                <Select.Content bg="primary.100">
                  {leagues.map((league) => (
                    <Select.Item key={league} item={league}>
                      {league === "all" ? "All Leagues" : league}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {/* Search Input */}
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb="2" color="text.400">
                Search Teams
              </Text>
              <SearchBar
                placeholder="Search by team name or city..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={() => {}} // No-op since we're filtering in real-time
              />
            </Box>

            {/* Selected Teams Count */}
            <Box w="full">
              <Text fontSize="sm" color="text.500">
                {selectedTeams.length} team
                {selectedTeams.length !== 1 ? "s" : ""} selected
              </Text>
            </Box>
          </VStack>

          {/* Team Selection */}
          <VStack gap="6" mt="6">
            {Object.entries(teamsByLeague).map(([league, leagueTeams]) => {
              const leagueColor = leagueTeams[0]?.leagueColor;
              const selectedInLeague = selectedTeams.filter((team) =>
                leagueTeams.some((t) => t.name === team),
              ).length;

              return (
                <Box key={league} w="full">
                  <HStack gap="2" mb="3">
                    <Badge bg="primary.25" color={leagueColor}>
                      {league}
                    </Badge>
                    <Text fontSize="xs" color="gray.600">
                      {selectedInLeague} of {leagueTeams.length} selected
                    </Text>
                  </HStack>
                  <VStack gap="2" w="full">
                    {leagueTeams.map((team) => (
                      <Card.Root
                        key={team.id}
                        w="full"
                        cursor="pointer"
                        onClick={() => toggleTeam(team.name)}
                        bg={
                          selectedTeams.includes(team.name)
                            ? "accent.400"
                            : "primary.25"
                        }
                        border="1px"
                        borderColor="text.400"
                        transition="all 0.2s"
                      >
                        <Card.Body p="3">
                          <HStack justify="space-between" w="full">
                            <HStack gap="3">
                              <Box
                                w="8"
                                h="8"
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="text.100"
                                fontSize="xs"
                                fontWeight="medium"
                                bg={team.leagueColor}
                              >
                                {team.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .slice(0, 2)
                                  .join("")}
                              </Box>
                              <VStack align="start" gap="0">
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  color="text.100"
                                >
                                  {team.name}
                                </Text>
                                <Text fontSize="xs" color="text.100">
                                  {team.city}
                                </Text>
                              </VStack>
                            </HStack>

                            <motion.div
                              animate={{
                                scale: selectedTeams.includes(team.name)
                                  ? 1.1
                                  : 1,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                            >
                              {selectedTeams.includes(team.name) ? (
                                <Box
                                  w="6"
                                  h="6"
                                  bg="primary.25"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Check
                                    height={"16"}
                                    width="16"
                                    color={"white"}
                                  />
                                </Box>
                              ) : (
                                <Box w="6" h="6" borderRadius="full" />
                              )}
                            </motion.div>
                          </HStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        </motion.div>
      </Box>

      {/* Fixed Bottom Actions */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        // bg="primary.400"
        borderTop="1px"
        borderColor="gray.200"
        p="4"
        pb="calc(1rem + env(safe-area-inset-bottom))"
      >
        <Button
          onClick={handleContinue}
          w="full"
          h="12"
          disabled={selectedTeams.length === 0}
          bg="buttons.primary.bg"
          color="text.100"
          _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
        >
          <HStack>
            <Text>
              Continue with {selectedTeams.length} team
              {selectedTeams.length !== 1 ? "s" : ""}
            </Text>
            <ArrowRight color="accent.400" className="w-4 h-4" />
          </HStack>
        </Button>
      </Box>
    </Box>
  );
}
