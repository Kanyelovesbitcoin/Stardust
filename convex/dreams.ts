import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const listDreams = query({
  args: {},
  handler: async (ctx) => {
    // For Phase 1, we'll use a simple query without auth
    // Auth will be added in a later phase
    return await ctx.db.query("dreams").order("desc").collect();
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
    const allDreams = await ctx.db.query("dreams").order("desc").collect();
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
    transcript: v.optional(v.string()),
    mood: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    audioStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const hasAudio = args.audioStorageId !== undefined;
    const dreamId = await ctx.db.insert("dreams", {
      userId: "local", // Placeholder until auth is added
      createdAt: Date.now(),
      audioStorageId: args.audioStorageId,
      transcript: args.transcript,
      tags: args.tags ?? [],
      mood: args.mood,
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

/** Max free visualizations per day for non-pro users */
const FREE_DAILY_VISUALIZATIONS = 1;

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const requestVisualization = mutation({
  args: {
    dreamId: v.id("dreams"),
    isPro: v.optional(v.boolean()),
  },
  handler: async (ctx, { dreamId, isPro }) => {
    const dream = await ctx.db.get(dreamId);
    if (!dream) throw new Error("Dream not found");

    const transcript = dream.editedTranscript || dream.transcript;
    if (!transcript) throw new Error("No transcript to visualize");

    // Server-side daily limit for free users
    const userId = dream.userId;
    const today = todayDateKey();

    if (!isPro) {
      const usage = await ctx.db
        .query("usageLimits")
        .withIndex("by_user_week", (q) => q.eq("userId", userId).eq("weekStartDate", today))
        .first();

      if (usage && usage.visualizations >= FREE_DAILY_VISUALIZATIONS) {
        throw new Error("Daily free visualization limit reached. Upgrade to Stardust Pro for unlimited.");
      }

      // Increment or create usage record
      if (usage) {
        await ctx.db.patch(usage._id, { visualizations: usage.visualizations + 1 });
      } else {
        await ctx.db.insert("usageLimits", {
          userId,
          weekStartDate: today,
          voiceRecordings: 0,
          interpretations: 0,
          visualizations: 1,
        });
      }
    }

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

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
