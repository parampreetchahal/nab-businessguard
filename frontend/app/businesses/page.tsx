"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBusinesses } from "@/lib/api";

type Business = {
  business_id: string;
  total_transactions: number;
  total_value: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
};

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getBusinesses()
      .then(setBusinesses)
      .catch(() => {
        setError("Unable to load businesses.");
      });
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!businesses.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading businesses...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Navigation */}
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Dashboard
        </Link>

        {/* Header */}
        <header className="mb-8 mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Business Risk
          </h1>

          <p className="mt-2 text-slate-600">
            Monitor payment behaviour across SME customers.
          </p>
        </header>

        {/* Business Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="border-b border-slate-200 bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                    Business
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                    Transactions
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                    Payment Volume
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                    High Risk
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                    Risk Status
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {businesses.map((business) => (
                  <tr
                    key={business.business_id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Business */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {business.business_id}
                    </td>

                    {/* Transactions */}
                    <td className="px-6 py-4 text-slate-700">
                      {business.total_transactions.toLocaleString()}
                    </td>

                    {/* Payment Volume */}
                    <td className="px-6 py-4 font-medium text-slate-700">
                      ${business.total_value.toLocaleString()}
                    </td>

                    {/* High Risk */}
                    <td className="px-6 py-4">
                      <span
                        className={
                          business.high_risk > 0
                            ? "font-semibold text-red-600"
                            : "font-medium text-slate-700"
                        }
                      >
                        {business.high_risk.toLocaleString()}
                      </span>
                    </td>

                    {/* Risk Status */}
                    <td className="px-6 py-4">
                      <RiskStatus business={business} />
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/businesses/${business.business_id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function RiskStatus({
  business,
}: {
  business: Business;
}) {
  if (business.high_risk > 0) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Attention
      </span>
    );
  }

  if (business.medium_risk > 0) {
    return (
      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Monitor
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Normal
    </span>
  );
}