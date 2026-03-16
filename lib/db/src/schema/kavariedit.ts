import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "instagram",
  "etsy",
  "other",
]);

export const templateCategoryEnum = pgEnum("template_category", [
  "planner",
  "checklist",
  "instagram",
  "pinterest",
  "mockup",
  "reel_cover",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "pinterest",
  "tiktok",
]);

export const competitionLevelEnum = pgEnum("competition_level", [
  "low",
  "medium",
  "high",
]);

// Extend the auth users table with Kavariedit-specific fields
export const userProfilesTable = pgTable("user_profiles", {
  id: varchar("id").primaryKey(),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .notNull()
    .default("free"),
  stripeCustomerId: varchar("stripe_customer_id"),
  subscriptionEndsAt: timestamp("subscription_ends_at", {
    withTimezone: true,
  }),
  voiceCloneId: varchar("voice_clone_id"),
  voiceoversUsedThisMonth: integer("voiceovers_used_this_month")
    .notNull()
    .default(0),
  voiceoversResetAt: timestamp("voiceovers_reset_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const brandDnaProfilesTable = pgTable("brand_dna_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull().default("other"),
  primaryColor: varchar("primary_color").notNull().default("#E8B4B8"),
  secondaryColor: varchar("secondary_color").notNull().default("#F5E6E8"),
  accentColor: varchar("accent_color").notNull().default("#C9A8B2"),
  neutralColor: varchar("neutral_color").notNull().default("#9B8FA0"),
  backgroundColor: varchar("background_color").notNull().default("#FDF6F7"),
  fontMood: varchar("font_mood").notNull().default("modern sans-serif"),
  contentVibe: varchar("content_vibe").notNull().default("minimal and feminine"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertBrandDnaProfileSchema = createInsertSchema(
  brandDnaProfilesTable,
).omit({ id: true, createdAt: true });
export type InsertBrandDnaProfile = z.infer<typeof insertBrandDnaProfileSchema>;
export type BrandDnaProfile = typeof brandDnaProfilesTable.$inferSelect;

export const templatesTable = pgTable("templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  category: templateCategoryEnum("category").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  dimensionsWidth: integer("dimensions_width").notNull().default(1080),
  dimensionsHeight: integer("dimensions_height").notNull().default(1080),
  templateData: jsonb("template_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Template = typeof templatesTable.$inferSelect;

export const socialTemplatesTable = pgTable("social_templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  platform: socialPlatformEnum("platform").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  dimensionsWidth: integer("dimensions_width").notNull().default(1080),
  dimensionsHeight: integer("dimensions_height").notNull().default(1080),
  captionSuggestions: text("caption_suggestions").array().notNull().default(sql`'{}'::text[]`),
  templateData: jsonb("template_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SocialTemplate = typeof socialTemplatesTable.$inferSelect;

export const userTemplateCustomizationsTable = pgTable(
  "user_template_customizations",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    templateId: varchar("template_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const voiceoverHistoryTable = pgTable("voiceover_history", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  audioUrl: text("audio_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type VoiceoverHistory = typeof voiceoverHistoryTable.$inferSelect;

export const trendingNichesTable = pgTable("trending_niches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  demandScore: integer("demand_score").notNull(),
  competitionLevel: competitionLevelEnum("competition_level").notNull(),
  description: text("description").notNull(),
  productIdeas: text("product_ideas").array().notNull().default(sql`'{}'::text[]`),
  relatedTemplateIds: text("related_template_ids").array().notNull().default(sql`'{}'::text[]`),
  lastUpdated: timestamp("last_updated", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TrendingNiche = typeof trendingNichesTable.$inferSelect;

export const sprintProgressTable = pgTable("sprint_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  isActive: boolean("is_active").notNull().default(false),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedDays: integer("completed_days").array().notNull().default(sql`'{}'::integer[]`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SprintProgress = typeof sprintProgressTable.$inferSelect;
