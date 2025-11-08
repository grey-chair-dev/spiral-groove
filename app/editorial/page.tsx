import EditorialGrid from "@/components/EditorialGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial | Spiral Groove Records",
  description: "Read articles, reviews, and stories about vinyl records, music culture, and the local music scene in Milford, OH.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/editorial",
  },
};

export default function EditorialPage() {
  return (
    <div className="section">
      <h1 className="font-display font-bold text-4xl md:text-5xl text-text-dark mb-4">Editorial</h1>
      <p className="text-lg text-neutral-600 mb-8">Articles, reviews, and stories about vinyl records and music culture</p>
      <EditorialGrid />
    </div>
  );
}
