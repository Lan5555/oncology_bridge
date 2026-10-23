"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

function imageSource(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const source = value.trim();
  if (source.startsWith("/") && !source.startsWith("//")) return source;
  try {
    const url = new URL(source);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default function RecordImageGallery({ images }: { images: unknown[] }) {
  const [selectedUrl, setSelectedUrl] = useState("");
  const [failed, setFailed] = useState<string[]>([]);
  const seen = new Set<string>();
  const photos = images.flatMap((image) => {
    const item =
      image && typeof image === "object"
        ? (image as Record<string, unknown>)
        : {};
    const url = imageSource(item.url);
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [
      {
        url,
        alt:
          typeof item.alt === "string" && item.alt.trim()
            ? item.alt
            : "Product photo",
      },
    ];
  });
  const selected =
    photos.find((photo) => photo.url === selectedUrl) ?? photos[0];
  const markFailed = (url: string) =>
    setFailed((current) =>
      current.includes(url) ? current : [...current, url],
    );

  return (
    <section className="mb-6" aria-label="Product images">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-g800">Product images</h3>
        {selected && (
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-p underline underline-offset-4"
          >
            Open original image
          </a>
        )}
      </div>
      <figure className="overflow-hidden rounded-2xl border border-g200 bg-g50">
        {selected && !failed.includes(selected.url) ? (
          // biome-ignore lint/performance/noImgElement: Product image hosts are supplied by the backend and vary by deployment.
          <img
            src={selected.url}
            alt={selected.alt}
            className="h-64 w-full bg-w object-contain p-4 sm:h-80"
            referrerPolicy="no-referrer"
            onError={() => markFailed(selected.url)}
          />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center text-g500">
            <ImageOff size={32} aria-hidden="true" />
            <p className="text-sm">
              {selected
                ? "This product image could not be loaded."
                : "No product images available."}
            </p>
          </div>
        )}
        {selected && (
          <figcaption className="border-t border-g200 px-4 py-3 text-xs text-g600">
            {selected.alt}
            <span className="ml-2 text-g500">
              Image {photos.indexOf(selected) + 1} of {photos.length}
            </span>
          </figcaption>
        )}
      </figure>
      {photos.length > 1 && (
        <section
          className="mt-3 flex gap-2 overflow-x-auto pb-2"
          aria-label="Choose a product image"
        >
          {photos.map((photo, index) => (
            <button
              key={photo.url}
              type="button"
              aria-pressed={selected.url === photo.url}
              aria-label={`Preview image ${index + 1}: ${photo.alt}`}
              onClick={() => setSelectedUrl(photo.url)}
              className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-w p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-p ${selected.url === photo.url ? "border-p" : "border-g200 hover:border-g400"}`}
            >
              {failed.includes(photo.url) ? (
                <ImageOff size={20} className="text-g400" aria-hidden="true" />
              ) : (
                // biome-ignore lint/performance/noImgElement: Thumbnails use the same backend-provided product image hosts.
                <img
                  src={photo.url}
                  alt=""
                  className="size-full object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => markFailed(photo.url)}
                />
              )}
            </button>
          ))}
        </section>
      )}
    </section>
  );
}
