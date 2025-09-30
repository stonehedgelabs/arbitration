import { useState } from "react";
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
} from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { setFavoriteTeams } from "../store/slices/favoritesSlice.ts";

interface Team {
  id: string;
  name: string;
  league: string;
  leagueColor: string;
  city?: string;
}

const popularTeams: Team[] = [
  // NFL Teams
  {
    id: "dal",
    name: "Dallas Cowboys",
    league: "NFL",
    leagueColor: "#013369",
    city: "Dallas",
  },
  {
    id: "gb",
    name: "Green Bay Packers",
    league: "NFL",
    leagueColor: "#013369",
    city: "Green Bay",
  },
  {
    id: "ne",
    name: "New England Patriots",
    league: "NFL",
    leagueColor: "#013369",
    city: "New England",
  },
  {
    id: "kc",
    name: "Kansas City Chiefs",
    league: "NFL",
    leagueColor: "#013369",
    city: "Kansas City",
  },
  {
    id: "sf",
    name: "San Francisco 49ers",
    league: "NFL",
    leagueColor: "#013369",
    city: "San Francisco",
  },
  {
    id: "buf",
    name: "Buffalo Bills",
    league: "NFL",
    leagueColor: "#013369",
    city: "Buffalo",
  },

  // NBA Teams
  {
    id: "lal",
    name: "Los Angeles Lakers",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Los Angeles",
  },
  {
    id: "bos",
    name: "Boston Celtics",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Boston",
  },
  {
    id: "gsw",
    name: "Golden State Warriors",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Golden State",
  },
  {
    id: "mia",
    name: "Miami Heat",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Miami",
  },

  // MLB Teams
  {
    id: "nyy",
    name: "New York Yankees",
    league: "MLB",
    leagueColor: "#002D72",
    city: "New York",
  },
  {
    id: "bos-mlb",
    name: "Boston Red Sox",
    league: "MLB",
    leagueColor: "#002D72",
    city: "Boston",
  },
  {
    id: "lad",
    name: "Los Angeles Dodgers",
    league: "MLB",
    leagueColor: "#002D72",
    city: "Los Angeles",
  },
  {
    id: "sf-mlb",
    name: "San Francisco Giants",
    league: "MLB",
    leagueColor: "#002D72",
    city: "San Francisco",
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const handleComplete = () => {
    if (selectedTeams.length > 0 && userType) {
      dispatch(setFavoriteTeams({ teams: selectedTeams, userType }));
    }
    navigate("/app");
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
    navigate("/app");
  };

  return (
    <Box minH="100vh" w="100vw" display="flex" flexDirection="column">
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
              <Heart className="w-8 h-8 text-white" />
            </Box>
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold">
                Follow Your Teams
              </Text>
              <Text color="gray.600" textAlign="center">
                {userType === "guest"
                  ? "Select teams to see personalized content in your For You feed"
                  : "Choose your favorite teams to get personalized updates and content"}
              </Text>
            </VStack>
          </VStack>

          {/* Team Selection */}
          <VStack gap="6" mt="8">
            {/* Popular Teams by League */}
            {["NFL", "NBA", "MLB"].map((league) => {
              const leagueTeams = popularTeams.filter(
                (team) => team.league === league,
              );
              const leagueColor = leagueTeams[0]?.leagueColor;

              return (
                <Box key={league} w="full">
                  <HStack gap="2" mb="3">
                    <Badge
                      variant="outline"
                      style={{ borderColor: leagueColor, color: leagueColor }}
                    >
                      {league}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {
                        selectedTeams.filter((team) =>
                          leagueTeams.some((t) => t.name === team),
                        ).length
                      }{" "}
                      selected
                    </Text>
                  </HStack>
                  <VStack gap="2" w="full">
                    {leagueTeams.map((team) => (
                      <Card.Root
                        key={team.id}
                        w="full"
                        cursor="pointer"
                        onClick={() => toggleTeam(team.name)}
                        borderWidth="1px"
                        borderColor={
                          selectedTeams.includes(team.name)
                            ? "blue.500"
                            : "gray.200"
                        }
                        bg={
                          selectedTeams.includes(team.name)
                            ? "blue.50"
                            : "white"
                        }
                        _hover={{ bg: "gray.50" }}
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
                                color="white"
                                fontSize="xs"
                                fontWeight="medium"
                                style={{ backgroundColor: team.leagueColor }}
                              >
                                {team.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .slice(0, 2)
                                  .join("")}
                              </Box>
                              <VStack align="start" gap="0">
                                <Text fontSize="sm" fontWeight="medium">
                                  {team.name}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
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
                                  bg="blue.500"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </Box>
                              ) : (
                                <Box
                                  w="6"
                                  h="6"
                                  borderWidth="2px"
                                  borderColor="gray.300"
                                  borderRadius="full"
                                />
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
        bg="white"
        borderTop="1px"
        borderColor="gray.200"
        p="4"
        pb="calc(1rem + env(safe-area-inset-bottom))"
      >
        <VStack gap="3">
          <Button
            onClick={handleContinue}
            w="full"
            h="12"
            disabled={selectedTeams.length === 0}
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
          >
            <HStack>
              <Text>
                Continue with {selectedTeams.length} team
                {selectedTeams.length !== 1 ? "s" : ""}
              </Text>
              <ArrowRight className="w-4 h-4" />
            </HStack>
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            w="full"
            h="12"
            color="gray.600"
            _hover={{ bg: "gray.100" }}
          >
            Skip for now
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
