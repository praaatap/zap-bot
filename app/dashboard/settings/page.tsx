"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  CreditCard,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserSettings = {
  email: string;
  name: string;
  currentPlan: string;
  subscriptionStatus: string;
  meetingsThisMonth: number;
  chatMessagesToday: number;
  resolvedBotName: string;
  calendarConnected: boolean;
};

type BillingRow = {
  id: string;
  date: string;
  amount: string;
  status: "Pending" | "Refund" | "Paid";
  description: string;
};

const tabs = ["My details", "Plan", "Billings"] as const;

export default function SettingsPage() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("My details");
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsRes = await fetch("/api/user/settings");

        if (settingsRes.ok) {
          const { data } = await settingsRes.json();
          const account = data?.account || {};
          setSettings({
            email: account.email || user?.emailAddresses?.[0]?.emailAddress || "",
            name: account.name || user?.fullName || "",
            currentPlan: account.currentPlan || "free",
            subscriptionStatus: account.subscriptionStatus || "inactive",
            meetingsThisMonth: Number(account.meetingsThisMonth || 0),
            chatMessagesToday: Number(account.chatMessagesToday || 0),
            resolvedBotName: account.resolvedBotName || "User Agent Bot",
            calendarConnected: Boolean(account.calendarConnected),
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return billingHistory;
    return billingHistory.filter((row) =>
      [row.description, row.date, row.amount, row.status].some((value) => value.toLowerCase().includes(query))
    );
  }, [searchQuery, billingHistory]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="rounded-3xl border border-[#e6e8ee] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Settings</h1>
            <p className="mt-1 text-sm text-[#6b7280]">Manage your account settings and preferences.</p>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[#eceef3] pt-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition",
                  selectedTab === tab
                    ? "border border-[#d8deea] bg-white text-[#111827] shadow-sm"
                    : "border border-transparent bg-transparent text-[#6b7280] hover:border-[#e5e7eb] hover:bg-[#fafafa] hover:text-[#111827]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="rounded-3xl border border-[#e6e8ee] bg-white shadow-sm">
        <div className="border-b border-[#eceef3] p-5">
          <h2 className="text-lg font-semibold tracking-tight text-[#111827]">Account Details</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Your profile and subscription information.</p>
        </div>

        <div className="p-5 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading settings...
            </div>
          ) : settings ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e6e8ee] bg-[#fafafa] p-5">
                  <h3 className="text-sm font-semibold text-[#111827]">Profile</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[#6b7280]">Name</p>
                      <p className="text-sm font-medium text-[#111827]">{settings.name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6b7280]">Email</p>
                      <p className="text-sm font-medium text-[#111827]">{settings.email}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e6e8ee] bg-[#fafafa] p-5">
                  <h3 className="text-sm font-semibold text-[#111827]">Subscription</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[#6b7280]">Current Plan</p>
                      <p className="text-sm font-semibold text-[#111827] capitalize">{settings.currentPlan}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6b7280]">Status</p>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        settings.subscriptionStatus === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {settings.subscriptionStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#e6e8ee] bg-[#fafafa] p-5">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">Usage This Month</h3>
                  <p className="mt-1 text-sm text-[#6b7280]">Track your meeting and chat limits.</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#111827]">{settings.meetingsThisMonth}</p>
                    <p className="text-xs text-[#6b7280]">Meetings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#111827]">{settings.chatMessagesToday}</p>
                    <p className="text-xs text-[#6b7280]">Chat Today</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e6e8ee] bg-[#fafafa] p-5">
                  <h3 className="text-sm font-semibold text-[#111827]">Meeting Agent</h3>
                  <p className="mt-1 text-sm text-[#6b7280]">This is the identity used when bots join external meetings.</p>
                  <p className="mt-4 rounded-xl border border-[#e6e8ee] bg-white px-4 py-3 text-sm font-semibold text-[#111827]">
                    {settings.resolvedBotName}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6e8ee] bg-[#fafafa] p-5">
                  <h3 className="text-sm font-semibold text-[#111827]">Calendar Sync</h3>
                  <p className="mt-1 text-sm text-[#6b7280]">Google Calendar connection used for automatic meeting imports.</p>
                  <span className={cn(
                    "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold",
                    settings.calendarConnected
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  )}>
                    {settings.calendarConnected ? "Connected" : "Not connected"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-[#6b7280]">Failed to load settings</p>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-3xl border border-[#e6e8ee] bg-white shadow-sm">
        <div className="border-b border-[#eceef3] p-5">
          <h2 className="text-lg font-semibold tracking-tight text-[#111827]">Billing History</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Your payment and invoice records</p>
        </div>

        <div className="p-5">
          {billingHistory.length === 0 ? (
            <div className="py-16 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-[#6b7280]">No billing history yet</p>
              <p className="text-xs text-[#9ca3af] mt-1">Your invoices will appear here once you upgrade to a paid plan.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search billing history..."
                    className="h-10 w-[260px] rounded-xl border border-[#e5e7eb] bg-white pl-9 pr-4 text-[13px] text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#eceef3] text-left">
                  <thead className="bg-[#fafafa]">
                    <tr className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6b7280]">
                      <th className="px-5 py-4">Description</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef3] bg-white">
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="transition hover:bg-[#fafafa]">
                        <td className="px-5 py-4 align-middle">
                          <span className="text-sm font-medium text-[#111827]">{row.description}</span>
                        </td>
                        <td className="px-5 py-4 align-middle text-sm text-[#374151]">{row.date}</td>
                        <td className="px-5 py-4 align-middle text-sm text-[#374151]">{row.amount}</td>
                        <td className="px-5 py-4 align-middle">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
                              row.status === "Pending" && "border-amber-200 bg-amber-50 text-amber-700",
                              row.status === "Refund" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                              row.status === "Paid" && "border-blue-200 bg-blue-50 text-[#0058be]"
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <button className="rounded-lg p-2 hover:bg-[#f3f4f6] hover:text-[#111827]">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
