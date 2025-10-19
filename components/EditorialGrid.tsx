"use client";
import useSWR from "swr";
import EditorialCard from "./EditorialCard";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function EditorialGrid({ limit }: { limit?: number }) {
  const { data } = useSWR("/api/editorial", fetcher);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const posts = mounted ? (data?.posts?.slice(0, limit ?? 999) ?? []) : [];
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {posts.map((post: any) => <EditorialCard key={post.id} post={post} />)}
    </div>
  );
}
