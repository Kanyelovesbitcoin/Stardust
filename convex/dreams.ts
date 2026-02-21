import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";

/** Get the authenticated user's ID, or fall back to "local" if auth is not configured */
async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? "local";
}

export const listDreams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
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
    return await ctx.db.get(dreamId);
  },
});

/** Lightweight query for gallery — only returns fields needed to render the image grid */
export const listGalleryDreams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
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
    const userId = await getUserId(ctx);
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
    isTranscribing: v.optional(v.boolean()),
    isInterpreting: v.optional(v.boolean()),
    isGeneratingVisual: v.optional(v.boolean()),
  },
  handler: async (ctx, { dreamId, ...updates }) => {
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
    await ctx.db.delete(dreamId);
  },
});

export const updateTranscript = internalMutation({
  args: {
    dreamId: v.id("dreams"),
    transcript: v.string(),
  },
  handler: async (ctx, { dreamId, transcript }) => {
    await ctx.db.patch(dreamId, {
      transcript,
      isTranscribing: false,
    });
  },
});

export const requestInterpretation = mutation({
  args: { dreamId: v.id("dreams") },
  handler: async (ctx, { dreamId }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream) throw new Error("Dream not found");

    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) throw new Error("No transcript to interpret");

    await ctx.db.patch(dreamId, { isInterpreting: true });

    await ctx.scheduler.runAfter(0, internal.interpret.interpretDream, {
      dreamId,
      transcript,
    });
  },
});

export const saveInterpretation = internalMutation({
  args: {
    dreamId: v.id("dreams"),
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
  handler: async (ctx, { dreamId, interpretation }) => {
    await ctx.db.patch(dreamId, {
      interpretation,
      isInterpreting: false,
    });
  },
});

export const failInterpretation = internalMutation({
  args: { dreamId: v.id("dreams") },
  handler: async (ctx, { dreamId }) => {
    await ctx.db.patch(dreamId, { isInterpreting: false });
  },
});

export const requestVisualization = mutation({
  args: {
    dreamId: v.id("dreams"),
  },
  handler: async (ctx, { dreamId }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream) throw new Error("Dream not found");

    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) throw new Error("No transcript to visualize");

    await ctx.db.patch(dreamId, { isGeneratingVisual: true, imageError: undefined });

    await ctx.scheduler.runAfter(0, internal.visualize.generateVisualization, {
      dreamId,
      transcript,
    });
  },
});

export const saveVisualization = internalMutation({
  args: {
    dreamId: v.id("dreams"),
    sceneStorageId: v.id("_storage"),
    sceneUrl: v.string(),
    imagePrompt: v.string(),
    visualStyle: v.string(),
  },
  handler: async (ctx, { dreamId, sceneStorageId, sceneUrl, imagePrompt, visualStyle }) => {
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
    imageError: v.optional(v.string()),
  },
  handler: async (ctx, { dreamId, imageError }) => {
    await ctx.db.patch(dreamId, {
      isGeneratingVisual: false,
      imageError: imageError ?? "Image generation failed",
    });
  },
});

/** Clear all usage limits — useful for demo resets */
export const clearUsageLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("usageLimits").collect();
    for (const record of all) {
      await ctx.db.delete(record._id);
    }
    return { deleted: all.length };
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
