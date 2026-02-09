"use client";

import Link from 'next/link';
import { handleLogin } from './actions';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#1e1b4b,_#000)] text-white px-6">
      <div className="relative w-full max-w-md">
        
        {/* Outer neon glow to match dashboard aesthetic */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse" />

        {/* Card with glassmorphism */}
        <div className="relative backdrop-blur-2xl bg-zinc-900/70 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
          
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lumina
            </h1>
            <p className="text-zinc-400 text-sm tracking-wide">
              Authorized Access Only
            </p>
          </div>

          <form action={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 ml-1 uppercase tracking-widest font-bold">
                Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-indigo-400 focus:ring-2 focus:ring-indigo-500 transition outline-none text-white" 
                placeholder="sathvik@example.com" 
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 ml-1 uppercase tracking-widest font-bold">
                Security Key
              </label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full rounded-xl bg-zinc-800/80 p-3 ring-1 ring-white/10 hover:ring-purple-400 focus:ring-2 focus:ring-purple-500 transition outline-none text-white" 
                placeholder="••••••••" 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="relative w-full py-4 rounded-2xl font-bold tracking-wide text-lg
                        bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                        hover:scale-[1.02] hover:brightness-110 transition-all
                        shadow-[0_0_40px_rgba(99,102,241,0.4)]"
            >
              Verify & Connect
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New to the network?{' '}
            <Link href="/signup" className="font-medium text-pink-400 hover:text-pink-300 transition-colors underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}