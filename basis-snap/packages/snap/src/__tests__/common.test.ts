import {
  shortenAddress,
  formatGrade,
  formatCoverageQuality,
  isCritical,
  isWarning,
} from "../ui/common";

describe("shortenAddress", () => {
  it("shortens long address", () => {
    expect(
      shortenAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    ).toBe("0xa0b8...eb48");
  });

  it("returns short address unchanged", () => {
    expect(shortenAddress("0x1234")).toBe("0x1234");
  });
});

describe("formatGrade", () => {
  it("returns plain for A grade", () => {
    expect(formatGrade("A")).toBe("A");
    expect(formatGrade("A+")).toBe("A+");
    expect(formatGrade("A-")).toBe("A-");
  });

  it("returns plain for B grade", () => {
    expect(formatGrade("B")).toBe("B");
  });

  it("prefixes warning for C grade", () => {
    expect(formatGrade("C")).toBe("⚠ C");
    expect(formatGrade("C+")).toBe("⚠ C+");
  });

  it("prefixes warning for D grade", () => {
    expect(formatGrade("D")).toBe("⚠ D");
  });

  it("prefixes red circle for F grade", () => {
    expect(formatGrade("F")).toBe("🔴 F");
  });
});

describe("formatCoverageQuality", () => {
  it("formats full coverage", () => {
    expect(formatCoverageQuality("full")).toBe("Full coverage");
  });

  it("formats low coverage with warning", () => {
    expect(formatCoverageQuality("low")).toContain("⚠");
  });
});

describe("isCritical", () => {
  it("returns true when SII is below critical threshold", () => {
    expect(isCritical(45, null, 50)).toBe(true);
  });

  it("returns true when wallet risk is below critical threshold", () => {
    expect(isCritical(null, 45, 50)).toBe(true);
  });

  it("returns false when both above threshold", () => {
    expect(isCritical(80, 80, 50)).toBe(false);
  });
});

describe("isWarning", () => {
  it("returns true when SII below warning threshold", () => {
    expect(isWarning(65, null, 70)).toBe(true);
  });

  it("returns true when coverage quality is low", () => {
    expect(isWarning(null, "low", 70)).toBe(true);
  });

  it("returns false when above threshold and full coverage", () => {
    expect(isWarning(85, "full", 70)).toBe(false);
  });
});
