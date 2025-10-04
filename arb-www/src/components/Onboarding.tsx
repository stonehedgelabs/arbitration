import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Heart, ArrowRight, Search } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Box,
  VStack,
  Text,
  HStack,
  Input,
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
    city: "Minneapolis",
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
    city: "Nashville",
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
    id: "atl",
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
    id: "chi",
    name: "Chicago Bulls",
    league: "NBA",
    leagueColor: "#CE1141",
    city: "Chicago",
  },
  {
    id: "cle",
    name: "Cleveland Cavaliers",
    league: "NBA",
    leagueColor: "#860038",
    city: "Cleveland",
  },
  {
    id: "dal",
    name: "Dallas Mavericks",
    league: "NBA",
    leagueColor: "#00538C",
    city: "Dallas",
  },
  {
    id: "den",
    name: "Denver Nuggets",
    league: "NBA",
    leagueColor: "#0E2240",
    city: "Denver",
  },
  {
    id: "det",
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
    city: "San Francisco",
  },
  {
    id: "hou",
    name: "Houston Rockets",
    league: "NBA",
    leagueColor: "#CE1141",
    city: "Houston",
  },
  {
    id: "ind",
    name: "Indiana Pacers",
    league: "NBA",
    leagueColor: "#002D62",
    city: "Indianapolis",
  },
  {
    id: "lac",
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
    id: "mia",
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
    id: "min",
    name: "Minnesota Timberwolves",
    league: "NBA",
    leagueColor: "#0C2340",
    city: "Minneapolis",
  },
  {
    id: "nop",
    name: "New Orleans Pelicans",
    league: "NBA",
    leagueColor: "#0C2340",
    city: "New Orleans",
  },
  {
    id: "nyk",
    name: "New York Knicks",
    league: "NBA",
    leagueColor: "#F58426",
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
    id: "phi",
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
    id: "sas",
    name: "San Antonio Spurs",
    league: "NBA",
    leagueColor: "#C4CED4",
    city: "San Antonio",
  },
  {
    id: "tor",
    name: "Toronto Raptors",
    league: "NBA",
    leagueColor: "#CE1141",
    city: "Toronto",
  },
  {
    id: "uta",
    name: "Utah Jazz",
    league: "NBA",
    leagueColor: "#002B5C",
    city: "Salt Lake City",
  },
  {
    id: "was",
    name: "Washington Wizards",
    league: "NBA",
    leagueColor: "#002B5C",
    city: "Washington",
  },

  // MLB Teams (30 teams)
  {
    id: "ari",
    name: "Arizona Diamondbacks",
    league: "MLB",
    leagueColor: "#A71930",
    city: "Phoenix",
  },
  {
    id: "atl",
    name: "Atlanta Braves",
    league: "MLB",
    leagueColor: "#CE1141",
    city: "Atlanta",
  },
  {
    id: "bal",
    name: "Baltimore Orioles",
    league: "MLB",
    leagueColor: "#DF4601",
    city: "Baltimore",
  },
  {
    id: "bos",
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
    id: "cin",
    name: "Cincinnati Reds",
    league: "MLB",
    leagueColor: "#C6011F",
    city: "Cincinnati",
  },
  {
    id: "cle",
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
    city: "Denver",
  },
  {
    id: "det",
    name: "Detroit Tigers",
    league: "MLB",
    leagueColor: "#0C2340",
    city: "Detroit",
  },
  {
    id: "hou",
    name: "Houston Astros",
    league: "MLB",
    leagueColor: "#002D62",
    city: "Houston",
  },
  {
    id: "kc",
    name: "Kansas City Royals",
    league: "MLB",
    leagueColor: "#004687",
    city: "Kansas City",
  },
  {
    id: "laa",
    name: "Los Angeles Angels",
    league: "MLB",
    leagueColor: "#BA0021",
    city: "Anaheim",
  },
  {
    id: "lad",
    name: "Los Angeles Dodgers",
    league: "MLB",
    leagueColor: "#005A9C",
    city: "Los Angeles",
  },
  {
    id: "mia",
    name: "Miami Marlins",
    league: "MLB",
    leagueColor: "#00A3E0",
    city: "Miami",
  },
  {
    id: "mil",
    name: "Milwaukee Brewers",
    league: "MLB",
    leagueColor: "#12284B",
    city: "Milwaukee",
  },
  {
    id: "min",
    name: "Minnesota Twins",
    league: "MLB",
    leagueColor: "#002B5C",
    city: "Minneapolis",
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
    id: "phi",
    name: "Philadelphia Phillies",
    league: "MLB",
    leagueColor: "#E81828",
    city: "Philadelphia",
  },
  {
    id: "pit",
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
    id: "sf",
    name: "San Francisco Giants",
    league: "MLB",
    leagueColor: "#FD5A1E",
    city: "San Francisco",
  },
  {
    id: "sea",
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
    id: "tb",
    name: "Tampa Bay Rays",
    league: "MLB",
    leagueColor: "#092C5C",
    city: "St. Petersburg",
  },
  {
    id: "tex",
    name: "Texas Rangers",
    league: "MLB",
    leagueColor: "#003278",
    city: "Arlington",
  },
  {
    id: "tor",
    name: "Toronto Blue Jays",
    league: "MLB",
    leagueColor: "#134A8E",
    city: "Toronto",
  },
  {
    id: "was",
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
    id: "ari",
    name: "Arizona Coyotes",
    league: "NHL",
    leagueColor: "#8C2633",
    city: "Tempe",
  },
  {
    id: "bos",
    name: "Boston Bruins",
    league: "NHL",
    leagueColor: "#FFB81C",
    city: "Boston",
  },
  {
    id: "buf",
    name: "Buffalo Sabres",
    league: "NHL",
    leagueColor: "#002654",
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
    id: "car",
    name: "Carolina Hurricanes",
    league: "NHL",
    leagueColor: "#CC0000",
    city: "Raleigh",
  },
  {
    id: "chi",
    name: "Chicago Blackhawks",
    league: "NHL",
    leagueColor: "#CF0A2C",
    city: "Chicago",
  },
  {
    id: "col",
    name: "Colorado Avalanche",
    league: "NHL",
    leagueColor: "#6F263D",
    city: "Denver",
  },
  {
    id: "cbj",
    name: "Columbus Blue Jackets",
    league: "NHL",
    leagueColor: "#002654",
    city: "Columbus",
  },
  {
    id: "dal",
    name: "Dallas Stars",
    league: "NHL",
    leagueColor: "#006847",
    city: "Dallas",
  },
  {
    id: "det",
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
    city: "Sunrise",
  },
  {
    id: "la",
    name: "Los Angeles Kings",
    league: "NHL",
    leagueColor: "#111111",
    city: "Los Angeles",
  },
  {
    id: "min",
    name: "Minnesota Wild",
    league: "NHL",
    leagueColor: "#154734",
    city: "Saint Paul",
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
    city: "Newark",
  },
  {
    id: "nyi",
    name: "New York Islanders",
    league: "NHL",
    leagueColor: "#F47A38",
    city: "Elmont",
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
    id: "phi",
    name: "Philadelphia Flyers",
    league: "NHL",
    leagueColor: "#F74902",
    city: "Philadelphia",
  },
  {
    id: "pit",
    name: "Pittsburgh Penguins",
    league: "NHL",
    leagueColor: "#CFC493",
    city: "Pittsburgh",
  },
  {
    id: "sjs",
    name: "San Jose Sharks",
    league: "NHL",
    leagueColor: "#006D75",
    city: "San Jose",
  },
  {
    id: "sea",
    name: "Seattle Kraken",
    league: "NHL",
    leagueColor: "#001628",
    city: "Seattle",
  },
  {
    id: "stl",
    name: "St. Louis Blues",
    league: "NHL",
    leagueColor: "#002F87",
    city: "St. Louis",
  },
  {
    id: "tb",
    name: "Tampa Bay Lightning",
    league: "NHL",
    leagueColor: "#002868",
    city: "Tampa",
  },
  {
    id: "tor",
    name: "Toronto Maple Leafs",
    league: "NHL",
    leagueColor: "#003E7E",
    city: "Toronto",
  },
  {
    id: "van",
    name: "Vancouver Canucks",
    league: "NHL",
    leagueColor: "#001F5B",
    city: "Vancouver",
  },
  {
    id: "vgk",
    name: "Vegas Golden Knights",
    league: "NHL",
    leagueColor: "#B4975A",
    city: "Las Vegas",
  },
  {
    id: "wsh",
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
    id: "atl",
    name: "Atlanta United FC",
    league: "MLS",
    leagueColor: "#800F2F",
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
    leagueColor: "#1E1E1E",
    city: "Charlotte",
  },
  {
    id: "chicago",
    name: "Chicago Fire FC",
    league: "MLS",
    leagueColor: "#0B5394",
    city: "Chicago",
  },
  {
    id: "cincinnati",
    name: "FC Cincinnati",
    league: "MLS",
    leagueColor: "#F6F6F6",
    city: "Cincinnati",
  },
  {
    id: "colorado",
    name: "Colorado Rapids",
    league: "MLS",
    leagueColor: "#862633",
    city: "Commerce City",
  },
  {
    id: "columbus",
    name: "Columbus Crew",
    league: "MLS",
    leagueColor: "#FDB913",
    city: "Columbus",
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
    leagueColor: "#D11241",
    city: "Frisco",
  },
  {
    id: "houston",
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
    id: "la-galaxy",
    name: "LA Galaxy",
    league: "MLS",
    leagueColor: "#00245D",
    city: "Carson",
  },
  {
    id: "lafc",
    name: "Los Angeles FC",
    league: "MLS",
    leagueColor: "#000000",
    city: "Los Angeles",
  },
  {
    id: "minnesota",
    name: "Minnesota United FC",
    league: "MLS",
    leagueColor: "#7C0020",
    city: "Saint Paul",
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
    leagueColor: "#FFE500",
    city: "Nashville",
  },
  {
    id: "new-england",
    name: "New England Revolution",
    league: "MLS",
    leagueColor: "#0C2340",
    city: "Foxborough",
  },
  {
    id: "nycfc",
    name: "New York City FC",
    league: "MLS",
    leagueColor: "#6CACE4",
    city: "New York",
  },
  {
    id: "nyrb",
    name: "New York Red Bulls",
    league: "MLS",
    leagueColor: "#ED1C24",
    city: "Harrison",
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
    leagueColor: "#0C2340",
    city: "Chester",
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
    leagueColor: "#A5051B",
    city: "Sandy",
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
    leagueColor: "#4F8A10",
    city: "Seattle",
  },
  {
    id: "st-louis",
    name: "St. Louis City SC",
    league: "MLS",
    leagueColor: "#C8102E",
    city: "St. Louis",
  },
  {
    id: "toronto",
    name: "Toronto FC",
    league: "MLS",
    leagueColor: "#E31937",
    city: "Toronto",
  },
  {
    id: "vancouver",
    name: "Vancouver Whitecaps FC",
    league: "MLS",
    leagueColor: "#00245D",
    city: "Vancouver",
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const leagues = ["all", "NFL", "NBA", "MLB", "NHL", "MLS"];

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
              <Text color="gray.600" textAlign="center">
                {userType === "guest"
                  ? "Select teams to see personalized content in your For You feed"
                  : "Choose your favorite teams to get personalized updates and content"}
              </Text>
            </VStack>
          </VStack>

          {/* League Selector and Search */}
          <VStack gap="4" mt="8">
            {/* League Dropdown */}
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb="2" color="gray.700">
                Select League
              </Text>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  fontSize: "14px",
                }}
              >
                {leagues.map((league) => (
                  <option key={league} value={league}>
                    {league === "all" ? "All Leagues" : league}
                  </option>
                ))}
              </select>
            </Box>

            {/* Search Input */}
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb="2" color="gray.700">
                Search Teams
              </Text>
              <Box position="relative">
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#a0aec0",
                    zIndex: 1,
                  }}
                />
                <Input
                  placeholder="Search by team name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl="10"
                  pr="12"
                  // bg="primary.25"
                  // borderColor="gray.300"
                  // _focus={{
                  //   borderColor: "blue.500",
                  //   boxShadow: "0 0 0 1px #3182ce",
                  // }}
                />
              </Box>
            </Box>

            {/* Selected Teams Count */}
            <Box w="full">
              <Text fontSize="sm" color="gray.600">
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
                    <Badge
                      variant="outline"
                      style={{ borderColor: leagueColor, color: leagueColor }}
                    >
                      {league}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
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
                        // borderWidth="1px"
                        // borderColor={
                        //   selectedTeams.includes(team.name)
                        //     ? "blue.500"
                        //     : "gray.200"
                        // }
                        bg={
                          selectedTeams.includes(team.name)
                            ? "blue.50"
                            : "primary.25"
                        }
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
                                style={{ backgroundColor: team.leagueColor }}
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
                                  color="text.400"
                                >
                                  {team.name}
                                </Text>
                                <Text fontSize="xs" color="text.400">
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
                                  bg="accent.100"
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
                                <Box
                                  w="6"
                                  h="6"
                                  // borderWidth="2px"
                                  // borderColor="gray.300"
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
