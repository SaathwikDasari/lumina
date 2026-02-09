"use client";

import Link from 'next/link';
import { handleSignUp } from "./actions";

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CNY', name: 'Chinese Renminbi' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
];

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#1e1b4b,_#000)] text-white px-6">
      <div className="relative w-full max-w-md">
        
        {/* Outer neon glow to match dashboard */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse" />

        {/* Card with glassmorphism */}
        <div className="relative backdrop-blur-2xl bg-zinc-900/70 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lumina
            </h1>
            <p className="text-zinc-400 text-sm tracking-wide">
              Create your autonomous liquidity account
            </p>
          </div>

          <form action={handleSignUp} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 ml-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="w-full rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-indigo-400 focus:ring-2 focus:ring-indigo-500 transition outline-none text-white" 
                maxLength={100} 
                placeholder="Sathvik" 
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 ml-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-purple-400 focus:ring-2 focus:ring-purple-500 transition outline-none text-white" 
                maxLength={255} 
                placeholder="sathvik@example.com" 
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 ml-1">Security</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-pink-400 focus:ring-2 focus:ring-pink-500 transition outline-none text-white" 
                maxLength={255} 
                placeholder="••••••••" 
              />
            </div>

            {/* Solana Address */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 ml-1">Solana Wallet Address</label>
              <input 
                type="text" 
                name="sol_addr" 
                className="w-full rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-indigo-400 focus:ring-2 focus:ring-indigo-500 transition outline-none text-white font-mono text-xs" 
                maxLength={44} 
                placeholder="GvP...7jR" 
              />
            </div>

            {/* Preferred Currency */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 ml-1">Preferred Currency</label>
              <select 
                name="preferred_currency" 
                className="w-full rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-purple-400 focus:ring-2 focus:ring-purple-500 transition outline-none text-zinc-300"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-zinc-900 text-white">
                    {curr.code} · {curr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="relative w-full py-4 mt-2 rounded-2xl font-bold tracking-wide text-lg
                        bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                        hover:scale-[1.02] hover:brightness-110 transition-all
                        shadow-[0_0_40px_rgba(99,102,241,0.4)]"
            >
              Initialize Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Authorize Access
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}