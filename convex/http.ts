import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import {
  getSuperwallEntitlementAction,
  resolveSuperwallUserId,
  type SuperwallWebhookEvent,
} from "./superwallWebhook";

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getSvixHeaders(request: Request) {
  return {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };
}

const http = httpRouter();

http.route({
  path: "/superwall/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.SUPERWALL_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Superwall webhook] Missing SUPERWALL_WEBHOOK_SECRET");
      return new Response("Server misconfigured", { status: 500 });
    }

    const rawBody = await request.text();
    const verifier = new Webhook(secret);

    let event: SuperwallWebhookEvent;
    try {
      event = verifier.verify(rawBody, getSvixHeaders(request)) as SuperwallWebhookEvent;
    } catch (error) {
      console.error("[Superwall webhook] Signature verification failed", error);
      return new Response("Invalid signature", { status: 400 });
    }

    const eventType = toNonEmptyString(event.type);
    if (!eventType) {
      console.error("[Superwall webhook] Missing event type");
      return Response.json({ ok: false, reason: "missing_event_type" }, { status: 400 });
    }

    const userId = resolveSuperwallUserId(event);
    if (!userId) {
      console.warn("[Superwall webhook] Missing resolved user id", {
        type: eventType,
        originalAppUserId: event.data?.originalAppUserId ?? null,
        userAttributes: event.data?.userAttributes ?? null,
      });
      return Response.json({
        ok: true,
        skipped: true,
        reason: "missing_user_id",
      }, { status: 202 });
    }

    const action = getSuperwallEntitlementAction(eventType);

    if (action === "grant") {
      await ctx.runMutation(internal.entitlements.grantPro, {
        userId,
        source: `superwall:${eventType}`,
      });
      return Response.json({ ok: true, action: "granted", userId, type: eventType });
    }

    if (action === "revoke") {
      await ctx.runMutation(internal.entitlements.revokePro, { userId });
      return Response.json({ ok: true, action: "revoked", userId, type: eventType });
    }

    return Response.json({
      ok: true,
      ignored: true,
      userId,
      type: eventType,
    });
  }),
});

export default http;
