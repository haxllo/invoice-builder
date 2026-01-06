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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side: Branding/Marketing */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-12 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40" />
        
        <div className="max-w-md space-y-8 relative z-10 animate-fade-in">
          <div className="inline-flex p-4 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 mb-6 shadow-2xl">
            <FileText size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-tight">
            Streamline your business billing.
          </h1>
          <p className="text-indigo-100 text-xl font-medium leading-relaxed">
            Generate professional invoices, manage clients, and track your revenue all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 group cursor-pointer">
              <p className="text-3xl font-black group-hover:scale-110 transition-transform">100%</p>
              <p className="text-xs text-indigo-200 uppercase font-black tracking-widest mt-2">Secure</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 group cursor-pointer">
              <p className="text-3xl font-black group-hover:scale-110 transition-transform">Cloud</p>
              <p className="text-xs text-indigo-200 uppercase font-black tracking-widest mt-2">Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 sm:p-12 bg-white">
        <div className="w-full max-w-sm space-y-8 animate-slide-in">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-4 shadow-lg">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">InvoiceBuilder</h2>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin 
                ? "Enter your credentials to access your dashboard" 
                : "Join us and start building your first invoice today"}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex p-1.5 bg-gray-100 rounded-2xl">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-200 ${isLogin ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-200 ${!isLogin ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
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
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex gap-3 animate-slide-in">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-black text-xs">!</span>
                </div>
                <div className="text-red-700 text-sm font-bold leading-relaxed">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
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
