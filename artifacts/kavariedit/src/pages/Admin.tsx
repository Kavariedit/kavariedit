import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, TrendingUp, TrendingDown, Zap, Crown, AlertTriangle,
  CheckCircle, AlertCircle, RefreshCw, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface AdminStats {
  generatedAt: string;
  userMetrics: {
    totalUsers: number;
    newUsersThisWeek: number;
    newUsersWeekChange: number;
    activeUsersThisWeek: number;
    activeUsersToday: number;
  };
  actionMetrics: {
    totalActions: number;
    actionsThisWeek: number;
    actionsWeekChange: number;
    actionsToday: number;
    avgActionsPerUser: number;
    recentActions: Array<{
      userId: string;
      name: string;
      email: string | null;
      actionType: string;
      detail: string | null;
      createdAt: string;
    }>;
  };
  revenue: {
    freeUsers: number;
    proUsers: number;
    conversionRate: number;
    upsellCandidates: Array<{
      userId: string;
      name: string;
      email: string | null;
      actionCount: number;
      lastActive: string;
    }>;
  };
  featureUsage: Array<{
    name: string;
    totalUses: number;
    uniqueUsers: number;
    adoptionRate: number;
  }>;
  powerUsers: Array<{
    userId: string;
    name: string;
    email: string | null;
    createdAt: string;
    totalActions: number;
    lastActive: string;
  }>;
  charts: {
    dailyActions: Array<{ date: string; count: number }>;
    dailySignups: Array<{ date: string; count: number }>;
    actionsByDow: Array<{ day: string; count: number }>;
  };
  alerts: Array<{ severity: "green" | "yellow" | "red"; message: string }>;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function actionLabel(type: string) {
  if (type === "template") return "Used Template";
  if (type === "voiceover") return "Generated Voiceover";
  if (type === "brand_dna") return "Extracted Brand DNA";
  return type;
}

function actionBadgeColor(type: string) {
  if (type === "template") return "bg-blue-100 text-blue-700";
  if (type === "voiceover") return "bg-purple-100 text-purple-700";
  if (type === "brand_dna") return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-700";
}

function StatCard({
  label,
  value,
  sub,
  change,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-300" />}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
      <div className="flex items-center gap-2 mt-1">
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}% vs last week
          </span>
        )}
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-gray-800 mb-3">{children}</h2>;
}

export default function Admin() {
  const [, navigate] = useLocation();

  const { data, isLoading, isError, error, dataUpdatedAt, refetch } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.status === 403) throw new Error("forbidden");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    refetchInterval: 60_000,
    retry: false,
  });

  if (isError) {
    const msg = (error as Error).message;
    if (msg === "forbidden") {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500 mb-4">You don't have permission to view this page.</p>
            <button onClick={() => navigate("/dashboard")} className="text-sm text-blue-600 hover:underline">
              Back to dashboard
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load admin data.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const { userMetrics, actionMetrics, revenue, featureUsage, powerUsers, charts, alerts } = data;
  const maxFeatureUse = Math.max(...featureUsage.map((f) => f.totalUses), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated {dataUpdatedAt ? timeAgo(new Date(dataUpdatedAt).toISOString()) : "—"} · Auto-refreshes every 60s
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ALERTS */}
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                alert.severity === "green"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : alert.severity === "yellow"
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {alert.severity === "green" ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {alert.message}
            </div>
          ))}
        </div>

        {/* USER METRICS */}
        <section>
          <SectionTitle>Users</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={userMetrics.totalUsers} icon={Users} />
            <StatCard
              label="New This Week"
              value={userMetrics.newUsersThisWeek}
              change={userMetrics.newUsersWeekChange}
              icon={TrendingUp}
            />
            <StatCard
              label="Active This Week"
              value={userMetrics.activeUsersThisWeek}
              sub="performed an action"
              icon={Zap}
            />
            <StatCard
              label="Active Today"
              value={userMetrics.activeUsersToday}
              sub="performed an action"
              icon={Zap}
            />
          </div>
        </section>

        {/* ACTIONS */}
        <section>
          <SectionTitle>Actions (Templates · Voiceovers · Brand DNA)</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Actions" value={actionMetrics.totalActions} />
            <StatCard
              label="Actions This Week"
              value={actionMetrics.actionsThisWeek}
              change={actionMetrics.actionsWeekChange}
            />
            <StatCard label="Actions Today" value={actionMetrics.actionsToday} />
            <StatCard label="Avg per User" value={actionMetrics.avgActionsPerUser} />
          </div>

          {/* Recent actions feed */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-700">Recent 50 Actions</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {actionMetrics.recentActions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No actions yet</p>
              ) : (
                actionMetrics.recentActions.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                        {(a.name?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                        {a.detail && (
                          <p className="text-xs text-gray-400 truncate max-w-xs">{a.detail}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionBadgeColor(a.actionType)}`}>
                        {actionLabel(a.actionType)}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(a.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* CHARTS */}
        <section>
          <SectionTitle>Trends (Last 30 Days)</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-medium text-gray-700 mb-4">Daily Actions</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={charts.dailyActions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip labelFormatter={shortDate} formatter={(v) => [v, "Actions"]} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-medium text-gray-700 mb-4">Daily New Signups</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={charts.dailySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip labelFormatter={shortDate} formatter={(v) => [v, "Signups"]} />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-medium text-gray-700 mb-4">Activity by Day of Week</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={charts.actionsByDow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, "Actions"]} />
                  <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-medium text-gray-700 mb-4">Free vs Pro Users</p>
              <div className="flex flex-col justify-center h-[180px] gap-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-500">Free</span>
                    <span className="font-medium text-gray-700">{revenue.freeUsers.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gray-400 h-3 rounded-full transition-all"
                      style={{ width: `${userMetrics.totalUsers > 0 ? (revenue.freeUsers / userMetrics.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-500">Pro</span>
                    <span className="font-medium text-gray-700">{revenue.proUsers.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-indigo-500 h-3 rounded-full transition-all"
                      style={{ width: `${userMetrics.totalUsers > 0 ? (revenue.proUsers / userMetrics.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Conversion rate</span>
                  <span className="text-sm font-bold text-indigo-600">{revenue.conversionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE USAGE */}
        <section>
          <SectionTitle>Feature Usage</SectionTitle>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Feature</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Total Uses</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Unique Users</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Adoption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {featureUsage.map((f) => (
                  <tr key={f.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{f.name}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{f.totalUses.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{f.uniqueUsers.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${f.adoptionRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{f.adoptionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* POWER USERS + UPSELL CANDIDATES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <SectionTitle>Power Users</SectionTitle>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {powerUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
                ) : (
                  powerUsers.map((u, i) => (
                    <div key={u.userId} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">Joined {fmtDate(u.createdAt)} · last active {timeAgo(u.lastActive)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-bold text-gray-700">{u.totalActions}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Upsell Candidates (Active Free Users)</SectionTitle>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {revenue.upsellCandidates.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No free users with activity</p>
                ) : (
                  revenue.upsellCandidates.map((u, i) => (
                    <div key={u.userId} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email ?? "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <Crown className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-sm font-bold text-gray-700">{u.actionCount} actions</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {/* NOT YET TRACKED */}
        <section>
          <SectionTitle>Not Yet Tracked</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Day 1 / Week 1 Retention",
              "User Streaks & At-Risk Users",
              "Geography & Timezone",
              "Session Length & Page Views",
              "Error Logs",
              "Search Queries",
              "Time to First Action",
              "Revenue Amounts (Stripe)",
            ].map((label) => (
              <div key={label} className="bg-white border border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-300 shrink-0" />
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
