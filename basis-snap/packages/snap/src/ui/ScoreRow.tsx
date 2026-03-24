import { Row, Text } from "@metamask/snaps-sdk/jsx";
import { formatGrade, formatScore } from "./common";

type Props = {
  label: string;
  score: number;
  grade: string;
};

export function ScoreRow({ label, score, grade }: Props) {
  return (
    <Row label={label}>
      <Text>
        {formatGrade(grade)} {formatScore(score)}
      </Text>
    </Row>
  );
}
