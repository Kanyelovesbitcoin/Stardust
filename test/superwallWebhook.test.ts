import { describe, expect, it } from "vitest";
import {
  getSuperwallEntitlementAction,
  isSuperwallAliasUserId,
  resolveSuperwallUserId,
  type SuperwallWebhookEvent,
} from "../convex/superwallWebhook";

describe("superwall webhook helpers", () => {
  it("rejects Superwall alias ids", () => {
    expect(isSuperwallAliasUserId("$SuperwallAlias:abc123")).toBe(true);
  });

  it("prefers originalAppUserId when it is a real user id", () => {
    const event: SuperwallWebhookEvent = {
      data: {
        originalAppUserId: "supabase-user-1",
        userAttributes: {
          convexUserId: "convex-user-1",
          supabaseUserId: "supabase-user-2",
        },
      },
    };

    expect(resolveSuperwallUserId(event)).toBe("supabase-user-1");
  });

  it("falls back to convexUserId when originalAppUserId is an alias", () => {
    const event: SuperwallWebhookEvent = {
      data: {
        originalAppUserId: "$SuperwallAlias:abc123",
        userAttributes: {
          convexUserId: "convex-user-1",
          supabaseUserId: "supabase-user-2",
        },
      },
    };

    expect(resolveSuperwallUserId(event)).toBe("convex-user-1");
  });

  it("falls back to supabaseUserId when convexUserId is missing", () => {
    const event: SuperwallWebhookEvent = {
      data: {
        originalAppUserId: "$SuperwallAlias:abc123",
        userAttributes: {
          supabaseUserId: "supabase-user-2",
        },
      },
    };

    expect(resolveSuperwallUserId(event)).toBe("supabase-user-2");
  });

  it("returns null when there is no usable user id", () => {
    const event: SuperwallWebhookEvent = {
      data: {
        originalAppUserId: "$SuperwallAlias:abc123",
        userAttributes: {},
      },
    };

    expect(resolveSuperwallUserId(event)).toBeNull();
  });

  it("maps grant, revoke, and ignored events correctly", () => {
    expect(getSuperwallEntitlementAction("initial_purchase")).toBe("grant");
    expect(getSuperwallEntitlementAction("renewal")).toBe("grant");
    expect(getSuperwallEntitlementAction("expiration")).toBe("revoke");
    expect(getSuperwallEntitlementAction("subscription_paused")).toBe("revoke");
    expect(getSuperwallEntitlementAction("cancellation")).toBe("ignore");
    expect(getSuperwallEntitlementAction("billing_issue")).toBe("ignore");
    expect(getSuperwallEntitlementAction("unknown_event")).toBe("ignore");
  });
});
