export type SuperwallWebhookEvent = {
  type?: unknown;
  data?: {
    originalAppUserId?: unknown;
    userAttributes?: Record<string, unknown> | null;
  } | null;
};

export const GRANT_PRO_EVENTS = new Set([
  "initial_purchase",
  "renewal",
  "uncancellation",
  "product_change",
  "non_renewing_purchase",
]);

export const REVOKE_PRO_EVENTS = new Set([
  "expiration",
  "subscription_paused",
]);

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function isSuperwallAliasUserId(value: string): boolean {
  return value.toLowerCase().startsWith("$superwallalias:");
}

export function resolveSuperwallUserId(event: SuperwallWebhookEvent): string | null {
  const originalAppUserId = toNonEmptyString(event.data?.originalAppUserId);
  if (originalAppUserId && !isSuperwallAliasUserId(originalAppUserId)) {
    return originalAppUserId;
  }

  const userAttributes = event.data?.userAttributes ?? {};
  return (
    toNonEmptyString(userAttributes.convexUserId) ??
    toNonEmptyString(userAttributes.supabaseUserId)
  );
}

export function getSuperwallEntitlementAction(eventType: string): "grant" | "revoke" | "ignore" {
  if (GRANT_PRO_EVENTS.has(eventType)) {
    return "grant";
  }

  if (REVOKE_PRO_EVENTS.has(eventType)) {
    return "revoke";
  }

  return "ignore";
}
