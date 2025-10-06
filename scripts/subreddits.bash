#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array of all subreddits to check
subreddits=(
    # NFL
    "r/AZCardinals" "r/falcons" "r/ravens" "r/buffalobills" "r/panthers"
    "r/chibears" "r/bengals" "r/browns" "r/cowboys" "r/denverbroncos"
    "r/detroitlions" "r/GreenBayPackers" "r/texans" "r/colts" "r/jaguars"
    "r/kansascitychiefs" "r/raiders" "r/chargers" "r/losangelesrams" "r/miamidolphins"
    "r/minnesotavikings" "r/patriots" "r/saints" "r/nygiants" "r/nyjets"
    "r/eagles" "r/steelers" "r/49ers" "r/seahawks" "r/buccaneers"
    "r/tennesseetitans" "r/commanders"

    # NBA
    "r/AtlantaHawks" "r/bostonceltics" "r/GoNets" "r/CharlotteHornets" "r/chicagobulls"
    "r/clevelandcavs" "r/Mavericks" "r/DenverNuggets" "r/DetroitPistons" "r/warriors"
    "r/rockets" "r/pacers" "r/LAClippers" "r/lakers" "r/memphisgrizzlies"
    "r/heat" "r/MkeBucks" "r/timberwolves" "r/NOLAPelicans" "r/NYKnicks"
    "r/Thunder" "r/orlandomagic" "r/sixers" "r/suns" "r/ripcity"
    "r/kings" "r/nbaspurs" "r/torontoraptors" "r/UtahJazz" "r/washingtonwizards"

    # MLB
    "r/azdiamondbacks" "r/Braves" "r/Orioles" "r/RedSox" "r/CHICubs"
    "r/WhiteSox" "r/Reds" "r/ClevelandGuardians" "r/ColoradoRockies" "r/MotorCityKitties"
    "r/Astros" "r/Royals" "r/AngelsBaseball" "r/Dodgers" "r/letsgofish"
    "r/Brewers" "r/minnesotatwins" "r/NewYorkMets" "r/Yankees" "r/OaklandAthletics"
    "r/Phillies" "r/Buccos" "r/Padres" "r/SFGiants" "r/Mariners"
    "r/Cardinals" "r/TampaBayRays" "r/texasrangers" "r/Torontobluejays" "r/Nationals"

    # NHL
    "r/anaheimducks" "r/coyotes" "r/bostonbruins" "r/sabres" "r/calgaryflames"
    "r/canes" "r/hawks" "r/coloradoavalanche" "r/bluejackets" "r/dallasstars"
    "r/detroitredwings" "r/edmontonoilers" "r/floridapanthers" "r/losangeleskings" "r/wildhockey"
    "r/habs" "r/predators" "r/devils" "r/newyorkislanders" "r/rangers"
    "r/ottawasenators" "r/flyers" "r/penguins" "r/sanjosesharks" "r/seattlekraken"
    "r/stlouisblues" "r/tampabaylightning" "r/leafs" "r/canucks" "r/goldenknights"
    "r/caps" "r/winnipegjets"

    # MLS
    "r/AtlantaUnitedFC" "r/AustinFC" "r/CharlotteFC" "r/ChicagoFire" "r/FCCincinnati"
    "r/ColoradoRapids" "r/TheMassive" "r/DCUnited" "r/FCDallas" "r/dynamo"
    "r/InterMiamiCF" "r/SportingKC" "r/LAGalaxy" "r/LACity" "r/minnesotaunited"
    "r/CFMontreal" "r/NashvilleSC" "r/NewEnglandRevolution" "r/NYCFC" "r/NYRB"
    "r/OCLions" "r/PhillyUnion" "r/timbers" "r/realSaltLake" "r/SJEarthquakes"
    "r/SoundersFC" "r/StLouisCITY" "r/TorontoFC" "r/whitecapsfc"
)

echo "=========================================="
echo "   Subreddit Validation Report"
echo "=========================================="
echo ""

valid_count=0
invalid_count=0
invalid_subs=()

# Check each subreddit
for sub in "${subreddits[@]}"; do
    # Remove the 'r/' prefix for the URL
    sub_name="${sub#r/}"
    url="https://www.reddit.com/${sub}"
u
    # Make request and capture HTTP status code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" --user-agent "Mozilla/5.0")

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓${NC} $sub - Valid (200)"
        ((valid_count++))
    else
        echo -e "${RED}✗${NC} $sub - Invalid ($http_code)"
        ((invalid_count++))
        invalid_subs+=("$sub")
    fi

    # Be nice to Reddit's servers
    sleep 0.5
done

# Summary
echo ""
echo "=========================================="
echo "   Summary"
echo "=========================================="
echo -e "Total subreddits checked: $((valid_count + invalid_count))"
echo -e "${GREEN}Valid: $valid_count${NC}"
echo -e "${RED}Invalid: $invalid_count${NC}"

if [ ${#invalid_subs[@]} -gt 0 ]; then
    echo ""
    echo "Invalid subreddits:"
    for sub in "${invalid_subs[@]}"; do
        echo "  - $sub"
    done
fi

echo ""
echo "Done!"
