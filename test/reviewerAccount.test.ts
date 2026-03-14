import { describe, expect, it } from "vitest";
import { isReviewerAccount } from "../lib/reviewerAccount";

const TEST_REVIEWER_EMAIL = "test-reviewer@example.com";

describe("isReviewerAccount", () => {
  it("matches when email equals reviewer email", () => {
    expect(isReviewerAccount(TEST_REVIEWER_EMAIL, TEST_REVIEWER_EMAIL)).toBe(true);
  });

  it("matches case-insensitively and trims whitespace", () => {
    expect(isReviewerAccount("  TEST-REVIEWER@EXAMPLE.COM  ", TEST_REVIEWER_EMAIL)).toBe(true);
  });

  it("rejects when emails don't match", () => {
    expect(isReviewerAccount("other@example.com", TEST_REVIEWER_EMAIL)).toBe(false);
  });

  it("rejects when either value is null/undefined", () => {
    expect(isReviewerAccount(null, TEST_REVIEWER_EMAIL)).toBe(false);
    expect(isReviewerAccount(TEST_REVIEWER_EMAIL, null)).toBe(false);
    expect(isReviewerAccount(undefined, undefined)).toBe(false);
  });
});
