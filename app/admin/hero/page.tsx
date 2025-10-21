"use client";

import { useState } from "react";
import Image from "next/image";
import SquareIntegration from "@/components/SquareIntegration";

export default function HeroAdminPage() {
  const [imageUrl, setImageUrl] = useState("/hero-collage.jpg");
  const [previewMode, setPreviewMode] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-12">
      <div className="container max-w-4xl">
        <div className="card p-8">
          <h1 className="font-display font-bold text-3xl mb-6">Admin Dashboard</h1>
          
          {/* Square Integration */}
          <div className="mb-8">
            <SquareIntegration />
          </div>
          
          <div className="border-t border-neutral-200 pt-8">
            <h2 className="font-display font-bold text-2xl mb-6">Hero Collage Manager</h2>
          
          {/* Instructions */}
          <div className="mb-8 p-6 bg-accent-teal/10 rounded-large">
            <h2 className="font-semibold text-lg mb-3">How to Update Hero Collage</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700">
              <li>Create a 1920×1080px image with 4×5 album grid (20 albums total)</li>
              <li>Use the template guide in <code>/public/hero-template-guide.md</code></li>
              <li>Save as <code>hero-collage.jpg</code> in the <code>/public</code> folder</li>
              <li>Replace the existing file to update the website</li>
            </ol>
          </div>

          {/* Current Image Display */}
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-4">Current Hero Image</h2>
            <div className="relative aspect-video rounded-large overflow-hidden border-2 border-neutral-200">
              <Image
                src={imageUrl}
                alt="Current hero collage"
                fill
                className="object-cover"
                onError={() => setImageUrl("/placeholder-hero.jpg")}
              />
            </div>
          </div>

          {/* Preview Mode Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={previewMode}
                onChange={(e) => setPreviewMode(e.target.checked)}
                className="rounded"
              />
              <span className="font-medium">Preview Mode (shows how it will look on the homepage)</span>
            </label>
          </div>

          {/* Preview */}
          {previewMode && (
            <div className="mb-8">
              <h2 className="font-semibold text-lg mb-4">Preview</h2>
              <div className="relative aspect-video rounded-large overflow-hidden border-2 border-neutral-200">
                <Image
                  src={imageUrl}
                  alt="Hero collage preview"
                  fill
                  className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-black/30 via-primary-black/50 to-primary-black/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-display font-bold text-2xl mb-2">Your destination for vinyl</h3>
                    <p className="text-neutral-300">Preview text overlay</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload (for testing) */}
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-4">Test New Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-teal file:text-white hover:file:bg-accent-amber"
            />
            <p className="text-sm text-neutral-600 mt-2">
              Note: This is for preview only. To actually update the website, replace the file in /public/hero-collage.jpg
            </p>
          </div>

          {/* Template Specifications */}
          <div className="bg-neutral-50 p-6 rounded-large">
            <h2 className="font-semibold text-lg mb-4">Template Specifications</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-medium mb-2">Dimensions</h3>
                <ul className="space-y-1 text-neutral-600">
                  <li>• Width: 1920px minimum</li>
                  <li>• Height: 1080px minimum</li>
                  <li>• Aspect ratio: 16:9</li>
                  <li>• Format: JPG or PNG</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Layout</h3>
                <ul className="space-y-1 text-neutral-600">
                  <li>• Grid: 4 rows × 5 columns</li>
                  <li>• Album size: ~300×300px each</li>
                  <li>• Spacing: 20px between albums</li>
                  <li>• Background: Dark textured</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
