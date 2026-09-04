"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Github, ExternalLink, FileText, Star, HardDrive, ArrowRight } from "lucide-react";
import {
  projects,
  categoryLabels,
  type Project,
  type ProjectCategory,
} from "@/lib/portfolio-data";
import { SectionHeader } from "./about-section";
import { Badge } from "@/components/ui/badge";

const CATEGORIES: ProjectCategory[] = [
  "qkd", "algorithm", "simulation", "ml", "hardware", "tool", "research",
];

const FILTERS: { key: ProjectCategory | "all"; label: string }[] = [
  { key: "all",  label: "All" },
  ...CATEGORIES.map((c) => ({ key: c, label: categoryLabels[c].label })),
];

export function ProjectsSection() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");

  const filtered = useMemo(() => {
    const list = filter === "all" ? projects : projects.filter((p) => p.category === filter);
    return list.slice().sort((a, b) => {
      if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
      const ad = a.date ?? "";
      const bd = b.date ?? "";
      return bd.localeCompare(ad);
    });
  }, [filter]);

  return (
    <section id="projects" className="py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="02 · Projects"
          title="Practical work"
          subtitle="Open-source code, research notebooks, and applied work · filter by category or browse all."
        />

        {/* Filter chips */}
        <div className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                  active
                    ? "bg-[var(--quantum-indigo)] border-[var(--quantum-indigo)] text-[var(--paper)]"
                    : "bg-card/50 border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid of project cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground">
            No projects in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card/50 overflow-hidden quantum-card-hover quantum-fade-up no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--quantum-cyan)]"
      style={{ animationDelay: `${Math.min(index, 6) * 0.07}s` }}
    >
      {/* Visual header */}
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background:
            `linear-gradient(135deg, var(--quantum-indigo) 0%, var(--quantum-cyan) 100%)`,
        }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 30%),
               radial-gradient(circle at 80% 70%, rgba(245,158,11,0.4) 0%, transparent 30%)`,
          }}
        />
        {/* Mini circuit motif */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          viewBox="0 0 300 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <g
            stroke="white"
            strokeWidth="1.2"
            fill="none"
          >
            <circle cx="40"  cy="50" r="6" />
            <circle cx="120" cy="30" r="6" />
            <circle cx="120" cy="70" r="6" />
            <circle cx="200" cy="50" r="6" />
            <circle cx="270" cy="30" r="6" />
            <line x1="46"  y1="50" x2="114" y2="30" />
            <line x1="46"  y1="50" x2="114" y2="70" />
            <line x1="126" y1="30" x2="194" y2="50" />
            <line x1="126" y1="70" x2="194" y2="50" />
            <line x1="206" y1="50" x2="264" y2="30" />
          </g>
        </svg>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--quantum-gold)] text-[var(--quantum-ink)] text-[10px] font-bold tracking-wide uppercase">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}

        {/* Date */}
        {project.date && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/30 backdrop-blur text-white text-[10px] font-mono tracking-wide">
            {project.date}
          </div>
        )}

        {/* Category label */}
        <div
          className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/20 backdrop-blur text-white text-xs font-medium"
        >
          {categoryLabels[project.category].label}
        </div>

        {/* "Read more" hint on hover */}
        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Read more
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:text-[var(--quantum-cyan)] transition-colors">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed italic">
            {project.tagline}
          </p>
        </div>

        <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {project.tags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[11px] py-0.5 px-2 font-normal border-border/60"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Links — stopped to avoid triggering Link navigation when clicking these */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/40">
          {project.github && (
            <LinkIcon href={project.github} label="Code">
              <Github className="h-3.5 w-3.5" />
              <span>Code</span>
            </LinkIcon>
          )}
          {project.driveLink && (
            <LinkIcon href={project.driveLink} label="Drive">
              <HardDrive className="h-3.5 w-3.5" />
              <span>Drive</span>
            </LinkIcon>
          )}
          {project.demo && (
            <LinkIcon href={project.demo} label="Demo">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Demo</span>
            </LinkIcon>
          )}
          {project.paper && (
            <LinkIcon href={project.paper} label="Paper">
              <FileText className="h-3.5 w-3.5" />
              <span>Paper</span>
            </LinkIcon>
          )}
          <span className="ml-auto text-xs text-[var(--quantum-cyan)] font-medium flex items-center gap-1">
            Read details
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function LinkIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[var(--quantum-cyan)] transition-colors no-underline hover:no-underline"
    >
      {children}
    </a>
  );
}
