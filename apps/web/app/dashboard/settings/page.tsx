"use client";


import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleEllipsis,
  CreditCard,
  Download,
  Ellipsis,
  HelpCircle,
  Mail,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BillingRow = {
  id: string;
  invoice: string;
  date: string;
  amount: string;
  status: "Pending" | "Cancelled" | "Refund" | "Paid";
  tracking: string;
  address: string;
};

const tabs = ["My details", "Profile", "Password", "Team", "Billings", "Plan", "Email", "Notifications"] as const;

const billingRows: BillingRow[] = [
  {
    id: "1",
    invoice: "Account Sale",
    date: "Apr 14, 2024",
    amount: "$3,050",
    status: "Pending",
    tracking: "LM580405575CN",
    address: "313 Main Road, Sunderland",
  },
  {
    id: "2",
    invoice: "Account Sale",
    date: "Jun 24, 2024",
    amount: "$1,050",
    status: "Cancelled",
    tracking: "AZ938540353US",
    address: "96 Grange Road, Peterborough",
  },
  {
    id: "3",
    invoice: "Netflix Subscription",
    date: "Feb 28, 2024",
    amount: "$800",
    status: "Refund",
    tracking: "SS331605504US",
    address: "2 New Street, Harrogate",
  },
  {
    id: "4",
    invoice: "Workspace License",
    date: "Mar 11, 2024",
    amount: "$2,450",
    status: "Paid",
    tracking: "TR441305992US",
    address: "140 King Street, London",
  },
];

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("Billings");
  const [searchQuery, setSearchQuery] = useState("");
  const [cardName, setCardName] = useState("Mayad Ahmed");
  const [expiry, setExpiry] = useState("02 / 2028");
  const [cardNumber, setCardNumber] = useState("8269 9620 9292 2538");
  const [cvv, setCvv] = useState("••••");
  const [contactMode, setContactMode] = useState<"existing" | "another">("existing");

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return billingRows;
    return billingRows.filter((row) =>
      [row.invoice, row.date, row.amount, row.status, row.tracking, row.address].some((value) => value.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-8">
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

      <div className="rounded-3xl border border-[#e6e8ee] bg-white shadow-sm">
        <div className="border-b border-[#eceef3] p-5">
          <h2 className="text-lg font-semibold tracking-tight text-[#111827]">Payment Method</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Update your billing details and address.</p>
        </div>

        <div className="grid gap-6 p-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111827]">Card Details</h3>
              <p className="mt-1 text-sm text-[#6b7280]">Update your billing details and address.</p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 py-2 text-sm font-medium text-[#374151] hover:border-[#d8deea] hover:bg-white">
              <Plus size={14} />
              Add another card
            </button>

            <div className="rounded-3xl border border-[#e6e8ee] bg-[#fafafa] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                  <CreditCard size={16} className="text-[#0058be]" />
                  Card preview
                </div>
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0058be]">Primary</span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#374151]">Name on your Card</span>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#374151]">Expiry</span>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#374151]">Card Number</span>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#374151]">CVV</span>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6e8ee] bg-[#fafafa] p-5">
              <h3 className="text-sm font-semibold text-[#111827]">Contact email</h3>
              <p className="mt-1 text-sm text-[#6b7280]">Where should invoices be sent?</p>

              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-4">
                  <input
                    type="radio"
                    checked={contactMode === "existing"}
                    onChange={() => setContactMode("existing")}
                    className="mt-1 h-4 w-4 accent-[#0058be]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Send to the existing email</p>
                    <p className="mt-1 text-sm text-[#6b7280]">mayadahmed@ofpsace.co</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-4">
                  <input
                    type="radio"
                    checked={contactMode === "another"}
                    onChange={() => setContactMode("another")}
                    className="mt-1 h-4 w-4 accent-[#0058be]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Add another email address</p>
                    <p className="mt-1 text-sm text-[#6b7280]">Use a different billing contact.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6e8ee] bg-[#fafafa] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <ShieldCheck size={16} className="text-emerald-600" />
                Secure billing profile
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">Card data is stored securely and billing updates sync across your workspace instantly.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e6e8ee] bg-white shadow-sm">
        <div className="border-b border-[#eceef3] p-5">
          <h2 className="text-lg font-semibold tracking-tight text-[#111827]">Billing History</h2>
          <p className="mt-1 text-sm text-[#6b7280]">See the transaction you made</p>
        </div>

        <div className="flex flex-col gap-4 border-b border-[#eceef3] p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white">All</button>
            <button className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">Unfulfilled</button>
            <button className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">Unpaid</button>
            <button className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">Open</button>
            <button className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">Closed</button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">
              <Plus size={14} />
              Add
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">
              <Search size={16} />
            </button>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">
              <SlidersHorizontal size={16} />
            </button>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#d8deea] hover:text-[#111827]">
              <CircleEllipsis size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#eceef3] text-left">
            <thead className="bg-[#fafafa]">
              <tr className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6b7280]">
                <th className="px-5 py-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-[#d1d5db] bg-white" />
                    Invoice
                  </span>
                </th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Tracking & Address</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef3] bg-white">
              {filteredRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-[#fafafa]">
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded border border-[#d1d5db] bg-white" />
                      <span className="text-sm font-medium text-[#111827]">{row.invoice}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-[#374151]">{row.date}</td>
                  <td className="px-5 py-4 align-middle text-sm text-[#374151]">{row.amount}</td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
                        row.status === "Pending" && "border-amber-200 bg-amber-50 text-amber-700",
                        row.status === "Cancelled" && "border-red-200 bg-red-50 text-red-700",
                        row.status === "Refund" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                        row.status === "Paid" && "border-blue-200 bg-blue-50 text-[#0058be]"
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div>
                      <p className="text-sm font-medium text-[#0058be]">{row.tracking}</p>
                      <p className="mt-1 text-sm text-[#6b7280]">{row.address}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2 text-[#9ca3af]">
                      <button className="rounded-lg p-2 hover:bg-[#f3f4f6] hover:text-[#111827]">
                        <HelpCircle size={16} />
                      </button>
                      <button className="rounded-lg p-2 hover:bg-[#f3f4f6] hover:text-[#111827]">
                        <Ellipsis size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#eceef3] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#6b7280]">Showing {filteredRows.length} invoice rows</p>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:border-[#d8deea] hover:bg-[#fafafa]">
                <Download size={14} />
                Export
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
                <Sparkles size={14} />
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}