"use client";

import { Mail, Github, Linkedin, FileText, ArrowUpRight, Phone, MapPin } from "lucide-react";
import { profile } from "@/lib/portfolio-data";
import { SectionHeader } from "./about-section";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  const links = [
    profile.github    ? { href: profile.github,    label: "GitHub",    icon: Github,    handle: "@djabelo712" } : null,
    profile.linkedin  ? { href: profile.linkedin,  label: "LinkedIn",  icon: Linkedin,  handle: "Djabon Ounimborbitibou" } : null,
    profile.arxiv      ? { href: profile.arxiv,     label: "arXiv",     icon: FileText,  handle: "arxiv.org/a/djabon_o" } : null,
    profile.resumeUrl ? { href: profile.resumeUrl, label: "Resume",   icon: FileText,  handle: "PDF" } : null,
  ].filter(Boolean) as { href: string; label: string; icon: React.ComponentType<{ className?: string }>; handle: string }[];

  return (
    <section id="contact" className="py-20 sm:py-28 border-t border-border/40 relative overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--quantum-cyan) 12%, transparent), transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="05 · Contact"
          title="Let's talk quantum"
          subtitle="I am actively seeking PhD positions in quantum information, computing, and communication · and always glad to discuss research."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Email CTA */}
          <div className="rounded-xl border border-border bg-card/40 p-8 quantum-card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--quantum-cyan)]/10 text-[var(--quantum-cyan)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Email</div>
                <div className="text-sm font-medium text-foreground">Best way to reach me</div>
              </div>
            </div>

            <a
              href={`mailto:${profile.email}`}
              className="text-xl sm:text-2xl font-semibold text-foreground hover:text-[var(--quantum-cyan)] transition-colors break-all no-underline hover:no-underline"
            >
              {profile.email}
            </a>

            {profile.phone && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-[var(--quantum-cyan)]" />
                  <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="no-underline hover:underline hover:text-[var(--quantum-cyan)]">
                    {profile.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-[var(--quantum-cyan)]" />
                  {profile.location}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-[var(--quantum-indigo)] hover:bg-[var(--quantum-indigo)]/90 text-[var(--paper)]">
                <a href={`mailto:${profile.email}?subject=PhD%20opportunity%20in%20Quantum%20Information`} className="no-underline">
                  <Mail className="mr-2 h-4 w-4" />
                  Get in touch
                </a>
              </Button>
              {profile.resumeUrl && (
                <Button asChild variant="outline">
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="no-underline">
                    <FileText className="mr-2 h-4 w-4" />
                    Download CV
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Social links grid */}
          <div className="rounded-xl border border-border bg-card/40 p-8 quantum-card-hover">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Find me online
            </div>
            <div className="grid grid-cols-2 gap-3">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[var(--quantum-cyan)] hover:bg-[var(--quantum-cyan)]/5 transition-colors no-underline hover:no-underline"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-[var(--quantum-cyan)] transition-colors shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">{link.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{link.handle}</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-[var(--quantum-cyan)] transition-colors shrink-0" />
                  </a>
                );
              })}

              {/* Placeholders for profiles not yet created */}
              {!profile.linkedin && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border text-muted-foreground">
                  <Linkedin className="h-5 w-5 opacity-50 shrink-0" />
                  <div>
                    <div className="text-sm font-medium">LinkedIn</div>
                    <div className="text-xs italic">coming soon</div>
                  </div>
                </div>
              )}
              {!profile.arxiv && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border text-muted-foreground">
                  <FileText className="h-5 w-5 opacity-50 shrink-0" />
                  <div>
                    <div className="text-sm font-medium">arXiv</div>
                    <div className="text-xs italic">upon first submission</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border/60">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Academic references
              </div>
              <p className="text-xs text-muted-foreground italic mb-3">
                Available upon request. Please email me and I will introduce you to the relevant supervisor.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Prof. Eric Chitambar (UIUC) · MSc supervisor</li>
                <li>• Dr. Antonio D. Pereira Junior (UFF)</li>
                <li>• Prof. Abebe Geletu (AIMS Rwanda)</li>
                <li>• Assoc. Prof. Komi Sodoga (Univ. of Lomé)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
