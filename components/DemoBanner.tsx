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
    <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 text-center py-2 text-sm font-medium">
      Demo Mode — Checkout is disabled. Purchases will not be processed.
    </div>
  );
}

