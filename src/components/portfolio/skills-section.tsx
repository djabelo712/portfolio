"use client";

import { skills, type Skill } from "@/lib/portfolio-data";
import { SectionHeader } from "./about-section";

const CATEGORY_LABELS: Record<Skill["category"], { label: string; color: string }> = {
  quantum:     { label: "Quantum & QChem",   color: "var(--quantum-cyan)" },
  programming: { label: "Programming",       color: "var(--quantum-indigo)" },
  math:        { label: "Math & Theory",     color: "var(--quantum-gold)" },
  tools:       { label: "Tools & Platforms", color: "#10B981" },
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Comfortable",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

export function SkillsSection() {
  const grouped = (["quantum", "programming", "math", "tools"] as Skill["category"][]).map(
    (cat) => ({
      category: cat,
      items: skills.filter((s) => s.category === cat).sort((a, b) => b.level - a.level),
    })
  );

  return (
    <section id="skills" className="py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="03 · Skills"
          title="Technical stack"
          subtitle="Languages, frameworks, and theory I use to build quantum systems."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {grouped.map((group) => (
            <div
              key={group.category}
              className="rounded-xl border border-border bg-card/40 p-6 quantum-card-hover"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {CATEGORY_LABELS[group.category].label}
                </h3>
                <span
                  className="text-xs uppercase tracking-widest px-2 py-1 rounded"
                  style={{
                    color: CATEGORY_LABELS[group.category].color,
                    background: `color-mix(in oklch, ${CATEGORY_LABELS[group.category].color} 10%, transparent)`,
                  }}
                >
                  {group.items.length} skills
                </span>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto quantum-scroll pr-2">
                {group.items.map((skill) => (
                  <SkillBar
                    key={skill.name}
                    skill={skill}
                    color={CATEGORY_LABELS[group.category].color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillBar({ skill, color }: { skill: Skill; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">{skill.name}</span>
        <span className="text-xs text-muted-foreground">{LEVEL_LABELS[skill.level]}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full quantum-skill-bar"
          style={{
            width: `${(skill.level / 5) * 100}%`,
            background: `linear-gradient(to right, ${color}, color-mix(in oklch, ${color} 70%, white))`,
            ["--target-width" as string]: `${(skill.level / 5) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
