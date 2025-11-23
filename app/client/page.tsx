"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to access a protected endpoint or check session
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        setAuthenticated(true);
      } else {
        router.push('/login');
      }
    } catch (error) {
        router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/20 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Portal</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to Your Client Portal</h2>
            <p className="text-white/70 text-lg">
              This is your password-protected client area. You can add any content, tools, or information here.
            </p>
          </div>

          {/* Example Content Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Quick Stats</h3>
              <p className="text-white/60">Add your key metrics here</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
              <p className="text-white/60">Show recent updates or changes</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Resources</h3>
              <p className="text-white/60">Links and helpful information</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

