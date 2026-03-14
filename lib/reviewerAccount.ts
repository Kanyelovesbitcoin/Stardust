// Apple App Review access account
export const APPLE_APP_REVIEW_EMAIL = "t58306257@gmail.com";

export function isReviewerAccount(email?: string | null): boolean {
  return !!email && email.trim().toLowerCase() === APPLE_APP_REVIEW_EMAIL;
}
