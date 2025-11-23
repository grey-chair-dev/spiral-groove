"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      // Not authenticated, show login form
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to client page
      router.push('/client');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Abstract Gradient Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-60 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.3) 50%, rgba(6,182,212,0.3) 100%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        {/* Login Form */}
        <div className="relative z-10 bg-black/60 backdrop-blur-sm border-2 border-white/20 rounded-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white/10 p-4 rounded-full mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Portal</h1>
            <p className="text-white/60 text-sm">Enter your password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter password"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-black border-2 border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors rounded-lg disabled:opacity-50"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity rounded-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

