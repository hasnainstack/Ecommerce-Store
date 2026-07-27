"use client";

import Image from "next/image";
import { BRAND } from "@/lib/brand";

export interface FeaturedCard {
  id: string | number;
  name: string;
  price: number;
  description: string;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  currency?: string;
}

const DEFAULT_CARDS: FeaturedCard[] = [
  {
    id: "featured-1",
    name: "Zoom Structure 18",
    price: 10000,
    description: "A lightweight trainer built specifically for runners, with a breathable textile upper.",
    image: "/products/featured-1.png",
    gradientFrom: BRAND.colors.cardGradients[0].from,
    gradientTo: BRAND.colors.cardGradients[0].to,
  },
  {
    id: "featured-2",
    name: "Retro 7",
    price: 15000,
    description: "A fully reworked classic silhouette, ready to release for the new season.",
    image: "/products/featured-2.png",
    gradientFrom: BRAND.colors.cardGradients[1].from,
    gradientTo: BRAND.colors.cardGradients[1].to,
  },
  {
    id: "featured-3",
    name: "Air Max Dusty",
    price: 20000,
    description: "A cactus-green colorway with a silhouette that pairs well with this season's palette.",
    image: "/products/featured-3.png",
    gradientFrom: BRAND.colors.cardGradients[2].from,
    gradientTo: BRAND.colors.cardGradients[2].to,
  },
];

export default function CategoriesSection({ cards = DEFAULT_CARDS }: { cards?: FeaturedCard[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl p-6 text-white shadow-xl transition hover:-translate-y-1"
            style={{
              background: `linear-gradient(160deg, ${card.gradientFrom}, ${card.gradientTo})`,
              // stagger the middle/last cards upward, matching the mockup's offset stack
              marginTop: i === 1 ? "1.5rem" : i === 2 ? "3rem" : 0,
            }}
          >
            <span className="text-xs font-black italic tracking-tight opacity-80">{BRAND.name}</span>
            <p className="mt-3 text-lg font-bold">{card.price.toLocaleString()}</p>
            <h3 className="mt-1 text-xl font-extrabold">{card.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{card.description}</p>

            <div className="relative mt-6 aspect-[4/3] w-full">
              <Image
                src={card.image}
                alt={card.name}
                fill
                className="object-contain drop-shadow-xl transition group-hover:scale-105"
              />
            </div>

            <button className="mt-4 self-start rounded-full bg-white/90 px-6 py-2 text-xs font-bold uppercase tracking-wide text-slate-900 transition hover:bg-white">
              Buy
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}