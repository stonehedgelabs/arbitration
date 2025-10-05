import { Box, BoxProps } from "@chakra-ui/react";

interface SkeletonProps extends BoxProps {
  /**
   * Number of skeleton lines to render
   * @default 1
   */
  lines?: number;
  /**
   * Height of each skeleton line
   * @default "12px"
   */
  lineHeight?: string;
  /**
   * Gap between skeleton lines
   * @default "4px"
   */
  gap?: string;
  /**
   * Animation duration in seconds
   * @default 1.5
   */
  duration?: number;
  /**
   * Whether to show animation
   * @default true
   */
  animate?: boolean;
}

/**
 * Flexible skeleton component for loading states
 * Prevents layout shift by maintaining consistent dimensions
 */
export const Skeleton = ({
  lines = 1,
  lineHeight = "12px",
  gap = "4px",
  duration = 1.5,
  animate = true,
  bg = "text.200",
  borderRadius = "sm",
  ...props
}: SkeletonProps) => {
  const animation = animate
    ? {
        animation: `skeleton-pulse ${duration}s ease-in-out infinite`,
        "@keyframes skeleton-pulse": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.4 },
          "100%": { opacity: 1 },
        },
      }
    : {};

  if (lines === 1) {
    return (
      <Box
        bg={bg}
        borderRadius={borderRadius}
        h={lineHeight}
        {...animation}
        {...props}
      />
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={gap} {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <Box
          key={index}
          bg={bg}
          borderRadius={borderRadius}
          h={lineHeight}
          {...animation}
        />
      ))}
    </Box>
  );
};

/**
 * Skeleton for text content with variable width
 */
export const SkeletonText = ({
  width = "100%",
  height = "12px",
  ...props
}: SkeletonProps & { width?: string | string[] }) => (
  <Skeleton w={width} h={height} {...props} />
);

/**
 * Skeleton for circular content (avatars, icons)
 */
export const SkeletonCircle = ({
  size = "40px",
  ...props
}: SkeletonProps & { size?: string }) => (
  <Skeleton w={size} h={size} borderRadius="full" {...props} />
);

/**
 * Skeleton for rectangular content (images, cards)
 */
export const SkeletonBox = ({
  width = "100%",
  height = "100px",
  ...props
}: SkeletonProps & { width?: string; height?: string }) => (
  <Skeleton w={width} h={height} {...props} />
);

/**
 * Skeleton for Twitter card structure
 * Mimics the layout of a tweet with avatar, name, handle, content, and engagement
 */
export const TwitterCardSkeleton = ({ ...props }: SkeletonProps) => (
  <Box bg="primary.200" borderRadius="lg" p="4" minH="300px" {...props}>
    <Box display="flex" gap="3" mb="3">
      {/* Avatar */}
      <SkeletonCircle size="40px" />

      {/* User info and content */}
      <Box flex="1" minW="0">
        {/* Name and handle */}
        <Box display="flex" gap="2" mb="2" alignItems="center">
          <SkeletonText width="120px" height="32px" />
          <SkeletonText width="80px" height="32px" />
          <SkeletonText width="60px" height="32px" />
        </Box>

        {/* Tweet content */}
        <Box mb="3">
          <SkeletonText width="100%" height="72px" mb="2" />
          <SkeletonText width="100%" height="72px" mb="2" />
        </Box>

        {/* Engagement bar */}
        <Box display="flex" gap="2" mt="3">
          <Box display="flex" alignItems="center" gap="1">
            <SkeletonCircle size="25px" />
            <SkeletonText width="47px" height="25px" />
          </Box>
          <Box display="flex" alignItems="center" gap="1">
            <SkeletonCircle size="25px" />
            <SkeletonText width="47px" height="25px" />
          </Box>
          <Box display="flex" alignItems="center" gap="1">
            <SkeletonCircle size="25px" />
            <SkeletonText width="47px" height="25px" />
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

export default Skeleton;
