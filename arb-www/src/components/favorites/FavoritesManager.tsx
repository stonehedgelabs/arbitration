import { useState } from "react";
import { motion } from "motion/react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  IconButton,
  Dialog,
} from "@chakra-ui/react";
import { Settings, Star } from "lucide-react";

interface Team {
  id: string;
  name: string;
  league: string;
  leagueColor: string;
  city?: string;
}

interface FavoritesManagerProps {
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

const allTeams: Team[] = [
  // NFL Teams (32 teams)
  {
    id: "ari",
    name: "Arizona Cardinals",
    league: "NFL",
    leagueColor: "#97233F",
    city: "Arizona",
  },
  {
    id: "atl",
    name: "Atlanta Falcons",
    league: "NFL",
    leagueColor: "#A71930",
    city: "Atlanta",
  },
  {
    id: "bal",
    name: "Baltimore Ravens",
    league: "NFL",
    leagueColor: "#241773",
    city: "Baltimore",
  },
  {
    id: "buf",
    name: "Buffalo Bills",
    league: "NFL",
    leagueColor: "#00338D",
    city: "Buffalo",
  },
  {
    id: "car",
    name: "Carolina Panthers",
    league: "NFL",
    leagueColor: "#0085CA",
    city: "Carolina",
  },
  {
    id: "chi",
    name: "Chicago Bears",
    league: "NFL",
    leagueColor: "#0B162A",
    city: "Chicago",
  },
  {
    id: "cin",
    name: "Cincinnati Bengals",
    league: "NFL",
    leagueColor: "#FB4F14",
    city: "Cincinnati",
  },
  {
    id: "cle",
    name: "Cleveland Browns",
    league: "NFL",
    leagueColor: "#311D00",
    city: "Cleveland",
  },
  {
    id: "dal",
    name: "Dallas Cowboys",
    league: "NFL",
    leagueColor: "#003594",
    city: "Dallas",
  },
  {
    id: "den",
    name: "Denver Broncos",
    league: "NFL",
    leagueColor: "#FB4F14",
    city: "Denver",
  },
  {
    id: "det",
    name: "Detroit Lions",
    league: "NFL",
    leagueColor: "#0076B6",
    city: "Detroit",
  },
  {
    id: "gb",
    name: "Green Bay Packers",
    league: "NFL",
    leagueColor: "#203731",
    city: "Green Bay",
  },
  {
    id: "hou",
    name: "Houston Texans",
    league: "NFL",
    leagueColor: "#03202F",
    city: "Houston",
  },
  {
    id: "ind",
    name: "Indianapolis Colts",
    league: "NFL",
    leagueColor: "#002C5F",
    city: "Indianapolis",
  },
  {
    id: "jax",
    name: "Jacksonville Jaguars",
    league: "NFL",
    leagueColor: "#006778",
    city: "Jacksonville",
  },
  {
    id: "kc",
    name: "Kansas City Chiefs",
    league: "NFL",
    leagueColor: "#E31837",
    city: "Kansas City",
  },
  {
    id: "lv",
    name: "Las Vegas Raiders",
    league: "NFL",
    leagueColor: "#000000",
    city: "Las Vegas",
  },
  {
    id: "lac",
    name: "Los Angeles Chargers",
    league: "NFL",
    leagueColor: "#0080C6",
    city: "Los Angeles",
  },
  {
    id: "lar",
    name: "Los Angeles Rams",
    league: "NFL",
    leagueColor: "#003594",
    city: "Los Angeles",
  },
  {
    id: "mia",
    name: "Miami Dolphins",
    league: "NFL",
    leagueColor: "#008E97",
    city: "Miami",
  },
  {
    id: "min",
    name: "Minnesota Vikings",
    league: "NFL",
    leagueColor: "#4F2683",
    city: "Minnesota",
  },
  {
    id: "ne",
    name: "New England Patriots",
    league: "NFL",
    leagueColor: "#002244",
    city: "New England",
  },
  {
    id: "no",
    name: "New Orleans Saints",
    league: "NFL",
    leagueColor: "#D3BC8D",
    city: "New Orleans",
  },
  {
    id: "nyg",
    name: "New York Giants",
    league: "NFL",
    leagueColor: "#0B2265",
    city: "New York",
  },
  {
    id: "nyj",
    name: "New York Jets",
    league: "NFL",
    leagueColor: "#125740",
    city: "New York",
  },
  {
    id: "phi",
    name: "Philadelphia Eagles",
    league: "NFL",
    leagueColor: "#004C54",
    city: "Philadelphia",
  },
  {
    id: "pit",
    name: "Pittsburgh Steelers",
    league: "NFL",
    leagueColor: "#FFB612",
    city: "Pittsburgh",
  },
  {
    id: "sf",
    name: "San Francisco 49ers",
    league: "NFL",
    leagueColor: "#AA0000",
    city: "San Francisco",
  },
  {
    id: "sea",
    name: "Seattle Seahawks",
    league: "NFL",
    leagueColor: "#002244",
    city: "Seattle",
  },
  {
    id: "tb",
    name: "Tampa Bay Buccaneers",
    league: "NFL",
    leagueColor: "#D50A0A",
    city: "Tampa Bay",
  },
  {
    id: "ten",
    name: "Tennessee Titans",
    league: "NFL",
    leagueColor: "#0C2340",
    city: "Tennessee",
  },
  {
    id: "was",
    name: "Washington Commanders",
    league: "NFL",
    leagueColor: "#5A1414",
    city: "Washington",
  },

  // NBA Teams (30 teams)
  {
    id: "atl-nba",
    name: "Atlanta Hawks",
    league: "NBA",
    leagueColor: "#E03A3E",
    city: "Atlanta",
  },
  {
    id: "bos",
    name: "Boston Celtics",
    league: "NBA",
    leagueColor: "#007A33",
    city: "Boston",
  },
  {
    id: "bkn",
    name: "Brooklyn Nets",
    league: "NBA",
    leagueColor: "#000000",
    city: "Brooklyn",
  },
  {
    id: "cha",
    name: "Charlotte Hornets",
    league: "NBA",
    leagueColor: "#1D1160",
    city: "Charlotte",
  },
  {
    id: "chi-nba",
    name: "Chicago Bulls",
    league: "NBA",
    leagueColor: "#CE1141",
    city: "Chicago",
  },
  {
    id: "cle-nba",
    name: "Cleveland Cavaliers",
    league: "NBA",
    leagueColor: "#860038",
    city: "Cleveland",
  },
  {
    id: "dal-nba",
    name: "Dallas Mavericks",
    league: "NBA",
    leagueColor: "#00538C",
    city: "Dallas",
  },
  {
    id: "den-nba",
    name: "Denver Nuggets",
    league: "NBA",
    leagueColor: "#0E2240",
    city: "Denver",
  },
  {
    id: "det-nba",
    name: "Detroit Pistons",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Detroit",
  },
  {
    id: "gsw",
    name: "Golden State Warriors",
    league: "NBA",
    leagueColor: "#1D428A",
    city: "Golden State",
  },
  {
    id: "hou-nba",
    name: "Houston Rockets",
    league: "NBA",
    leagueColor: "#CE1141",
    city: "Houston",
  },
  {
    id: "ind-nba",
    name: "Indiana Pacers",
    league: "NBA",
    leagueColor: "#002D62",
    city: "Indiana",
  },
  {
    id: "lac-nba",
    name: "Los Angeles Clippers",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Los Angeles",
  },
  {
    id: "lal",
    name: "Los Angeles Lakers",
    league: "NBA",
    leagueColor: "#552583",
    city: "Los Angeles",
  },
  {
    id: "mem",
    name: "Memphis Grizzlies",
    league: "NBA",
    leagueColor: "#5D76A9",
    city: "Memphis",
  },
  {
    id: "mia-nba",
    name: "Miami Heat",
    league: "NBA",
    leagueColor: "#98002E",
    city: "Miami",
  },
  {
    id: "mil",
    name: "Milwaukee Bucks",
    league: "NBA",
    leagueColor: "#00471B",
    city: "Milwaukee",
  },
  {
    id: "min-nba",
    name: "Minnesota Timberwolves",
    league: "NBA",
    leagueColor: "#0C2340",
    city: "Minnesota",
  },
  {
    id: "no-nba",
    name: "New Orleans Pelicans",
    league: "NBA",
    leagueColor: "#0C2340",
    city: "New Orleans",
  },
  {
    id: "nyk",
    name: "New York Knicks",
    league: "NBA",
    leagueColor: "#006BB6",
    city: "New York",
  },
  {
    id: "okc",
    name: "Oklahoma City Thunder",
    league: "NBA",
    leagueColor: "#007AC1",
    city: "Oklahoma City",
  },
  {
    id: "orl",
    name: "Orlando Magic",
    league: "NBA",
    leagueColor: "#0077C0",
    city: "Orlando",
  },
  {
    id: "phi-nba",
    name: "Philadelphia 76ers",
    league: "NBA",
    leagueColor: "#006BB6",
    city: "Philadelphia",
  },
  {
    id: "phx",
    name: "Phoenix Suns",
    league: "NBA",
    leagueColor: "#1D1160",
    city: "Phoenix",
  },
  {
    id: "por",
    name: "Portland Trail Blazers",
    league: "NBA",
    leagueColor: "#E03A3E",
    city: "Portland",
  },
  {
    id: "sac",
    name: "Sacramento Kings",
    league: "NBA",
    leagueColor: "#5A2D81",
    city: "Sacramento",
  },
  {
    id: "sa",
    name: "San Antonio Spurs",
    league: "NBA",
    leagueColor: "#C4CED4",
    city: "San Antonio",
  },
  {
    id: "tor-nba",
    name: "Toronto Raptors",
    league: "NBA",
    leagueColor: "#CE1141",
    city: "Toronto",
  },
  {
    id: "utah",
    name: "Utah Jazz",
    league: "NBA",
    leagueColor: "#002B5C",
    city: "Utah",
  },
  {
    id: "was-nba",
    name: "Washington Wizards",
    league: "NBA",
    leagueColor: "#002B5C",
    city: "Washington",
  },

  // MLB Teams (30 teams)
  {
    id: "ari-mlb",
    name: "Arizona Diamondbacks",
    league: "MLB",
    leagueColor: "#A71930",
    city: "Arizona",
  },
  {
    id: "atl-mlb",
    name: "Atlanta Braves",
    league: "MLB",
    leagueColor: "#CE1141",
    city: "Atlanta",
  },
  {
    id: "bal-mlb",
    name: "Baltimore Orioles",
    league: "MLB",
    leagueColor: "#DF4601",
    city: "Baltimore",
  },
  {
    id: "bos-mlb",
    name: "Boston Red Sox",
    league: "MLB",
    leagueColor: "#BD3039",
    city: "Boston",
  },
  {
    id: "chc",
    name: "Chicago Cubs",
    league: "MLB",
    leagueColor: "#0E3386",
    city: "Chicago",
  },
  {
    id: "cws",
    name: "Chicago White Sox",
    league: "MLB",
    leagueColor: "#27251F",
    city: "Chicago",
  },
  {
    id: "cin-mlb",
    name: "Cincinnati Reds",
    league: "MLB",
    leagueColor: "#C6011F",
    city: "Cincinnati",
  },
  {
    id: "cle-mlb",
    name: "Cleveland Guardians",
    league: "MLB",
    leagueColor: "#E31937",
    city: "Cleveland",
  },
  {
    id: "col",
    name: "Colorado Rockies",
    league: "MLB",
    leagueColor: "#33006F",
    city: "Colorado",
  },
  {
    id: "det-mlb",
    name: "Detroit Tigers",
    league: "MLB",
    leagueColor: "#0C2340",
    city: "Detroit",
  },
  {
    id: "hou-mlb",
    name: "Houston Astros",
    league: "MLB",
    leagueColor: "#002D62",
    city: "Houston",
  },
  {
    id: "kc-mlb",
    name: "Kansas City Royals",
    league: "MLB",
    leagueColor: "#BD9B60",
    city: "Kansas City",
  },
  {
    id: "laa",
    name: "Los Angeles Angels",
    league: "MLB",
    leagueColor: "#BA0021",
    city: "Los Angeles",
  },
  {
    id: "lad",
    name: "Los Angeles Dodgers",
    league: "MLB",
    leagueColor: "#005A9C",
    city: "Los Angeles",
  },
  {
    id: "mia-mlb",
    name: "Miami Marlins",
    league: "MLB",
    leagueColor: "#00A3E0",
    city: "Miami",
  },
  {
    id: "mil-mlb",
    name: "Milwaukee Brewers",
    league: "MLB",
    leagueColor: "#FFC52F",
    city: "Milwaukee",
  },
  {
    id: "min-mlb",
    name: "Minnesota Twins",
    league: "MLB",
    leagueColor: "#002B5C",
    city: "Minnesota",
  },
  {
    id: "nym",
    name: "New York Mets",
    league: "MLB",
    leagueColor: "#002D72",
    city: "New York",
  },
  {
    id: "nyy",
    name: "New York Yankees",
    league: "MLB",
    leagueColor: "#132448",
    city: "New York",
  },
  {
    id: "oak",
    name: "Oakland Athletics",
    league: "MLB",
    leagueColor: "#003831",
    city: "Oakland",
  },
  {
    id: "phi-mlb",
    name: "Philadelphia Phillies",
    league: "MLB",
    leagueColor: "#E81828",
    city: "Philadelphia",
  },
  {
    id: "pit-mlb",
    name: "Pittsburgh Pirates",
    league: "MLB",
    leagueColor: "#FDB827",
    city: "Pittsburgh",
  },
  {
    id: "sd",
    name: "San Diego Padres",
    league: "MLB",
    leagueColor: "#2F241D",
    city: "San Diego",
  },
  {
    id: "sf-mlb",
    name: "San Francisco Giants",
    league: "MLB",
    leagueColor: "#FD5A1E",
    city: "San Francisco",
  },
  {
    id: "sea-mlb",
    name: "Seattle Mariners",
    league: "MLB",
    leagueColor: "#0C2C56",
    city: "Seattle",
  },
  {
    id: "stl",
    name: "St. Louis Cardinals",
    league: "MLB",
    leagueColor: "#C41E3A",
    city: "St. Louis",
  },
  {
    id: "tb-mlb",
    name: "Tampa Bay Rays",
    league: "MLB",
    leagueColor: "#092C5C",
    city: "Tampa Bay",
  },
  {
    id: "tex",
    name: "Texas Rangers",
    league: "MLB",
    leagueColor: "#003278",
    city: "Texas",
  },
  {
    id: "tor-mlb",
    name: "Toronto Blue Jays",
    league: "MLB",
    leagueColor: "#134A8E",
    city: "Toronto",
  },
  {
    id: "was-mlb",
    name: "Washington Nationals",
    league: "MLB",
    leagueColor: "#AB0003",
    city: "Washington",
  },

  // NHL Teams (32 teams)
  {
    id: "ana",
    name: "Anaheim Ducks",
    league: "NHL",
    leagueColor: "#F47A38",
    city: "Anaheim",
  },
  {
    id: "bos-nhl",
    name: "Boston Bruins",
    league: "NHL",
    leagueColor: "#FFB81C",
    city: "Boston",
  },
  {
    id: "buf-nhl",
    name: "Buffalo Sabres",
    league: "NHL",
    leagueColor: "#002E62",
    city: "Buffalo",
  },
  {
    id: "cal",
    name: "Calgary Flames",
    league: "NHL",
    leagueColor: "#C8102E",
    city: "Calgary",
  },
  {
    id: "car-nhl",
    name: "Carolina Hurricanes",
    league: "NHL",
    leagueColor: "#CC0000",
    city: "Carolina",
  },
  {
    id: "chi-nhl",
    name: "Chicago Blackhawks",
    league: "NHL",
    leagueColor: "#CF0A2C",
    city: "Chicago",
  },
  {
    id: "col-nhl",
    name: "Colorado Avalanche",
    league: "NHL",
    leagueColor: "#6F263D",
    city: "Colorado",
  },
  {
    id: "cbj",
    name: "Columbus Blue Jackets",
    league: "NHL",
    leagueColor: "#00214B",
    city: "Columbus",
  },
  {
    id: "dal-nhl",
    name: "Dallas Stars",
    league: "NHL",
    leagueColor: "#006847",
    city: "Dallas",
  },
  {
    id: "det-nhl",
    name: "Detroit Red Wings",
    league: "NHL",
    leagueColor: "#CE1126",
    city: "Detroit",
  },
  {
    id: "edm",
    name: "Edmonton Oilers",
    league: "NHL",
    leagueColor: "#041E42",
    city: "Edmonton",
  },
  {
    id: "fla",
    name: "Florida Panthers",
    league: "NHL",
    leagueColor: "#041E42",
    city: "Florida",
  },
  {
    id: "la",
    name: "Los Angeles Kings",
    league: "NHL",
    leagueColor: "#A2AAAD",
    city: "Los Angeles",
  },
  {
    id: "min-nhl",
    name: "Minnesota Wild",
    league: "NHL",
    leagueColor: "#154734",
    city: "Minnesota",
  },
  {
    id: "mtl",
    name: "Montreal Canadiens",
    league: "NHL",
    leagueColor: "#AF1E2D",
    city: "Montreal",
  },
  {
    id: "nsh",
    name: "Nashville Predators",
    league: "NHL",
    leagueColor: "#FFB81C",
    city: "Nashville",
  },
  {
    id: "nj",
    name: "New Jersey Devils",
    league: "NHL",
    leagueColor: "#CE1126",
    city: "New Jersey",
  },
  {
    id: "nyi",
    name: "New York Islanders",
    league: "NHL",
    leagueColor: "#F47D30",
    city: "New York",
  },
  {
    id: "nyr",
    name: "New York Rangers",
    league: "NHL",
    leagueColor: "#0038A8",
    city: "New York",
  },
  {
    id: "ott",
    name: "Ottawa Senators",
    league: "NHL",
    leagueColor: "#C52032",
    city: "Ottawa",
  },
  {
    id: "phi-nhl",
    name: "Philadelphia Flyers",
    league: "NHL",
    leagueColor: "#F74902",
    city: "Philadelphia",
  },
  {
    id: "pit-nhl",
    name: "Pittsburgh Penguins",
    league: "NHL",
    leagueColor: "#FCB514",
    city: "Pittsburgh",
  },
  {
    id: "sj",
    name: "San Jose Sharks",
    league: "NHL",
    leagueColor: "#006D75",
    city: "San Jose",
  },
  {
    id: "sea-nhl",
    name: "Seattle Kraken",
    league: "NHL",
    leagueColor: "#001628",
    city: "Seattle",
  },
  {
    id: "stl-nhl",
    name: "St. Louis Blues",
    league: "NHL",
    leagueColor: "#002F87",
    city: "St. Louis",
  },
  {
    id: "tb-nhl",
    name: "Tampa Bay Lightning",
    league: "NHL",
    leagueColor: "#002868",
    city: "Tampa Bay",
  },
  {
    id: "tor-nhl",
    name: "Toronto Maple Leafs",
    league: "NHL",
    leagueColor: "#003E7E",
    city: "Toronto",
  },
  {
    id: "van",
    name: "Vancouver Canucks",
    league: "NHL",
    leagueColor: "#001F5C",
    city: "Vancouver",
  },
  {
    id: "vgk",
    name: "Vegas Golden Knights",
    league: "NHL",
    leagueColor: "#B4975A",
    city: "Vegas",
  },
  {
    id: "was-nhl",
    name: "Washington Capitals",
    league: "NHL",
    leagueColor: "#C8102E",
    city: "Washington",
  },
  {
    id: "wpg",
    name: "Winnipeg Jets",
    league: "NHL",
    leagueColor: "#041E42",
    city: "Winnipeg",
  },

  // MLS Teams (29 teams)
  {
    id: "atl-mls",
    name: "Atlanta United FC",
    league: "MLS",
    leagueColor: "#800080",
    city: "Atlanta",
  },
  {
    id: "austin",
    name: "Austin FC",
    league: "MLS",
    leagueColor: "#00B140",
    city: "Austin",
  },
  {
    id: "charlotte",
    name: "Charlotte FC",
    league: "MLS",
    leagueColor: "#000000",
    city: "Charlotte",
  },
  {
    id: "chicago-mls",
    name: "Chicago Fire FC",
    league: "MLS",
    leagueColor: "#0C2340",
    city: "Chicago",
  },
  {
    id: "cincinnati",
    name: "FC Cincinnati",
    league: "MLS",
    leagueColor: "#FF6B35",
    city: "Cincinnati",
  },
  {
    id: "columbus",
    name: "Columbus Crew",
    league: "MLS",
    leagueColor: "#000000",
    city: "Columbus",
  },
  {
    id: "colorado",
    name: "Colorado Rapids",
    league: "MLS",
    leagueColor: "#862633",
    city: "Colorado",
  },
  {
    id: "dc",
    name: "D.C. United",
    league: "MLS",
    leagueColor: "#000000",
    city: "Washington",
  },
  {
    id: "dallas",
    name: "FC Dallas",
    league: "MLS",
    leagueColor: "#DC143C",
    city: "Dallas",
  },
  {
    id: "houston-mls",
    name: "Houston Dynamo FC",
    league: "MLS",
    leagueColor: "#F68712",
    city: "Houston",
  },
  {
    id: "inter-miami",
    name: "Inter Miami CF",
    league: "MLS",
    leagueColor: "#000000",
    city: "Miami",
  },
  {
    id: "kansas-city",
    name: "Sporting Kansas City",
    league: "MLS",
    leagueColor: "#0C2340",
    city: "Kansas City",
  },
  {
    id: "lafc",
    name: "Los Angeles FC",
    league: "MLS",
    leagueColor: "#000000",
    city: "Los Angeles",
  },
  {
    id: "lag",
    name: "LA Galaxy",
    league: "MLS",
    leagueColor: "#00245D",
    city: "Los Angeles",
  },
  {
    id: "minnesota",
    name: "Minnesota United FC",
    league: "MLS",
    leagueColor: "#7C0029",
    city: "Minnesota",
  },
  {
    id: "montreal",
    name: "CF Montréal",
    league: "MLS",
    leagueColor: "#000000",
    city: "Montreal",
  },
  {
    id: "nashville",
    name: "Nashville SC",
    league: "MLS",
    leagueColor: "#FFD100",
    city: "Nashville",
  },
  {
    id: "new-england",
    name: "New England Revolution",
    league: "MLS",
    leagueColor: "#00214E",
    city: "New England",
  },
  {
    id: "nycfc",
    name: "New York City FC",
    league: "MLS",
    leagueColor: "#6C5CE7",
    city: "New York",
  },
  {
    id: "nyrb",
    name: "New York Red Bulls",
    league: "MLS",
    leagueColor: "#E3131B",
    city: "New York",
  },
  {
    id: "orlando",
    name: "Orlando City SC",
    league: "MLS",
    leagueColor: "#6C1D45",
    city: "Orlando",
  },
  {
    id: "philadelphia",
    name: "Philadelphia Union",
    league: "MLS",
    leagueColor: "#000000",
    city: "Philadelphia",
  },
  {
    id: "portland",
    name: "Portland Timbers",
    league: "MLS",
    leagueColor: "#004812",
    city: "Portland",
  },
  {
    id: "real-salt-lake",
    name: "Real Salt Lake",
    league: "MLS",
    leagueColor: "#A50531",
    city: "Salt Lake City",
  },
  {
    id: "san-jose",
    name: "San Jose Earthquakes",
    league: "MLS",
    leagueColor: "#0066CC",
    city: "San Jose",
  },
  {
    id: "seattle",
    name: "Seattle Sounders FC",
    league: "MLS",
    leagueColor: "#4A90E2",
    city: "Seattle",
  },
  {
    id: "st-louis",
    name: "St. Louis CITY SC",
    league: "MLS",
    leagueColor: "#C8102E",
    city: "St. Louis",
  },
  {
    id: "toronto",
    name: "Toronto FC",
    league: "MLS",
    leagueColor: "#E31837",
    city: "Toronto",
  },
  {
    id: "vancouver",
    name: "Vancouver Whitecaps FC",
    league: "MLS",
    leagueColor: "#00245E",
    city: "Vancouver",
  },
];

export function FavoritesManager({
  favoriteTeams,
  onToggleFavorite,
}: FavoritesManagerProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>("all");

  const leagues = ["all", "NFL", "NBA", "MLB", "NHL", "MLS"];

  const filteredTeams =
    selectedLeague === "all"
      ? allTeams
      : allTeams.filter((team) => team.league === selectedLeague);

  const isFavorite = (teamName: string) => favoriteTeams.includes(teamName);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <IconButton variant="ghost" size="sm" aria-label="Manage favorites">
          <Box w="5" h="5">
            <Settings size={20} />
          </Box>
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW="md"
          w="90vw"
          maxH="80vh"
          h="80vh"
          borderRadius="16px"
          bg="#030213"
          display="flex"
          flexDirection="column"
        >
          <Dialog.Header textAlign="left" pb="4">
            <Dialog.Title fontSize="lg" fontWeight="bold" color="text.400">
              Favorite Teams
            </Dialog.Title>
            <Dialog.Description fontSize="sm" color="gray.400" mt="1">
              Select your favorite teams to personalize your For You feed. You
              have {favoriteTeams.length} favorites.
            </Dialog.Description>
          </Dialog.Header>

          <Dialog.Body
            flex="1"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            {/* League Filter */}
            <HStack
              gap="2"
              mb="4"
              overflowX="auto"
              className="scrollbar-hide"
              pb="2"
              css={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {leagues.map((league) => (
                <Button
                  key={league}
                  variant={selectedLeague === league ? "solid" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLeague(league)}
                  flexShrink="0"
                  minW="fit-content"
                  whiteSpace="nowrap"
                  borderRadius="12px"
                  bg={selectedLeague === league ? "white" : "transparent"}
                  color={selectedLeague === league ? "black" : "white"}
                  borderColor="white"
                >
                  {league === "all" ? "All Leagues" : league}
                </Button>
              ))}
            </HStack>

            {/* Teams Grid */}
            <VStack gap="3" overflowY="auto" flex="1" align="stretch">
              {leagues
                .filter((l) => l !== "all")
                .map((league) => {
                  const leagueTeams = filteredTeams.filter((team) =>
                    selectedLeague === "all"
                      ? team.league === league
                      : team.league === selectedLeague,
                  );

                  if (leagueTeams.length === 0 || selectedLeague !== "all")
                    return null;

                  return (
                    <VStack key={league} gap="2" align="stretch">
                      <HStack gap="2">
                        <Badge
                          variant="outline"
                          borderColor={leagueTeams[0]?.leagueColor}
                          fontSize="xs"
                          color="text.400"
                          bg="transparent"
                        >
                          {league}
                        </Badge>
                        <Text fontSize="xs" color="gray.400">
                          {
                            favoriteTeams.filter((fav) =>
                              leagueTeams.some((team) => team.name === fav),
                            ).length
                          }{" "}
                          favorites
                        </Text>
                      </HStack>
                      <VStack gap="2" align="stretch">
                        {leagueTeams.map((team) => (
                          <TeamCard
                            key={team.id}
                            team={team}
                            isFavorite={isFavorite(team.name)}
                            onToggle={() => onToggleFavorite(team.name)}
                          />
                        ))}
                      </VStack>
                    </VStack>
                  );
                })}

              {/* Show filtered results if a specific league is selected */}
              {selectedLeague !== "all" && (
                <VStack gap="2" align="stretch">
                  {filteredTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      isFavorite={isFavorite(team.name)}
                      onToggle={() => onToggleFavorite(team.name)}
                    />
                  ))}
                </VStack>
              )}
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

function TeamCard({
  team,
  isFavorite,
  onToggle,
}: {
  team: Team;
  isFavorite: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      onClick={onToggle}
      p="3"
      borderRadius="16px"
      bg="rgba(255, 255, 255, 0.05)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      cursor="pointer"
      transition="all 0.2s"
      _active={{ transform: "scale(0.98)" }}
    >
      <Flex justify="space-between" align="center">
        <HStack gap="3">
          <Flex
            w="8"
            h="8"
            borderRadius="full"
            align="center"
            justify="center"
            bg={team.leagueColor}
            color="text.400"
            fontSize="xs"
            fontWeight="medium"
          >
            {team.name
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("")}
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="text.400">
              {team.name}
            </Text>
            <Text fontSize="xs" color="gray.400">
              {team.league}
            </Text>
          </Box>
        </HStack>

        <motion.div
          animate={{ scale: isFavorite ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isFavorite ? (
            <Flex
              w="8"
              h="8"
              bg="red.500"
              borderRadius="full"
              align="center"
              justify="center"
            >
              <Box w="4" h="4" color="text.400">
                <Star size={16} fill="currentColor" />
              </Box>
            </Flex>
          ) : (
            <Flex
              w="8"
              h="8"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
              align="center"
              justify="center"
            >
              <Box w="4" h="4" color="gray.400">
                <Star size={16} />
              </Box>
            </Flex>
          )}
        </motion.div>
      </Flex>
    </Box>
  );
}
