import { decodeERC20Transfer, isKnownSelector } from "../decoder";

describe("decodeERC20Transfer", () => {
  it("returns null for empty data", () => {
    expect(decodeERC20Transfer("")).toBeNull();
    expect(decodeERC20Transfer("0x")).toBeNull();
  });

  it("decodes transfer(address,uint256) calldata", () => {
    const recipientPadded =
      "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const data = `0xa9059cbb${recipientPadded}0000000000000000000000000000000000000000000000000000000005f5e100`;
    const result = decodeERC20Transfer(data);
    expect(result).not.toBeNull();
    expect(result!.recipient.toLowerCase()).toBe(
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    );
  });

  it("decodes approve(address,uint256) calldata", () => {
    const recipientPadded =
      "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7";
    const data = `0x095ea7b3${recipientPadded}ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`;
    const result = decodeERC20Transfer(data);
    expect(result).not.toBeNull();
    expect(result!.recipient.toLowerCase()).toBe(
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
    );
  });

  it("returns null for unknown selector", () => {
    const data = "0xdeadbeef000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    expect(decodeERC20Transfer(data)).toBeNull();
  });

  it("isKnownSelector returns true for transfer selector", () => {
    expect(isKnownSelector("0xa9059cbb1234")).toBe(true);
  });

  it("isKnownSelector returns false for unknown selector", () => {
    expect(isKnownSelector("0xdeadbeef1234")).toBe(false);
  });
});
