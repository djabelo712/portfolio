"use client";

import { MapPin, Mail, Phone, GraduationCap, Award } from "lucide-react";
import { profile } from "@/lib/portfolio-data";

export function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="01 · About"
          title="Who I am"
          subtitle="A physicist and applied mathematician at the intersection of quantum information, quantum chemistry, and quantum-assisted machine learning."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-12">
          {/* Bio */}
          <div className="lg:col-span-2 space-y-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
            {profile.bio.split("\n\n").map((para, i) => (
              <p key={i} className={i === 0 ? "text-foreground" : ""}>
                {para}
              </p>
            ))}
          </div>

          {/* Quick facts card */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-6 space-y-4 quantum-card-hover">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Location
                </div>
                <div className="flex items-start gap-2 text-foreground font-medium">
                  <MapPin className="h-4 w-4 text-[var(--quantum-cyan)] mt-0.5 shrink-0" />
                  {profile.location}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Email
                </div>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 text-foreground font-medium hover:text-[var(--quantum-cyan)] transition-colors no-underline hover:no-underline"
                >
                  <Mail className="h-4 w-4 text-[var(--quantum-cyan)] shrink-0" />
                  <span className="truncate text-sm">{profile.email}</span>
                </a>
              </div>

              {profile.phone && (
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Phone
                  </div>
                  <a
                    href={`tel:${profile.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-foreground font-medium hover:text-[var(--quantum-cyan)] transition-colors no-underline hover:no-underline"
                  >
                    <Phone className="h-4 w-4 text-[var(--quantum-cyan)] shrink-0" />
                    <span className="text-sm">{profile.phone}</span>
                  </a>
                </div>
              )}

              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Currently
                </div>
                <div className="flex items-start gap-2 text-foreground font-medium">
                  <GraduationCap className="h-4 w-4 text-[var(--quantum-cyan)] mt-0.5 shrink-0" />
                  MSc candidate · AIMS Ghana
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Recognition
                </div>
                <div className="flex items-start gap-2 text-foreground font-medium">
                  <Award className="h-4 w-4 text-[var(--quantum-cyan)] mt-0.5 shrink-0" />
                  F.K.A. Allotey Meritorious Award (2026)
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Focus
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["QIT", "Decoupling", "QChem", "QML", "Optimization"].map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full border border-[var(--quantum-cyan)]/40 text-[var(--quantum-cyan)] bg-[var(--quantum-cyan)]/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--quantum-cyan)] mb-3">
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-muted-foreground italic">
          {subtitle}
        </p>
      )}
      <div className="mt-6 w-16 h-1 rounded-full bg-gradient-to-r from-[var(--quantum-indigo)] to-[var(--quantum-cyan)]" />
    </div>
  );
}
