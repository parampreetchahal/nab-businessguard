"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTransaction, getBusinessSummary } from "@/lib/api";

type Transaction = {
  transaction_id: string;
  business_id: string;
  amount: number;
  timestamp: string;
  payee: string;
  payment_type: string;
  device_id: string;
  location: string;
  is_new_payee: boolean;
  is_new_device: boolean;
  historical_avg_amount: number;
  risk_score: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
  ml_anomaly_score: number;
};

type BusinessSummary = {
  business_id: string;
  total_transactions: number;
  total_value: number;
  average_transaction: number;
  high_risk_transactions: number;
  medium_risk_transactions: number;
  low_risk_transactions: number;
};

export default function TransactionPage() {
  const params = useParams();
  const id = params.id as string;

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [business, setBusiness] =
    useState<BusinessSummary | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const transactionData = await getTransaction(id);

        setTransaction(transactionData);

        const businessData = await getBusinessSummary(
          transactionData.business_id
        );

        setBusiness(businessData);
      } catch (error) {
        console.error("Transaction page error:", error);
        setError("Unable to load transaction.");
      }
    }

    load();
  }, [id]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading investigation...</p>
      </main>
    );
  }

  const riskColors = getRiskColor(transaction.risk_score);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Back navigation */}

        <Link
          href="/transactions"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Transactions
        </Link>

        {/* Header */}

        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Transaction Investigation
            </h1>

            <p className="mt-2 text-slate-600">
              {transaction.transaction_id}
            </p>
          </div>

          <RiskBadge level={transaction.risk_level} />
        </div>

        {/* Risk summary */}

        <section className="mt-8 grid gap-6 md:grid-cols-3">

          {/* Risk Score */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Risk Score
              </p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${riskColors.light} ${riskColors.text}`}
              >
                {transaction.risk_level}
              </span>
            </div>

            <div className="mt-3 flex items-end gap-1">
              <p
                className={`text-4xl font-bold ${riskColors.text}`}
              >
                {transaction.risk_score}
              </p>

              <p className="mb-1 text-sm text-slate-400">
                /100
              </p>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${riskColors.bg}`}
                style={{
                  width: `${Math.min(
                    Math.max(transaction.risk_score, 0),
                    100
                  )}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {transaction.risk_level === "HIGH"
                ? "Immediate investigation recommended."
                : transaction.risk_level === "MEDIUM"
                  ? "Review transaction behaviour."
                  : "No immediate risk detected."}
            </p>

          </div>

          {/* Transaction Amount */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Transaction Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ${transaction.amount.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Current payment value
            </p>

          </div>

          {/* Historical Average */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Historical Average
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ${transaction.historical_avg_amount.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Typical transaction amount
            </p>

          </div>

        </section>

        {/* Why flagged */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            Why was this transaction flagged?
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Risk signals detected by the monitoring engine
          </p>

          {transaction.reasons.length === 0 ? (
            <div className="mt-5 rounded-lg border border-green-100 bg-green-50 p-4">
              <p className="text-sm text-green-700">
                No specific risk indicators were detected.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">

              {transaction.reasons.map((reason, index) => (
                <div
                  key={`${reason}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    !
                  </span>

                  <p className="text-sm text-slate-700">
                    {reason}
                  </p>
                </div>
              ))}

            </div>
          )}

        </section>

        {/* Investigation Summary */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            Investigation Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Key signals that may require investigator attention
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            {/* Risk Indicators */}

            <div className="rounded-lg border border-slate-200 p-5">

              <p className="text-sm text-slate-500">
                Risk Indicators
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {transaction.reasons.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                detected signals
              </p>

            </div>

            {/* New Payee */}

            <div className="rounded-lg border border-slate-200 p-5">

              <p className="text-sm text-slate-500">
                New Payee
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
                  transaction.is_new_payee
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {transaction.is_new_payee
                  ? "Detected"
                  : "No"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Beneficiary history
              </p>

            </div>

            {/* New Device */}

            <div className="rounded-lg border border-slate-200 p-5">

              <p className="text-sm text-slate-500">
                New Device
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
                  transaction.is_new_device
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {transaction.is_new_device
                  ? "Detected"
                  : "No"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Device history
              </p>

            </div>

          </div>

        </section>

        {/* Recommended Action */}

        <section
          className={`mt-8 rounded-xl border p-6 ${
            transaction.risk_level === "HIGH"
              ? "border-red-200 bg-red-50"
              : transaction.risk_level === "MEDIUM"
                ? "border-yellow-200 bg-yellow-50"
                : "border-green-200 bg-green-50"
          }`}
        >

          <h2 className="text-lg font-semibold text-slate-900">
            Recommended Action
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {transaction.risk_level === "HIGH"
              ? "Escalate this transaction for further investigation."
              : transaction.risk_level === "MEDIUM"
                ? "Review the transaction and verify the payment context."
                : "No immediate action is required."}
          </p>

        </section>

        {/* Transaction Details */}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            Transaction Details
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">

            <Detail
              label="Business"
              value={transaction.business_id}
            />

            <Detail
              label="Payee"
              value={transaction.payee}
            />

            <Detail
              label="Payment Type"
              value={transaction.payment_type}
            />

            <Detail
              label="Device"
              value={transaction.device_id}
            />

            <Detail
              label="Location"
              value={transaction.location}
            />

            <Detail
              label="Timestamp"
              value={new Date(
                transaction.timestamp
              ).toLocaleString()}
            />

            <Detail
              label="New Beneficiary"
              value={
                transaction.is_new_payee
                  ? "Yes"
                  : "No"
              }
            />

            <Detail
              label="New Device"
              value={
                transaction.is_new_device
                  ? "Yes"
                  : "No"
              }
            />

            <Detail
              label="ML Anomaly Score"
              value={transaction.ml_anomaly_score.toFixed(4)}
            />

          </div>

        </section>

        {/* Business Context */}

        {business && (
          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-slate-900">
              Business Context
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Business {business.business_id}
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-4">

              <Stat
                label="Transactions"
                value={business.total_transactions.toLocaleString()}
              />

              <Stat
                label="Total Value"
                value={`$${business.total_value.toLocaleString()}`}
              />

              <Stat
                label="Average Transaction"
                value={`$${business.average_transaction.toLocaleString()}`}
              />

              <Stat
                label="High Risk"
                value={business.high_risk_transactions.toLocaleString()}
              />

            </div>

            <div className="mt-6">

              <Link
                href={`/businesses/${business.business_id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View business risk profile →
              </Link>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}


/* Risk colour helper */

function getRiskColor(score: number) {
  if (score >= 70) {
    return {
      text: "text-red-700",
      bg: "bg-red-500",
      light: "bg-red-100",
    };
  }

  if (score >= 30) {
    return {
      text: "text-yellow-700",
      bg: "bg-yellow-500",
      light: "bg-yellow-100",
    };
  }

  return {
    text: "text-green-700",
    bg: "bg-green-500",
    light: "bg-green-100",
  };
}


/* Risk badge */

function RiskBadge({
  level,
}: {
  level: "HIGH" | "MEDIUM" | "LOW";
}) {
  const styles = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-semibold ${styles[level]}`}
    >
      {level} RISK
    </span>
  );
}


/* Detail */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}


/* Business statistic */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}