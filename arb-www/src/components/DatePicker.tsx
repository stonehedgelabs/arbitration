// React imports
import { useEffect, useRef } from "react";

// Third-party library imports
import { Box, Text } from "@chakra-ui/react";

// Internal imports - store
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedDate } from "../store/slices/sportsDataSlice";

// Internal imports - utils
import { getCurrentLocalDate, formatDateForSlider } from "../utils.ts";

// Date utility function
const getDateRange = () => {
  const today = new Date();
  const todayString = getCurrentLocalDate();
  const dates = [];

  // 7 days before today
  for (let i = 7; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    dates.push({
      date: dateString,
      display: formatDateForSlider(date),
      isToday: false,
    });
  }

  // Today (centered)
  dates.push({
    date: todayString,
    display: "Today",
    isToday: true,
  });

  // 7 days after today
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    dates.push({
      date: dateString,
      display: formatDateForSlider(date),
      isToday: false,
    });
  }

  return dates;
};

interface DatePickerProps {
  selectedLeague: string;
}

export function DatePicker({ selectedLeague }: DatePickerProps) {
  const dateSelectorRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.sportsData.selectedDate);

  // Center "Today" in the date selector only when league changes
  useEffect(() => {
    const centerToday = () => {
      if (dateSelectorRef.current && selectedDate) {
        const todayElement = dateSelectorRef.current.querySelector(
          `[data-date="${getCurrentLocalDate()}"]`,
        );
        if (todayElement) {
          todayElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(centerToday, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedLeague]);

  // Center the selected date in the date selector when selectedDate changes
  useEffect(() => {
    const centerSelectedDate = () => {
      if (dateSelectorRef.current && selectedDate) {
        const selectedElement = dateSelectorRef.current.querySelector(
          `[data-date="${selectedDate}"]`,
        );
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    };

    // Only center if we have a valid selectedDate and the element exists
    if (selectedDate) {
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(centerSelectedDate, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate]);

  return (
    <Box>
      <Box
        ref={dateSelectorRef}
        display="flex"
        gap="2"
        overflowX="auto"
        pb="2"
        bg="primary.25"
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "&::-ms-overflow-style": "none",
          "&scrollbarWidth": "none",
        }}
      >
        {getDateRange().map((dateInfo) => (
          <Box
            key={dateInfo.date}
            data-date={dateInfo.date}
            onClick={() => {
              dispatch(setSelectedDate(dateInfo.date));
            }}
            cursor="pointer"
            px="2"
            py="1"
            borderRadius="md"
            bg={selectedDate === dateInfo.date ? "red.50" : "transparent"}
            borderBottom={
              selectedDate === dateInfo.date
                ? "2px solid"
                : "2px solid transparent"
            }
            borderBottomColor={
              selectedDate === dateInfo.date ? "danger.100" : "transparent"
            }
            minW="fit-content"
            whiteSpace="nowrap"
          >
            <Text
              fontSize="xs"
              fontWeight={
                selectedDate === dateInfo.date ? "semibold" : "normal"
              }
              color={selectedDate === dateInfo.date ? "danger.100" : "text.400"}
            >
              {dateInfo.display}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
