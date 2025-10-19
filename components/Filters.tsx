"use client";
import { useState } from "react";

export default function Filters() {
  const [open, setOpen] = useState(true);
  return (
    <div className="card p-4">
      <button className="w-full text-left font-semibold" onClick={() => setOpen(!open)}>
        Filters
      </button>
      {open && (
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> LP
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> 7"
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Cassette
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> CD
          </label>
          <input className="border border-neutral-300 rounded-full h-9 px-3 w-full" placeholder="Max price" />
        </div>
      )}
    </div>
  );
}
