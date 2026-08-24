"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import Link from "next/link";

type DashboardStats = {
  total_transactions: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  total_value: number;
};

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {
        setError("Unable to connect to the backend.");
      });
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Risk Overview
            </h1>

            <p className="mt-2 text-slate-600">
              Monitor SME payment activity and identify transactions requiring attention.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/transactions?risk_level=HIGH"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Review High Risk
            </Link>

            <Link
              href="/businesses"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View Businesses
            </Link>
          </div>
        </header>

        {/* Summary */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Transactions"
            value={stats.total_transactions.toLocaleString()}
          />

          <StatCard
            title="High Risk"
            value={stats.high_risk.toLocaleString()}
          />

          <StatCard
            title="Medium Risk"
            value={stats.medium_risk.toLocaleString()}
          />

          <StatCard
            title="Total Value"
            value={`$${stats.total_value.toLocaleString()}`}
          />
        </section>

        {/* Risk Overview */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Risk Overview
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <RiskCard
              title="High Risk"
              value={stats.high_risk}
            />

            <RiskCard
              title="Medium Risk"
              value={stats.medium_risk}
            />

            <RiskCard
              title="Low Risk"
              value={stats.low_risk}
            />
          </div>
        </section>

        {/* Risk Distribution */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Transaction Risk Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current risk classification across monitored transactions
            </p>
          </div>

          <div className="space-y-5">
            <RiskBar
              label="High Risk"
              value={stats.high_risk}
              total={stats.total_transactions}
            />

            <RiskBar
              label="Medium Risk"
              value={stats.medium_risk}
              total={stats.total_transactions}
            />

            <RiskBar
              label="Low Risk"
              value={stats.low_risk}
              total={stats.total_transactions}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function RiskCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  const isHighRisk = title === "High Risk";

  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        {isHighRisk && value > 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            Attention
          </span>
        )}
      </div>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
function RiskBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="text-sm text-slate-500">
          {value.toLocaleString()} ({percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-800 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}