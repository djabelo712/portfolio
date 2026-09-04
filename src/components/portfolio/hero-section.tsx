"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Github, Mail, MapPin, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/lib/portfolio-data";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = profile.graduationImages ?? [];

  // Auto-advance the slider every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
    >
      {/* Background: full-bleed graduation photo slider, with overlay */}
      <div className="absolute inset-0" aria-hidden>
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === slideIdx ? 1 : 0 }}
          >
            <img
              src={slide.src}
              alt={slide.caption}
              className="w-full h-full object-cover"
              style={{ filter: "blur(2px) brightness(0.4)" }}
            />
          </div>
        ))}

        {/* Subtle quantum grid overlay (kept from v1) */}
        <div className="absolute inset-0 quantum-grid opacity-30" />

        {/* Navy gradient overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(27, 42, 78, 0.65) 50%, rgba(184, 115, 51, 0.35) 100%)",
          }}
        />
      </div>

      {/* Slider dots (bottom-right) */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-8 right-8 z-10 flex items-center gap-2"
          aria-label="Background photo navigation"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              aria-label={`Photo ${i + 1}: ${slides[i].caption}`}
              className={`h-1.5 rounded-full transition-all ${
                i === slideIdx
                  ? "w-8 bg-[var(--quantum-cyan)]"
                  : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide caption (bottom-left) */}
      {slides.length > 0 && (
        <div
          className="absolute bottom-8 left-8 z-10 max-w-md text-white/85 text-xs font-mono-ui"
          aria-live="polite"
        >
          {slides[slideIdx].caption}
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-center">
          {/* Profile picture, top-left */}
          <div className="quantum-fade-up mx-auto lg:mx-0">
            <div className="relative">
              {/* Decorative rotating ring around the photo */}
              <div
                className="absolute -inset-2 quantum-rotate-slow opacity-70"
                aria-hidden
              >
                <div className="w-full h-full rounded-full border-2 border-dashed border-[var(--quantum-cyan)]" />
              </div>
              <div
                className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border-4 border-white/80 shadow-2xl"
                style={{ background: "var(--quantum-paper)" }}
              >
                {profile.profileImage && (
                  <img
                    src={profile.profileImage}
                    alt={`${profile.name}, graduation portrait`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Hero text block */}
          <div className="max-w-3xl">
            {/* Top meta line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono uppercase tracking-[0.2em] text-white/70 mb-6 quantum-fade-up">
              <span className="text-[var(--quantum-cyan)]">●</span>
              <span>AIMS Ghana · University of Lomé</span>
              <span className="opacity-50">·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-4 quantum-fade-up text-white">
              {profile.name}
            </h1>

            <p
              className="text-lg sm:text-xl leading-snug mb-6 quantum-fade-up text-white/90"
              style={{ animationDelay: "0.15s" }}
            >
              {profile.title}
            </p>

            <p
              className="text-base sm:text-lg text-white/75 leading-relaxed mb-8 quantum-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {profile.tagline}
            </p>

            {/* Availability ribbon */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-12 rounded-full border border-[var(--quantum-cyan)]/60 bg-[var(--quantum-cyan)]/15 text-white text-sm font-medium quantum-fade-up max-w-full"
              style={{ animationDelay: "0.3s" }}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--quantum-cyan)] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--quantum-cyan)]" />
              </span>
              <span>Seeking PhD positions for Fall 2026 / Spring 2027</span>
            </div>

            <div
              className="flex flex-wrap gap-3 mb-12 quantum-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Button asChild size="lg" className="bg-[var(--quantum-cyan)] hover:bg-[var(--quantum-cyan)]/90 text-[var(--quantum-ink)]">
                <Link href="#projects" className="no-underline">
                  View Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
                <Link href="#contact" className="no-underline">
                  <Mail className="mr-2 h-4 w-4" />
                  Get in touch
                </Link>
              </Button>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl quantum-fade-up"
              style={{ animationDelay: "0.5s" }}
            >
              {profile.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-l-2 border-[var(--quantum-cyan)]/50 pl-4"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/70 tracking-wide uppercase mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div
              className="flex items-center gap-3 mt-10 quantum-fade-up"
              style={{ animationDelay: "0.6s" }}
            >
              {profile.github && (
                <SocialIcon href={profile.github} label="GitHub">
                  <Github className="h-4 w-4" />
                </SocialIcon>
              )}
              {profile.linkedin && (
                <SocialIcon href={profile.linkedin} label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </SocialIcon>
              )}
              {profile.email && (
                <SocialIcon href={`mailto:${profile.email}`} label="Email">
                  <Mail className="h-4 w-4" />
                </SocialIcon>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isMail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
      aria-label={label}
      className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/40 text-white hover:border-[var(--quantum-cyan)] hover:bg-[var(--quantum-cyan)]/20 hover:text-[var(--quantum-cyan)] transition-colors no-underline hover:no-underline"
    >
      {children}
    </a>
  );
}
