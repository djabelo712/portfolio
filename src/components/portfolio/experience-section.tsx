"use client";

import { timeline, type TimelineEntry } from "@/lib/portfolio-data";
import { SectionHeader } from "./about-section";
import { GraduationCap, FlaskConical, Award, BookOpen, Briefcase } from "lucide-react";

const TYPE_META: Record<
  TimelineEntry["type"],
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  education: { label: "Education",     icon: GraduationCap, color: "var(--quantum-indigo)" },
  research:  { label: "Research",       icon: FlaskConical,  color: "var(--quantum-cyan)" },
  teaching:  { label: "Teaching",       icon: BookOpen,      color: "#10B981" },
  award:     { label: "Award / Grant",  icon: Award,         color: "var(--quantum-gold)" },
  training:  { label: "Training",       icon: Briefcase,     color: "#EF4444" },
};

export function ExperienceSection() {
  // Sort by date descending (rough heuristic — assumes newest entries have later dates)
  const sorted = [...timeline].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section id="experience" className="py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="04 · Experience"
          title="Timeline"
          subtitle="Education, research, teaching, awards, and professional training."
        />

        <div className="mt-12 relative">
          {/* Vertical line */}
          <div
            className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-[var(--quantum-indigo)] via-[var(--quantum-cyan)] to-[var(--quantum-gold)] opacity-40"
            aria-hidden
          />

          <div className="space-y-8 max-h-[800px] overflow-y-auto quantum-scroll pr-2">
            {sorted.map((entry, i) => (
              <TimelineItem key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ entry, index }: { entry: TimelineEntry; index: number }) {
  const meta = TYPE_META[entry.type];
  const Icon = meta.icon;

  return (
    <article
      className="relative pl-12 sm:pl-16 quantum-fade-up"
      style={{ animationDelay: `${Math.min(index, 4) * 0.1}s` }}
    >
      {/* Bullet on the timeline */}
      <div
        className="absolute left-0 sm:left-2 top-1 inline-flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background"
        style={{ borderColor: meta.color, color: meta.color }}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-5 quantum-card-hover">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-foreground">
            {entry.title}
          </h3>
          <span className="text-xs font-mono tracking-wide text-muted-foreground">
            {entry.date}
          </span>
        </div>

        <div
          className="text-sm font-medium mb-2"
          style={{ color: meta.color }}
        >
          {entry.organization}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {entry.description}
        </p>

        <div className="mt-3">
          <span
            className="inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
            style={{
              color: meta.color,
              background: `color-mix(in oklch, ${meta.color} 10%, transparent)`,
            }}
          >
            {meta.label}
          </span>
        </div>
      </div>
    </article>
  );
}
