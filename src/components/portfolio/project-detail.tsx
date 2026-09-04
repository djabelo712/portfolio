import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Github, ExternalLink, FileText, HardDrive, Calendar, Tag, Star,
} from "lucide-react";
import { projects, categoryLabels, profile, type Project } from "@/lib/portfolio-data";
import { MathText } from "./math-text";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function ProjectDetail({ project }: { project: Project }) {
  const details = project.details;
  const links = [
    project.github    && { href: project.github,    label: "View source", icon: Github,      type: "github" },
    project.driveLink  && { href: project.driveLink,  label: "Drive folder", icon: HardDrive,   type: "drive" },
    project.demo       && { href: project.demo,       label: "Live demo",  icon: ExternalLink, type: "demo" },
    project.paper      && { href: project.paper,      label: "Read paper",  icon: FileText,    type: "paper" },
  ].filter(Boolean) as { href: string; label: string; icon: React.ComponentType<{ className?: string }>; type: string }[];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground no-underline hover:no-underline">
            <ArrowLeft className="h-4 w-4" />
            Back to all projects
          </Link>
        </div>
        <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-[var(--quantum-cyan)] mb-4">
            <span>{categoryLabels[project.category].label}</span>
            {project.date && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="flex items-center gap-1.5 normal-case tracking-wide text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.date}
                </span>
              </>
            )}
            {project.featured && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="inline-flex items-center gap-1 text-[var(--quantum-gold)] normal-case tracking-wide">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Featured
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            {project.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground italic mb-6">{project.tagline}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs font-ui px-2.5 py-1 rounded-sm border border-border/60 text-muted-foreground bg-muted/30">
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-sm text-sm font-medium font-ui no-underline hover:no-underline hover:bg-foreground/85 transition-colors">
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10">
          <section className="border-l-2 border-[var(--quantum-cyan)] pl-5">
            <p className="text-base sm:text-lg leading-relaxed text-foreground">
              <MathText text={project.description} />
            </p>
          </section>
          {details && (
            <>
              {details.overview && (
                <DetailSection number="01" title="Overview">
                  <p className="text-base leading-relaxed text-foreground/90">
                    <MathText text={details.overview} />
                  </p>
                </DetailSection>
              )}
              {details.methods.length > 0 && (
                <DetailSection number="02" title="Methods">
                  <ul className="space-y-3">
                    {details.methods.map((m, i) => (
                      <li key={i} className="flex gap-3 text-base leading-relaxed text-foreground/90">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-[var(--quantum-cyan)]/10 text-[var(--quantum-cyan)] font-mono text-xs font-semibold shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span><MathText text={m} /></span>
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}
              {details.results.length > 0 && (
                <DetailSection number="03" title="Results">
                  <ul className="space-y-3">
                    {details.results.map((r, i) => (
                      <li key={i} className="flex gap-3 text-base leading-relaxed text-foreground/90">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--quantum-gold)]/20 text-[var(--quantum-gold)] shrink-0 mt-1.5">
                          <span className="block w-1.5 h-1.5 rounded-full bg-[var(--quantum-gold)]" />
                        </span>
                        <span><MathText text={r} /></span>
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}
              {details.figures && details.figures.length > 0 && (
                <DetailSection number="04" title="Figures">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {details.figures.map((fig, i) => (
                      <figure key={i} className="rounded-lg border border-border overflow-hidden bg-card">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          {fig.path ? (
                            <img src={fig.path} alt={fig.alt} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Figure placeholder</span>
                          )}
                        </div>
                        <figcaption className="p-3 text-xs text-muted-foreground border-t border-border/60">
                          <strong className="text-foreground">Figure {i + 1}.</strong> {fig.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </DetailSection>
              )}
              {details.conclusions.length > 0 && (
                <DetailSection number={details.figures && details.figures.length > 0 ? "05" : "04"} title="Conclusions & impact">
                  <ul className="space-y-3">
                    {details.conclusions.map((c, i) => (
                      <li key={i} className="flex gap-3 text-base leading-relaxed text-foreground/90">
                        <ArrowRight className="h-5 w-5 text-[var(--quantum-cyan)] shrink-0 mt-0.5" />
                        <span><MathText text={c} /></span>
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              )}
              {details.acknowledgments && (
                <section className="border-t border-border/40 pt-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Acknowledgments
                  </h3>
                  <p className="text-sm italic text-muted-foreground">{details.acknowledgments}</p>
                </section>
              )}
            </>
          )}
          <section className="border-t border-border/40 pt-8 mt-12">
            <div className="rounded-xl border border-border bg-card/40 p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Want to discuss this project?
                </div>
                <a href={`mailto:${profile.email}?subject=Question about ${encodeURIComponent(project.title)}`}
                  className="text-lg font-medium text-foreground hover:text-[var(--quantum-cyan)] no-underline hover:no-underline">
                  Email me about this work →
                </a>
              </div>
              <Link href="/#projects"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-sm text-sm font-medium font-ui text-foreground no-underline hover:no-underline hover:border-[var(--quantum-cyan)] hover:text-[var(--quantum-cyan)] transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to all projects
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DetailSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-mono text-xs text-[var(--quantum-cyan)] tracking-widest">§ {number}</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="border-l-2 border-border/40 pl-5 ml-1">{children}</div>
    </section>
  );
}
