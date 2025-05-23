import { describe, expect, it } from "vitest";
import { generateReferralCode } from "../../utils/referralCode";

describe("generateReferralCode tests", () => {
  it("should generate a referral code of length 12", () => {
    const referralCode = generateReferralCode();
    expect(referralCode.length).toBe(12);
  });

  it("should only contain uppercase letters and digits", () => {
    const referralCode = generateReferralCode();

    // Check if the code contains only uppercase letters and digits
    expect(referralCode).toMatch(/^[A-Z0-9]+$/);
  });
})