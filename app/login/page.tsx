'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FileText, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push('/');
        } else {
          alert('Account created! Please check your email for a confirmation link.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side: Branding/Marketing */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-indigo-600 p-12 text-white">
        <div className="max-w-md space-y-6">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 mb-4">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-tight">
            Streamline your business billing.
          </h1>
          <p className="text-indigo-100 text-xl font-medium leading-relaxed">
            Generate professional invoices, manage clients, and track your revenue all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mt-1">Secure</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-2xl font-bold">Cloud</p>
              <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mt-1">Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 sm:p-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex p-2 bg-indigo-50 rounded-xl text-indigo-600 mb-4">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">InvoiceBuilder</h2>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 font-medium italic">
              {isLogin 
                ? "Enter your credentials to access your dashboard" 
                : "Join us and start building your first invoice today"}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="text-red-600 text-xs font-bold leading-relaxed">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Get Started Now'}</span>
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="pt-8 text-center text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} InvoiceBuilder. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}
