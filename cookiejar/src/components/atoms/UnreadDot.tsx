import { Box } from "@/components/primitives/Box";
import { useTheme } from "@/theme/useTheme";

export function UnreadDot() {
  const theme = useTheme();

  return (
    <Box
      background="accent"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: theme.sizes.unreadDot,
        height: theme.sizes.unreadDot,
        borderRadius: theme.sizes.unreadDot / 2,
      }}
    />
  );
}
