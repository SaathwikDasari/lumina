"use client";

import { useState } from "react";

/* =======================
   Types
======================= */

type OptimizeResponse = {
  route: string[];
  method: string[];
  final_amount: number;
  baseline_amount: number;
  user_savings: number;
  platform_fee: number;
  advisory: "SEND_NOW" | "WAIT";
};

type Currency = {
  code: string;
  type: "fiat" | "stablecoin";
  country: string;
};

/* =======================
   Currency Metadata
======================= */

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  AED: "د.إ",
  BRL: "R$",
  USDC: "$",
  USDT: "$",
};

const symbolFor = (code: string) => CURRENCY_SYMBOL[code] ?? "";


const CURRENCIES: Currency[] = [
  { code: "USD", type: "fiat", country: "United States" },
  { code: "INR", type: "fiat", country: "India" },
  { code: "EUR", type: "fiat", country: "European Union" },
  { code: "GBP", type: "fiat", country: "United Kingdom" },
  { code: "JPY", type: "fiat", country: "Japan" },
  { code: "AUD", type: "fiat", country: "Australia" },
  { code: "CAD", type: "fiat", country: "Canada" },
  { code: "SGD", type: "fiat", country: "Singapore" },
  { code: "AED", type: "fiat", country: "United Arab Emirates" },
  { code: "BRL", type: "fiat", country: "Brazil" },
  { code: "USDC", type: "stablecoin", country: "Global" },
  { code: "USDT", type: "stablecoin", country: "Global" },
];

/* =======================
   Component
======================= */

export default function Home() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const optimize = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:4000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, amount }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to reach backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6 p-8 rounded-2xl bg-zinc-900 shadow-xl">

        {/* Header */}
        <h1 className="text-3xl font-bold text-center">
          💡 Lumina – Liquidity Optimizer
        </h1>

        {/* Inputs */}
        <div className="grid grid-cols-3 gap-4">

          {/* From */}
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-zinc-800 rounded-lg p-3 outline-none"
          >
            <optgroup label="Fiat">
              {CURRENCIES.filter(c => c.type === "fiat").map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.country}
                </option>
              ))}
            </optgroup>
            <optgroup label="Stablecoins">
              {CURRENCIES.filter(c => c.type === "stablecoin").map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.country}
                </option>
              ))}
            </optgroup>
          </select>

          {/* To */}
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-zinc-800 rounded-lg p-3 outline-none"
          >
            <optgroup label="Fiat">
              {CURRENCIES.filter(c => c.type === "fiat").map(c => (
                <option
                  key={c.code}
                  value={c.code}
                  disabled={c.code === from}
                >
                  {c.code} · {c.country}
                </option>
              ))}
            </optgroup>
            <optgroup label="Stablecoins">
              {CURRENCIES.filter(c => c.type === "stablecoin").map(c => (
                <option
                  key={c.code}
                  value={c.code}
                  disabled={c.code === from}
                >
                  {c.code} · {c.country}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Amount */}
          <input
            type="number"
            value={amount}
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="bg-zinc-800 rounded-lg p-3 outline-none"
            placeholder="Amount"
          />
        </div>

        {/* Button */}
        <button
          onClick={optimize}
          disabled={loading || from === to}
          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-semibold disabled:opacity-50"
        >
          {loading ? "Optimizing..." : "Optimize Route"}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4 border-t border-zinc-700 pt-6">

            <div className="flex justify-between">
              <span className="text-zinc-400">Route</span>
              <span className="font-mono">
                {result.route.join(" → ")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Path</span>
              <span className="font-mono">
                {result.method.join(" → ")}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Final Amount</span>
              <span className="font-semibold">
                {symbolFor(to)}{result.final_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Baseline</span>
              <span>
                {symbolFor(to)}{result.baseline_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-green-400">
              <span>User Savings</span>
              <span>
                {symbolFor(to)}{result.user_savings.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-yellow-400">
              <span>Platform Fee</span>
              <span>
                {symbolFor(to)}{result.platform_fee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Advisory</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  result.advisory === "SEND_NOW"
                    ? "bg-green-600"
                    : "bg-orange-600"
                }`}
              >
                {result.advisory}
              </span>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
