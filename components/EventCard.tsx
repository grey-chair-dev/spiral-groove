"use client";
import Image from "next/image";
import Link from "next/link";
import { trackGetTickets } from "@/lib/analytics";

interface EventCardProps {
  image: string;
  alt: string;
  title: string;
  date: string;
  description: string;
  badge?: { text: string; className: string };
  timeBadge?: string;
  href: string;
  eventTitle: string;
}

export default function EventCard({
  image,
  alt,
  title,
  date,
  description,
  badge,
  timeBadge,
  href,
  eventTitle,
}: EventCardProps) {
  return (
    <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video relative">
        <Image 
          src={image}
          alt={alt}
          fill
          className="object-cover"
        />
        {badge && (
          <div className="absolute top-4 left-4">
            <span className={`badge ${badge.className}`}>{badge.text}</span>
          </div>
        )}
        {timeBadge && (
          <div className="absolute bottom-4 right-4">
            <span className="badge bg-accent-teal text-text-light">{timeBadge}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-neutral-600 mb-3">{date}</p>
        <p className="text-sm text-neutral-600 mb-4">{description}</p>
        <Link 
          href={href}
          className="btn w-full text-center"
          onClick={() => trackGetTickets(eventTitle)}
        >
          Get Tickets
        </Link>
      </div>
    </div>
  );
}

