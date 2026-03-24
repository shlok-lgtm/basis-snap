import { Box, Bold, Text } from "@metamask/snaps-sdk/jsx";

export type WarningSeverity = "warning" | "critical";

type Props = {
  severity: WarningSeverity;
  message: string;
};

export function Warning({ severity, message }: Props) {
  const prefix = severity === "critical" ? "🔴 CRITICAL: " : "⚠ WARNING: ";
  return (
    <Box>
      <Bold>{prefix}{message}</Bold>
    </Box>
  );
}
