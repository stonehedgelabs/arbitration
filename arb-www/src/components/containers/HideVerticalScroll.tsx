import React, { ReactNode } from "react";
import { Box, BoxProps } from "@chakra-ui/react";

interface HideVerticalScrollProps extends Omit<BoxProps, "overflowY"> {
  children: ReactNode;
}

/**
 * Container that hides vertical scrollbars while maintaining scroll functionality
 * Use this for containers that need vertical scrolling but want to hide the scrollbar
 */
export const HideVerticalScroll = React.forwardRef<
  HTMLDivElement,
  HideVerticalScrollProps
>(({ children, ...boxProps }, ref) => {
  return (
    <Box ref={ref} overflowY="auto" {...boxProps}>
      {children}
    </Box>
  );
});
