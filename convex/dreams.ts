import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { requirePro, checkAndIncrementUsage } from "./entitlements";

/** Get the authenticated user's ID, or null if not authenticated */
async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

/** Get the authenticated user's ID — throws if not authenticated (use for mutations) */
async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getUserId(ctx);
  if (!userId) throw new Error("Unauthenticated");
  return userId;
}

export const listDreams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("dreams")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getDream = query({
  args: { dreamId: v.id("dreams") },
  handler: async (ctx, { dreamId }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) return null;
    return dream;
  },
});

/** Lightweight query for gallery — only returns fields needed to render the image grid */
export const listGalleryDreams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];
    const allDreams = await ctx.db
      .query("dreams")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return allDreams
      .filter((d) => d.sceneUrl || d.isGeneratingVisual)
      .map((d) => ({
        _id: d._id,
        createdAt: d.createdAt,
        mood: d.mood,
        sceneUrl: d.sceneUrl,
        isGeneratingVisual: d.isGeneratingVisual,
        imageError: d.imageError,
        visualStyle: d.visualStyle,
        // Short title for gallery captions (first 40 chars of transcript)
        titlePreview: d.transcript
          ? d.transcript.substring(0, 40).trim() + (d.transcript.length > 40 ? "..." : "")
          : undefined,
      }));
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx); // require auth
    return await ctx.storage.generateUploadUrl();
  },
});

export const createDream = mutation({
  args: {
    title: v.optional(v.string()),
    transcript: v.optional(v.string()),
    mood: v.optional(v.string()),
    category: v.optional(v.string()),
    dreamType: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    audioStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.transcript && args.transcript.length > 5000) {
      throw new Error("Transcript too long (max 5000 characters)");
    }
    const hasAudio = args.audioStorageId !== undefined;
    const dreamId = await ctx.db.insert("dreams", {
      userId,
      createdAt: Date.now(),
      title: args.title,
      audioStorageId: args.audioStorageId,
      transcript: args.transcript,
      tags: args.tags ?? [],
      mood: args.mood,
      category: args.category,
      dreamType: args.dreamType,
      lucidityRating: 0,
      isFavorite: false,
      isTranscribing: hasAudio,
      isInterpreting: false,
      isGeneratingVisual: false,
    });

    if (hasAudio) {
      await ctx.scheduler.runAfter(0, internal.transcribe.transcribeAudio, {
        dreamId,
        audioStorageId: args.audioStorageId!,
        userId,
      });
    }

    return dreamId;
  },
});

export const updateDream = mutation({
  args: {
    dreamId: v.id("dreams"),
    transcript: v.optional(v.string()),
    editedTranscript: v.optional(v.string()),
    mood: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    lucidityRating: v.optional(v.number()),
    isFavorite: v.optional(v.boolean()),
  },
  handler: async (ctx, { dreamId, ...updates }) => {
    const userId = await requireUserId(ctx);
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Unauthorized");
    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(dreamId, cleanUpdates);
    }
  },
});

export const deleteDream = mutation({
  args: { dreamId: v.id("dreams") },
  handler: async (ctx, { dreamId }) => {
    const userId = await requireUserId(ctx);
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(dreamId);
  },
});

export const deleteAllUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    // Delete all dreams for this user
    const dreams = await ctx.db
      .query("dreams")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const dream of dreams) {
      // Clean up storage files
      if (dream.audioStorageId) {
        try { await ctx.storage.delete(dream.audioStorageId); } catch {}
      }
      if (dream.sceneStorageId) {
        try { await ctx.storage.delete(dream.sceneStorageId); } catch {}
      }
      await ctx.db.delete(dream._id);
    }
    // Delete user usage records
    const usageRecords = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_month", (q) => q.eq("userId", userId))
      .collect();
    for (const record of usageRecords) {
      await ctx.db.delete(record._id);
    }
    // Delete user record
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (userRecord) {
      await ctx.db.delete(userRecord._id);
    }
  },
});

export const updateTranscript = internalMutation({
  args: {
    dreamId: v.id("dreams"),
    transcript: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { dreamId, transcript, userId }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Ownership mismatch");
    await ctx.db.patch(dreamId, {
      transcript,
      isTranscribing: false,
    });
  },
});

export const requestInterpretation = mutation({
  args: { dreamId: v.id("dreams") },
  handler: async (ctx, { dreamId }) => {
    const userId = await requireUserId(ctx);
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Unauthorized");

    // Server-side entitlement + usage check
    await checkAndIncrementUsage(ctx, userId, "interpretation");

    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) throw new Error("No transcript to interpret");

    await ctx.db.patch(dreamId, { isInterpreting: true });

    await ctx.scheduler.runAfter(0, internal.interpret.interpretDream, {
      dreamId,
      transcript,
      userId,
    });
  },
});

export const saveInterpretation = internalMutation({
  args: {
    dreamId: v.id("dreams"),
    userId: v.string(),
    interpretation: v.object({
      symbols: v.array(
        v.object({
          name: v.string(),
          meaning: v.string(),
          archetype: v.optional(v.string()),
        })
      ),
      hiddenPatterns: v.array(v.string()),
      emotionalTheme: v.string(),
      practicalInsight: v.string(),
      fullAnalysis: v.string(),
      generatedAt: v.number(),
    }),
  },
  handler: async (ctx, { dreamId, userId, interpretation }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Ownership mismatch");
    await ctx.db.patch(dreamId, {
      interpretation,
      isInterpreting: false,
    });
  },
});

export const failInterpretation = internalMutation({
  args: { dreamId: v.id("dreams"), userId: v.string() },
  handler: async (ctx, { dreamId, userId }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Ownership mismatch");
    await ctx.db.patch(dreamId, { isInterpreting: false });
  },
});

export const requestVisualization = mutation({
  args: {
    dreamId: v.id("dreams"),
  },
  handler: async (ctx, { dreamId }) => {
    const userId = await requireUserId(ctx);
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Unauthorized");

    // Server-side entitlement + usage check
    await requirePro(ctx, userId);
    await checkAndIncrementUsage(ctx, userId, "visualization");

    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) throw new Error("No transcript to visualize");

    await ctx.db.patch(dreamId, { isGeneratingVisual: true, imageError: undefined });

    await ctx.scheduler.runAfter(0, internal.visualize.generateVisualization, {
      dreamId,
      transcript,
      userId,
    });
  },
});

export const saveVisualization = internalMutation({
  args: {
    dreamId: v.id("dreams"),
    userId: v.string(),
    sceneStorageId: v.id("_storage"),
    sceneUrl: v.string(),
    imagePrompt: v.string(),
    visualStyle: v.string(),
  },
  handler: async (ctx, { dreamId, userId, sceneStorageId, sceneUrl, imagePrompt, visualStyle }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Ownership mismatch");
    await ctx.db.patch(dreamId, {
      sceneStorageId,
      sceneUrl,
      imagePrompt,
      visualStyle,
      visualGeneratedAt: Date.now(),
      isGeneratingVisual: false,
    });
  },
});

export const failVisualization = internalMutation({
  args: {
    dreamId: v.id("dreams"),
    userId: v.string(),
    imageError: v.optional(v.string()),
  },
  handler: async (ctx, { dreamId, userId, imageError }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream || dream.userId !== userId) throw new Error("Ownership mismatch");
    await ctx.db.patch(dreamId, {
      isGeneratingVisual: false,
      imageError: imageError ?? "Image generation failed",
    });
  },
});


export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await requireUserId(ctx);
    return await ctx.storage.getUrl(storageId);
  },
});
