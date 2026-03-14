import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dreams: defineTable({
    userId: v.string(),
    createdAt: v.number(),
    audioStorageId: v.optional(v.id("_storage")),
    title: v.optional(v.string()),
    transcript: v.optional(v.string()),
    editedTranscript: v.optional(v.string()),
    tags: v.array(v.string()),
    mood: v.optional(v.string()),
    category: v.optional(v.string()), // "ink" | "hope" | "archive"
    dreamType: v.optional(v.string()), // "nightmare" | "lucid" | "vivid" | "ocean"
    lucidityRating: v.number(),
    isFavorite: v.boolean(),
    // Interpretation (populated by AI action)
    interpretation: v.optional(
      v.object({
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
      })
    ),
    // Visuals (populated by image gen action)
    sceneStorageId: v.optional(v.id("_storage")),
    sceneUrl: v.optional(v.string()),
    moodBoardUrl: v.optional(v.string()),
    imagePrompt: v.optional(v.string()),
    visualStyle: v.optional(v.string()),
    visualGeneratedAt: v.optional(v.number()),
    imageError: v.optional(v.string()),
    // Status flags for real-time UI updates
    isTranscribing: v.boolean(),
    isInterpreting: v.boolean(),
    isGeneratingVisual: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "createdAt"]),

  users: defineTable({
    userId: v.string(),
    email: v.optional(v.string()),
    subscriptionStatus: v.string(), // "free" | "pro"
    subscriptionStartedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  aiUsage: defineTable({
    userId: v.string(),
    month: v.string(), // "YYYY-MM"
    interpretationsUsed: v.number(),
    visualizationsUsed: v.number(),
    createdAt: v.number(),
  }).index("by_user_month", ["userId", "month"]),
});
