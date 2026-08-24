"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTransactions } from "@/lib/api";

type Transaction = {
  transaction_id: string;
  business_id: string;
  amount: number;
  timestamp: string;
  payee: string;
  payment_type: string;
  location: string;
  risk_score: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getTransactions(filter || undefined, page, 25)
      .then((data) => {
        setTransactions(data.transactions);
        setTotalPages(data.total_pages);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [filter, page]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Transactions
          </h1>

          <p className="mt-2 text-slate-600">
            Review transactions and investigate suspicious activity.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          {["", "HIGH", "MEDIUM", "LOW"].map((level) => (
            <button
              key={level}
              onClick={() => {
                setFilter(level);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === level
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {level || "ALL"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-slate-600">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-slate-600">
              No transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Transaction
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Business
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Risk
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.transaction_id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Transaction */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/transactions/${transaction.transaction_id}`}
                          className="font-medium text-slate-900 hover:text-blue-600"
                        >
                          {transaction.transaction_id}
                        </Link>
                      </td>

                      {/* Business */}
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {transaction.business_id}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-medium text-slate-700">
                        ${transaction.amount.toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </td>

                      {/* Risk */}
                      <td className="px-6 py-4">
                        <RiskBadge level={transaction.risk_level} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/transactions/${transaction.transaction_id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Investigate →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Showing {transactions.length} of {total} transactions
                </p>

                <div className="flex items-center gap-3">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  <span className="text-sm font-medium text-slate-700">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[level]}`}
    >
      {level}
    </span>
  );
}