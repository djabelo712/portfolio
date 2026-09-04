"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Figure = { caption: string; path?: string; alt: string };

export function FigureGallery({ figures }: { figures: Figure[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(
    () => setLightbox((i) => (i === null ? i : (i + 1) % figures.length)),
    [figures.length]
  );
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? i : (i - 1 + figures.length) % figures.length)),
    [figures.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, next, prev]);

  if (!figures || figures.length === 0) return null;

  return (
    <>
      {/* Grid of figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {figures.map((fig, i) => (
          <figure
            key={i}
            className="rounded-lg border border-border overflow-hidden bg-card cursor-pointer hover:border-[var(--quantum-cyan)] transition-colors group"
            onClick={() => setLightbox(i)}
            role="button"
            tabIndex={0}
            aria-label={`Open figure ${i + 1}: ${fig.caption}`}
            onKeyDown={(e) => e.key === "Enter" && setLightbox(i)}
          >
            <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden relative">
              {fig.path ? (
                <>
                  <img
                    src={fig.path}
                    alt={fig.alt}
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                      Click to zoom
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground text-sm italic">
                  Figure placeholder
                </span>
              )}
            </div>
            <figcaption className="p-3 text-xs text-muted-foreground border-t border-border/60">
              <strong className="text-foreground">Figure {i + 1}.</strong>{" "}
              {fig.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Lightbox overlay */}
      {lightbox !== null && figures[lightbox].path && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-label={`Figure ${lightbox + 1}: ${figures[lightbox].caption}`}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {figures.length > 1 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous figure"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={figures[lightbox].path}
              alt={figures[lightbox].alt}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white/90 text-sm mt-4 text-center max-w-3xl">
              <strong>Figure {lightbox + 1}.</strong> {figures[lightbox].caption}
            </p>
            {figures.length > 1 && (
              <p className="text-white/50 text-xs mt-2">
                {lightbox + 1} / {figures.length} · Use arrow keys to navigate
              </p>
            )}
          </div>

          {/* Next button */}
          {figures.length > 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next figure"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
