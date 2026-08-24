"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getBusinessSummary,
  getBusinessTransactions,
} from "@/lib/api";

type Business = {
  business_id: string;
  total_transactions: number;
  total_value: number;
  average_transaction: number;
  high_risk_transactions: number;
  medium_risk_transactions: number;
  low_risk_transactions: number;
};

type Transaction = {
  transaction_id: string;
  business_id: string;
  amount: number;
  timestamp: string;
  risk_score: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
};

export default function BusinessPage() {
  const params = useParams();
  const id = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const [businessData, transactionData] = await Promise.all([
          getBusinessSummary(id),
          getBusinessTransactions(id, "HIGH"),
        ]);

        setBusiness(businessData);
        setTransactions(transactionData.slice(0, 10));
      } catch (error) {
        console.error("Business page error:", error);
        setError("Unable to load business information.");
      }
    }

    load();
  }, [id]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading business...</p>
      </main>
    );
  }

  const riskStatus =
    business.high_risk_transactions > 0
      ? "ATTENTION"
      : business.medium_risk_transactions > 0
        ? "MONITOR"
        : "NORMAL";

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/businesses"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Businesses
        </Link>

        <header className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Business {business.business_id}
            </h1>

            <p className="mt-2 text-slate-600">
              SME payment behaviour and risk profile
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              riskStatus === "ATTENTION"
                ? "bg-red-100 text-red-700"
                : riskStatus === "MONITOR"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}
          >
            {riskStatus}
          </span>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Transactions"
            value={business.total_transactions.toLocaleString()}
          />

          <Metric
            label="Payment Volume"
            value={`$${business.total_value.toLocaleString()}`}
          />

          <Metric
            label="Average Transaction"
            value={`$${business.average_transaction.toLocaleString()}`}
          />

          <Metric
            label="High-Risk Transactions"
            value={business.high_risk_transactions.toLocaleString()}
          />
        </section>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Risk Profile
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <RiskMetric
              label="High Risk"
              value={business.high_risk_transactions}
            />

            <RiskMetric
              label="Medium Risk"
              value={business.medium_risk_transactions}
            />

            <RiskMetric
              label="Low Risk"
              value={business.low_risk_transactions}
            />
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              High-Risk Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent transactions requiring investigation
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No high-risk transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Risk Score</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.transaction_id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {transaction.transaction_id}
                      </td>

                      <td className="px-6 py-4">
                        ${transaction.amount.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 font-semibold text-red-600">
                        {transaction.risk_score}/100
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {new Date(
                          transaction.timestamp
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/transactions/${transaction.transaction_id}`}
                          className="font-medium text-slate-700 hover:text-slate-950"
                        >
                          Investigate →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function RiskMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}