"use client";

import { useEffect, useState } from "react";

export default function DemoBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show banner in demo mode (Square API is server-only, so always show on client)
  // In production, this would be controlled by server-side checks
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-secondary-yellow/20 border-b border-secondary-yellow/40 text-contrast-navy text-center py-2 text-sm font-medium">
      Demo mode (for now) — come grab it in person while it lasts.
    </div>
  );
}

