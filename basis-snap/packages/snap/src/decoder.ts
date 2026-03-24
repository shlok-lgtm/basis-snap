const TRANSFER_SELECTOR = "0xa9059cbb";
const APPROVE_SELECTOR = "0x095ea7b3";

export interface DecodedERC20 {
  recipient: string;
}

export function decodeERC20Transfer(data: string): DecodedERC20 | null {
  if (!data || data === "0x" || data.length < 10) {
    return null;
  }
  const selector = data.slice(0, 10).toLowerCase();
  if (selector === TRANSFER_SELECTOR || selector === APPROVE_SELECTOR) {
    const recipient = `0x${data.slice(34, 74)}`;
    return { recipient };
  }
  return null;
}

export function isKnownSelector(data: string): boolean {
  if (!data || data.length < 10) return false;
  const selector = data.slice(0, 10).toLowerCase();
  return selector === TRANSFER_SELECTOR || selector === APPROVE_SELECTOR;
}
