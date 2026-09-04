"use client";

import { Atom } from "lucide-react";
import { profile } from "@/lib/portfolio-data";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-2 no-underline hover:no-underline">
            <span className="relative inline-flex items-center justify-center">
              <span
                className="absolute inset-0 quantum-rotate-slow opacity-70"
                aria-hidden
              >
                <span className="block w-6 h-6 rounded-full border-2 border-dashed border-[var(--quantum-cyan)]" />
              </span>
              <Atom className="w-4 h-4 text-[var(--quantum-indigo)]" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              {profile.name}
            </span>
          </div>

          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:gap-6">
            <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
            <span>Built with Next.js + Tailwind CSS.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
