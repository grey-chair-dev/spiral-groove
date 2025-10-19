"use client";

import { useState, useEffect } from 'react';
import { fetchGoogleBusinessHours, BusinessHours, FALLBACK_HOURS } from '../google-business';

export function useBusinessHours() {
  const [hours, setHours] = useState<BusinessHours>(FALLBACK_HOURS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHours() {
      try {
        setLoading(true);
        const fetchedHours = await fetchGoogleBusinessHours();
        setHours(fetchedHours);
        setError(null);
      } catch (err) {
        console.error('Failed to load business hours:', err);
        setError('Failed to load hours');
        setHours(FALLBACK_HOURS);
      } finally {
        setLoading(false);
      }
    }

    loadHours();
  }, []);

  return { hours, loading, error };
}
