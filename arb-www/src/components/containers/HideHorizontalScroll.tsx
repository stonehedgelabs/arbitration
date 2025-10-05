import React, { ReactNode } from "react";
import { Box, BoxProps } from "@chakra-ui/react";

interface HideHorizontalScrollProps extends Omit<BoxProps, "overflowX"> {
  children: ReactNode;
}

/**
 * Container that hides horizontal scrollbars while maintaining scroll functionality
 * Use this for containers that need horizontal scrolling but want to hide the scrollbar
 */
export const HideHorizontalScroll = React.forwardRef<
  HTMLDivElement,
  HideHorizontalScrollProps
>(({ children, ...boxProps }, ref) => {
  return (
    <Box ref={ref} overflowX="auto" {...boxProps}>
      {children}
    </Box>
  );
});
