"use client";
import { Pause, Play, Volume2, ShoppingCart, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const demoTrack = { 
  id: "demo", 
  title: "Kind of Blue", 
  artist: "Miles Davis", 
  src: "/demo.mp3",
  artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  price: 24.99
};

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const setTrack = useStore((s) => s.setTrack);
  const addToCart = useStore((s) => s.addToCart);
  const storeTrack = useStore((s) => s.player.track);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setMounted(true);
    setTrack(demoTrack);
  }, [setTrack]);

  const track = mounted ? (storeTrack || demoTrack) : demoTrack;

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  }

  const handleAddToCart = () => {
    if (mounted && track.price) {
      addToCart({ 
        id: track.id, 
        title: track.title, 
        price: track.price, 
        cover: track.artwork 
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card p-6 bg-gradient-to-r from-primary-black to-neutral-800 text-text-light">
      <div className="flex items-center gap-6">
        {/* Album Artwork */}
        <div className="w-24 h-24 rounded-large overflow-hidden flex-shrink-0 relative">
          <Image 
            src={track.artwork || "/images/placeholders/vinyl.jpg"} 
            alt={`${track.title} by ${track.artist} at Spiral Groove Records`}
            fill
            className="object-cover"
          />
          {playing && (
            <div className="absolute inset-0 bg-primary-black/50 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent-teal rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-display font-semibold text-lg text-text-light">{track.title}</div>
              <div className="text-sm text-neutral-300">{track.artist}</div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="btn-secondary bg-white/20 text-white border-white hover:bg-accent-teal hover:border-accent-teal disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={!track.price}
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </button>
              <button 
                className="p-2 text-white hover:text-accent-teal transition-colors"
                aria-label="Add to favorites"
              >
                <Heart size={20} />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <button 
              className="btn bg-accent-teal hover:bg-accent-amber text-text-light p-3 rounded-full" 
              onClick={toggle}
              aria-label={playing ? "Pause track" : "Play track"}
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <div className="flex-1">
              <div className="h-2 bg-neutral-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-teal rounded-full transition-all duration-300" 
                  style={{width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`}}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <button 
              className="p-2 text-white hover:text-accent-teal transition-colors"
              aria-label="Adjust volume"
            >
              <Volume2 size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <audio 
        ref={audioRef} 
        src={track.src} 
        preload="none"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
