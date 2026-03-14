import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { isReviewerAccount } from "../lib/reviewerAccount";

// ─── Limits ─────────────────────────────────────────────
export const MONTHLY_INTERPRETATION_LIMIT = 100;
export const MONTHLY_VISUALIZATION_LIMIT = 40;

/** Current month as "YYYY-MM" */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ─── Internal helpers (used by dreams.ts mutations) ─────

/** Get-or-create user row. Returns the user doc. */
export async function ensureUser(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (existing) return existing;

  const id = await ctx.db.insert("users", {
    userId,
    subscriptionStatus: "free",
    createdAt: Date.now(),
  });
  return (await ctx.db.get(id))!;
}

/** Throws if user is not Pro. */
export async function requirePro(ctx: MutationCtx, userId: string) {
  const identity = await ctx.auth.getUserIdentity();
  const user = await ensureUser(ctx, userId);
  // Apple App Review access account
  if (isReviewerAccount(identity?.email, process.env.APPLE_REVIEWER_EMAIL)) {
    await ctx.db.patch(user._id, {
      subscriptionStatus: "pro",
      subscriptionStartedAt: user.subscriptionStartedAt ?? Date.now(),
      email: identity?.email,
    });
    return user;
  }
  if (user.subscriptionStatus !== "pro") {
    throw new Error("Pro subscription required");
  }
  return user;
}

/** Check monthly limit and increment usage. Throws if limit exceeded. */
export async function checkAndIncrementUsage(
  ctx: MutationCtx,
  userId: string,
  feature: "interpretation" | "visualization"
) {
  const identity = await ctx.auth.getUserIdentity();
  // Apple App Review access account
  if (isReviewerAccount(identity?.email, process.env.APPLE_REVIEWER_EMAIL)) {
    const user = await ensureUser(ctx, userId);
    await ctx.db.patch(user._id, {
      subscriptionStatus: "pro",
      subscriptionStartedAt: user.subscriptionStartedAt ?? Date.now(),
      email: identity?.email,
    });
    return;
  }

  const month = currentMonth();

  let usage = await ctx.db
    .query("aiUsage")
    .withIndex("by_user_month", (q) => q.eq("userId", userId).eq("month", month))
    .unique();

  if (!usage) {
    const id = await ctx.db.insert("aiUsage", {
      userId,
      month,
      interpretationsUsed: 0,
      visualizationsUsed: 0,
      createdAt: Date.now(),
    });
    usage = (await ctx.db.get(id))!;
  }

  if (feature === "interpretation") {
    if (usage.interpretationsUsed >= MONTHLY_INTERPRETATION_LIMIT) {
      throw new Error(
        `Monthly AI limit reached. You've used all ${MONTHLY_INTERPRETATION_LIMIT} interpretations this month. Your quota resets next month.`
      );
    }
    await ctx.db.patch(usage._id, {
      interpretationsUsed: usage.interpretationsUsed + 1,
    });
  } else {
    if (usage.visualizationsUsed >= MONTHLY_VISUALIZATION_LIMIT) {
      throw new Error(
        `Monthly AI limit reached. You've used all ${MONTHLY_VISUALIZATION_LIMIT} visualizations this month. Your quota resets next month.`
      );
    }
    await ctx.db.patch(usage._id, {
      visualizationsUsed: usage.visualizationsUsed + 1,
    });
  }
}

// ─── Read-only helper for queries ───────────────────────
async function getUserForQuery(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

// ─── Public queries & mutations ─────────────────────────

/** Get current user's entitlement + usage stats */
export const getEntitlement = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    // Apple App Review access account
    const reviewerPro = isReviewerAccount(identity.email, process.env.APPLE_REVIEWER_EMAIL);

    const user = await getUserForQuery(ctx, userId);
    const month = currentMonth();

    const usage = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_month", (q) => q.eq("userId", userId).eq("month", month))
      .unique();

    return {
      subscriptionStatus: reviewerPro ? "pro" : user?.subscriptionStatus ?? "free",
      month,
      interpretationsUsed: usage?.interpretationsUsed ?? 0,
      interpretationsLimit: MONTHLY_INTERPRETATION_LIMIT,
      visualizationsUsed: usage?.visualizationsUsed ?? 0,
      visualizationsLimit: MONTHLY_VISUALIZATION_LIMIT,
    };
  },
});

/** Grant Pro status to a user (called after Superwall purchase) */
export const grantPro = internalMutation({
  args: { userId: v.string(), source: v.optional(v.string()) },
  handler: async (ctx, { userId, source }) => {
    const user = await ensureUser(ctx, userId);
    await ctx.db.patch(user._id, {
      subscriptionStatus: "pro",
      subscriptionStartedAt: Date.now(),
    });
  },
});

/** Revoke Pro status (e.g., subscription expired) */
export const revokePro = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ensureUser(ctx, userId);
    await ctx.db.patch(user._id, {
      subscriptionStatus: "free",
    });
  },
});
