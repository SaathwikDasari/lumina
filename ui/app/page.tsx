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
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#1e1b4b,_#000)] text-white px-6">
      <div className="relative w-full max-w-xl">

        {/* Outer neon glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse" />

        {/* Card */}
        <div className="relative backdrop-blur-2xl bg-zinc-900/70 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">

          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lumina
            </h1>
            <p className="text-zinc-400 text-sm tracking-wide">
              Autonomous Liquidity Optimization Engine
            </p>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-3 gap-4">

            {/* FROM */}
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-indigo-400 focus:ring-2 focus:ring-indigo-500 transition"
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

            {/* TO */}
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-purple-400 focus:ring-2 focus:ring-purple-500 transition"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} disabled={c.code === from}>
                  {c.code} · {c.country}
                </option>
              ))}
            </select>

            {/* AMOUNT */}
            <div className="relative">
              <span className="absolute left-3 top-3 text-zinc-400">
                {symbolFor(from)}
              </span>
              <input
                type="number"
                value={amount}
                min={1}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl bg-zinc-800/80 pl-7 p-3 ring-1 ring-white/10 hover:ring-pink-400 focus:ring-2 focus:ring-pink-500 transition"
              />
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={optimize}
            disabled={loading || from === to || amount <= 0}
            className="relative w-full py-4 rounded-2xl font-bold tracking-wide text-lg
                      bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                      hover:scale-[1.02] hover:brightness-110 transition-all
                      shadow-[0_0_40px_rgba(99,102,241,0.4)]
                      disabled:opacity-40 disabled:scale-100"
          >
            {loading ? "Routing Liquidity…" : "Optimize Transfer"}
          </button>

          {/* Results */}
          {result && (
            <div className="space-y-6 border-t border-white/10 pt-6">

<<<<<<< HEAD
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
                {if (result.route.length > 0) }
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
=======
              {/* Advisory */}
              <div
                className={`text-center py-3 rounded-xl font-extrabold tracking-widest text-sm ${
>>>>>>> 40fc6f090340fbc86c5aceecc42f9469a88df8ba
                  result.advisory === "SEND_NOW"
                    ? "bg-green-500/20 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    : "bg-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                }`}
              >
                {result.advisory === "SEND_NOW"
                  ? "🚀 SEND NOW — BEST ROUTE FOUND"
                  : "⏳ WAIT — BETTER LIQUIDITY EXPECTED"}
              </div>

              {/* Route Pills */}
              <div>
                <p className="text-xs text-zinc-400 mb-2">Liquidity Route</p>
                <div className="flex flex-wrap gap-2">
                  {result.route.map((r, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm font-mono
                                bg-indigo-500/10 border border-indigo-500/30
                                text-indigo-300 shadow"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Path Pills */}
              <div>
                <p className="text-xs text-zinc-400 mb-2">Execution Path</p>
                <div className="flex flex-wrap gap-2">
                  {result.method.map((m, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm font-mono
                                bg-purple-500/10 border border-purple-500/30
                                text-purple-300 shadow"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <SexyMetric label="Final Amount" value={`${symbolFor(to)}${result.final_amount.toFixed(2)}`} />
                <SexyMetric label="Baseline" value={`${symbolFor(to)}${result.baseline_amount.toFixed(2)}`} />
                <SexyMetric label="User Savings" value={`+${symbolFor(to)}${result.user_savings.toFixed(2)}`} green />
                <SexyMetric label="Platform Fee" value={`${symbolFor(to)}${result.platform_fee.toFixed(2)}`} yellow />
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );

}


function SexyMetric({
  label,
  value,
  green,
  yellow,
}: {
  label: string;
  value: string;
  green?: boolean;
  yellow?: boolean;
}) {
  const color = green
    ? "text-green-400"
    : yellow
    ? "text-yellow-400"
    : "text-white";

  return (
    <div className="rounded-2xl bg-zinc-800/60 p-4 border border-white/10 shadow-inner">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`text-xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}