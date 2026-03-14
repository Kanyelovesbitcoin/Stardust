import { describe, expect, it } from "vitest";
import { APPLE_APP_REVIEW_EMAIL, isReviewerAccount } from "../lib/reviewerAccount";

describe("isReviewerAccount", () => {
  it("matches the Apple App Review account email", () => {
    expect(isReviewerAccount(APPLE_APP_REVIEW_EMAIL)).toBe(true);
  });

  it("matches case-insensitively and trims whitespace", () => {
    expect(isReviewerAccount("  T58306257@GMAIL.COM  ")).toBe(true);
  });

  it("rejects all other emails", () => {
    expect(isReviewerAccount("other@example.com")).toBe(false);
    expect(isReviewerAccount(null)).toBe(false);
    expect(isReviewerAccount(undefined)).toBe(false);
  });
});
