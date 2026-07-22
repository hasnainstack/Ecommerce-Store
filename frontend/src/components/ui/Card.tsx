"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-[var(--radius-lg)] shadow-card transition-all duration-300",
        hover && "hover:shadow-hover hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
