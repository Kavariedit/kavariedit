import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, userProfilesTable, userTemplateCustomizationsTable, voiceoverHistoryTable, brandDnaProfilesTable, sprintProgressTable, templatesTable } from "@workspace/db";
import { sql, eq, and, gte, lt, count, countDistinct, desc } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: Request): boolean {
  if (!req.isAuthenticated()) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return req.user.email === adminEmail;
}

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

router.get("/admin/stats", async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekAgo = daysAgo(7);
  const twoWeeksAgo = daysAgo(14);
  const thirtyDaysAgo = daysAgo(30);

  // ── USER METRICS ──────────────────────────────────────────────────────────

  const [{ totalUsers }] = await db
    .select({ totalUsers: count() })
    .from(usersTable);

  const [{ newUsersThisWeek }] = await db
    .select({ newUsersThisWeek: count() })
    .from(usersTable)
    .where(gte(usersTable.createdAt, weekAgo));

  const [{ newUsersLastWeek }] = await db
    .select({ newUsersLastWeek: count() })
    .from(usersTable)
    .where(and(gte(usersTable.createdAt, twoWeeksAgo), lt(usersTable.createdAt, weekAgo)));

  const newUsersWeekChange =
    newUsersLastWeek > 0
      ? Math.round(((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100)
      : newUsersThisWeek > 0 ? 100 : 0;

  // Active = performed any tracked action
  const activeThisWeekResult = await db.execute<{ active_users: string }>(sql`
    SELECT COUNT(DISTINCT user_id) AS active_users FROM (
      SELECT user_id FROM user_template_customizations WHERE created_at >= ${weekAgo}
      UNION
      SELECT user_id FROM voiceover_history WHERE created_at >= ${weekAgo}
      UNION
      SELECT user_id FROM brand_dna_profiles WHERE created_at >= ${weekAgo}
    ) a
  `);
  const activeUsersThisWeek = parseInt(activeThisWeekResult.rows[0]?.active_users ?? "0");

  const activeTodayResult = await db.execute<{ active_users: string }>(sql`
    SELECT COUNT(DISTINCT user_id) AS active_users FROM (
      SELECT user_id FROM user_template_customizations WHERE created_at >= ${todayStart}
      UNION
      SELECT user_id FROM voiceover_history WHERE created_at >= ${todayStart}
      UNION
      SELECT user_id FROM brand_dna_profiles WHERE created_at >= ${todayStart}
    ) a
  `);
  const activeUsersToday = parseInt(activeTodayResult.rows[0]?.active_users ?? "0");

  // ── ACTION METRICS ────────────────────────────────────────────────────────

  const [{ totalTemplateActions }] = await db
    .select({ totalTemplateActions: count() })
    .from(userTemplateCustomizationsTable);

  const [{ totalVoiceActions }] = await db
    .select({ totalVoiceActions: count() })
    .from(voiceoverHistoryTable);

  const [{ totalBrandActions }] = await db
    .select({ totalBrandActions: count() })
    .from(brandDnaProfilesTable);

  const totalActions = totalTemplateActions + totalVoiceActions + totalBrandActions;

  const [{ actionsThisWeek: templateActionsThisWeek }] = await db
    .select({ actionsThisWeek: count() })
    .from(userTemplateCustomizationsTable)
    .where(gte(userTemplateCustomizationsTable.createdAt, weekAgo));

  const [{ actionsThisWeek: voiceActionsThisWeek }] = await db
    .select({ actionsThisWeek: count() })
    .from(voiceoverHistoryTable)
    .where(gte(voiceoverHistoryTable.createdAt, weekAgo));

  const [{ actionsThisWeek: brandActionsThisWeek }] = await db
    .select({ actionsThisWeek: count() })
    .from(brandDnaProfilesTable)
    .where(gte(brandDnaProfilesTable.createdAt, weekAgo));

  const actionsThisWeek = templateActionsThisWeek + voiceActionsThisWeek + brandActionsThisWeek;

  const [{ actionsLastWeek: templateActionsLastWeek }] = await db
    .select({ actionsLastWeek: count() })
    .from(userTemplateCustomizationsTable)
    .where(and(gte(userTemplateCustomizationsTable.createdAt, twoWeeksAgo), lt(userTemplateCustomizationsTable.createdAt, weekAgo)));

  const [{ actionsLastWeek: voiceActionsLastWeek }] = await db
    .select({ actionsLastWeek: count() })
    .from(voiceoverHistoryTable)
    .where(and(gte(voiceoverHistoryTable.createdAt, twoWeeksAgo), lt(voiceoverHistoryTable.createdAt, weekAgo)));

  const [{ actionsLastWeek: brandActionsLastWeek }] = await db
    .select({ actionsLastWeek: count() })
    .from(brandDnaProfilesTable)
    .where(and(gte(brandDnaProfilesTable.createdAt, twoWeeksAgo), lt(brandDnaProfilesTable.createdAt, weekAgo)));

  const actionsLastWeek = templateActionsLastWeek + voiceActionsLastWeek + brandActionsLastWeek;
  const actionsWeekChange =
    actionsLastWeek > 0
      ? Math.round(((actionsThisWeek - actionsLastWeek) / actionsLastWeek) * 100)
      : actionsThisWeek > 0 ? 100 : 0;

  const [{ actionsToday: templateActionsToday }] = await db
    .select({ actionsToday: count() })
    .from(userTemplateCustomizationsTable)
    .where(gte(userTemplateCustomizationsTable.createdAt, todayStart));

  const [{ actionsToday: voiceActionsToday }] = await db
    .select({ actionsToday: count() })
    .from(voiceoverHistoryTable)
    .where(gte(voiceoverHistoryTable.createdAt, todayStart));

  const [{ actionsToday: brandActionsToday }] = await db
    .select({ actionsToday: count() })
    .from(brandDnaProfilesTable)
    .where(gte(brandDnaProfilesTable.createdAt, todayStart));

  const actionsToday = templateActionsToday + voiceActionsToday + brandActionsToday;

  const avgActionsPerUser = totalUsers > 0 ? Math.round((totalActions / totalUsers) * 10) / 10 : 0;

  // Recent 50 actions feed (combined)
  const recentActionsResult = await db.execute<{
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    action_type: string;
    detail: string | null;
    created_at: string;
  }>(sql`
    SELECT u.id AS user_id, u.first_name, u.last_name, u.email,
           'template' AS action_type,
           t.title AS detail,
           utc.created_at
    FROM user_template_customizations utc
    JOIN users u ON u.id = utc.user_id
    LEFT JOIN templates t ON t.id = utc.template_id

    UNION ALL

    SELECT u.id AS user_id, u.first_name, u.last_name, u.email,
           'voiceover' AS action_type,
           LEFT(vh.text, 60) AS detail,
           vh.created_at
    FROM voiceover_history vh
    JOIN users u ON u.id = vh.user_id

    UNION ALL

    SELECT u.id AS user_id, u.first_name, u.last_name, u.email,
           'brand_dna' AS action_type,
           bdp.source_url AS detail,
           bdp.created_at
    FROM brand_dna_profiles bdp
    JOIN users u ON u.id = bdp.user_id

    ORDER BY created_at DESC
    LIMIT 50
  `);

  const recentActions = recentActionsResult.rows.map((r) => ({
    userId: r.user_id,
    name: [r.first_name, r.last_name].filter(Boolean).join(" ") || r.email || "Unknown",
    email: r.email,
    actionType: r.action_type,
    detail: r.detail,
    createdAt: r.created_at,
  }));

  // ── REVENUE & SUBSCRIPTIONS ──────────────────────────────────────────────

  const [{ proUsers }] = await db
    .select({ proUsers: count() })
    .from(userProfilesTable)
    .where(eq(userProfilesTable.subscriptionTier, "pro"));

  const freeUsers = totalUsers - proUsers;
  const conversionRate = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 1000) / 10 : 0;

  // Most active free users (upsell candidates)
  const upsellCandidatesResult = await db.execute<{
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    action_count: string;
    last_active: string;
  }>(sql`
    SELECT u.id AS user_id, u.first_name, u.last_name, u.email,
           COUNT(*) AS action_count,
           MAX(a.created_at) AS last_active
    FROM (
      SELECT user_id, created_at FROM user_template_customizations
      UNION ALL
      SELECT user_id, created_at FROM voiceover_history
      UNION ALL
      SELECT user_id, created_at FROM brand_dna_profiles
    ) a
    JOIN users u ON u.id = a.user_id
    JOIN user_profiles up ON up.id = a.user_id
    WHERE up.subscription_tier = 'free'
    GROUP BY u.id, u.first_name, u.last_name, u.email
    ORDER BY action_count DESC
    LIMIT 10
  `);

  const upsellCandidates = upsellCandidatesResult.rows.map((r) => ({
    userId: r.user_id,
    name: [r.first_name, r.last_name].filter(Boolean).join(" ") || r.email || "Unknown",
    email: r.email,
    actionCount: parseInt(r.action_count),
    lastActive: r.last_active,
  }));

  // ── FEATURE USAGE ─────────────────────────────────────────────────────────

  const [{ sprintCount }] = await db
    .select({ sprintCount: count() })
    .from(sprintProgressTable)
    .where(eq(sprintProgressTable.isActive, true));

  const [{ templateUniqueUsers }] = await db
    .select({ templateUniqueUsers: countDistinct(userTemplateCustomizationsTable.userId) })
    .from(userTemplateCustomizationsTable);

  const [{ voiceUniqueUsers }] = await db
    .select({ voiceUniqueUsers: countDistinct(voiceoverHistoryTable.userId) })
    .from(voiceoverHistoryTable);

  const [{ brandUniqueUsers }] = await db
    .select({ brandUniqueUsers: countDistinct(brandDnaProfilesTable.userId) })
    .from(brandDnaProfilesTable);

  const [{ sprintUniqueUsers }] = await db
    .select({ sprintUniqueUsers: countDistinct(sprintProgressTable.userId) })
    .from(sprintProgressTable);

  const featureUsage = [
    { name: "Templates", totalUses: totalTemplateActions, uniqueUsers: templateUniqueUsers, adoptionRate: totalUsers > 0 ? Math.round((templateUniqueUsers / totalUsers) * 100) : 0 },
    { name: "Voiceovers", totalUses: totalVoiceActions, uniqueUsers: voiceUniqueUsers, adoptionRate: totalUsers > 0 ? Math.round((voiceUniqueUsers / totalUsers) * 100) : 0 },
    { name: "Brand DNA", totalUses: totalBrandActions, uniqueUsers: brandUniqueUsers, adoptionRate: totalUsers > 0 ? Math.round((brandUniqueUsers / totalUsers) * 100) : 0 },
    { name: "Sprint Tracker", totalUses: sprintCount, uniqueUsers: sprintUniqueUsers, adoptionRate: totalUsers > 0 ? Math.round((sprintUniqueUsers / totalUsers) * 100) : 0 },
  ].sort((a, b) => b.totalUses - a.totalUses);

  // ── POWER USERS ───────────────────────────────────────────────────────────

  const powerUsersResult = await db.execute<{
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    created_at: string;
    total_actions: string;
    last_active: string;
  }>(sql`
    SELECT u.id AS user_id, u.first_name, u.last_name, u.email,
           u.created_at,
           COUNT(*) AS total_actions,
           MAX(a.created_at) AS last_active
    FROM (
      SELECT user_id, created_at FROM user_template_customizations
      UNION ALL
      SELECT user_id, created_at FROM voiceover_history
      UNION ALL
      SELECT user_id, created_at FROM brand_dna_profiles
    ) a
    JOIN users u ON u.id = a.user_id
    GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at
    ORDER BY total_actions DESC
    LIMIT 10
  `);

  const powerUsers = powerUsersResult.rows.map((r) => ({
    userId: r.user_id,
    name: [r.first_name, r.last_name].filter(Boolean).join(" ") || r.email || "Unknown",
    email: r.email,
    createdAt: r.created_at,
    totalActions: parseInt(r.total_actions),
    lastActive: r.last_active,
  }));

  // ── CHARTS ────────────────────────────────────────────────────────────────

  // Daily actions last 30 days
  const dailyActionsResult = await db.execute<{ day: string; count: string }>(sql`
    SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS count
    FROM (
      SELECT created_at FROM user_template_customizations WHERE created_at >= ${thirtyDaysAgo}
      UNION ALL
      SELECT created_at FROM voiceover_history WHERE created_at >= ${thirtyDaysAgo}
      UNION ALL
      SELECT created_at FROM brand_dna_profiles WHERE created_at >= ${thirtyDaysAgo}
    ) a
    GROUP BY day
    ORDER BY day ASC
  `);

  // Daily new signups last 30 days
  const dailySignupsResult = await db.execute<{ day: string; count: string }>(sql`
    SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS count
    FROM users
    WHERE created_at >= ${thirtyDaysAgo}
    GROUP BY day
    ORDER BY day ASC
  `);

  // Actions by day of week
  const actionsByDowResult = await db.execute<{ dow: string; count: string }>(sql`
    SELECT EXTRACT(DOW FROM created_at) AS dow, COUNT(*) AS count
    FROM (
      SELECT created_at FROM user_template_customizations
      UNION ALL
      SELECT created_at FROM voiceover_history
      UNION ALL
      SELECT created_at FROM brand_dna_profiles
    ) a
    GROUP BY dow
    ORDER BY dow ASC
  `);

  const dowNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const actionsByDow = dowNames.map((name, i) => {
    const found = actionsByDowResult.rows.find((r) => parseInt(r.dow) === i);
    return { day: name, count: found ? parseInt(found.count) : 0 };
  });

  // Fill in zeros for missing days in daily charts
  function fillDailyGaps(rows: { day: string; count: string }[], days: number) {
    const map = new Map(rows.map((r) => [r.day.substring(0, 10), parseInt(r.count)]));
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().substring(0, 10);
      result.push({ date: key, count: map.get(key) ?? 0 });
    }
    return result;
  }

  const dailyActions = fillDailyGaps(dailyActionsResult.rows, 30);
  const dailySignups = fillDailyGaps(dailySignupsResult.rows, 30);

  // ── ALERTS ────────────────────────────────────────────────────────────────

  const alerts: { severity: "green" | "yellow" | "red"; message: string }[] = [];

  const last24hResult = await db.execute<{ count: string }>(sql`
    SELECT COUNT(*) AS count FROM users WHERE created_at >= ${daysAgo(1)}
  `);
  const signupsLast24h = parseInt(last24hResult.rows[0]?.count ?? "0");
  if (signupsLast24h === 0) {
    alerts.push({ severity: "yellow", message: "No new signups in the last 24 hours" });
  }

  const actionsLast24hResult = await db.execute<{ count: string }>(sql`
    SELECT COUNT(*) AS count FROM (
      SELECT id FROM user_template_customizations WHERE created_at >= ${daysAgo(1)}
      UNION ALL
      SELECT id FROM voiceover_history WHERE created_at >= ${daysAgo(1)}
      UNION ALL
      SELECT id FROM brand_dna_profiles WHERE created_at >= ${daysAgo(1)}
    ) a
  `);
  const actionsLast24h = parseInt(actionsLast24hResult.rows[0]?.count ?? "0");
  if (actionsLast24h === 0 && totalUsers > 0) {
    alerts.push({ severity: "red", message: "No user activity in the last 24 hours" });
  }

  if (conversionRate < 1 && totalUsers > 20) {
    alerts.push({ severity: "yellow", message: `Low conversion rate: ${conversionRate}% of users are on Pro` });
  }

  if (alerts.length === 0) {
    alerts.push({ severity: "green", message: "All systems healthy — no issues detected" });
  }

  res.json({
    generatedAt: now.toISOString(),
    userMetrics: {
      totalUsers,
      newUsersThisWeek,
      newUsersLastWeek,
      newUsersWeekChange,
      activeUsersThisWeek,
      activeUsersToday,
    },
    actionMetrics: {
      totalActions,
      actionsThisWeek,
      actionsLastWeek,
      actionsWeekChange,
      actionsToday,
      avgActionsPerUser,
      recentActions,
    },
    revenue: {
      freeUsers,
      proUsers,
      conversionRate,
      upsellCandidates,
    },
    featureUsage,
    powerUsers,
    charts: {
      dailyActions,
      dailySignups,
      actionsByDow,
    },
    alerts,
  });
});

export default router;
