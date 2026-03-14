// Apple App Review access account — email stored in Convex env var APPLE_REVIEWER_EMAIL

export function isReviewerAccount(email?: string | null, reviewerEmail?: string | null): boolean {
  if (!email || !reviewerEmail) return false;
  return email.trim().toLowerCase() === reviewerEmail.trim().toLowerCase();
}
