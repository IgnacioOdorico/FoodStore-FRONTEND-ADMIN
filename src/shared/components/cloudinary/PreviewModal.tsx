import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { CloudinaryResponse } from "../../services/uploads";

interface PreviewModalProps {
  images: CloudinaryResponse[];
  initialIndex: number;
  onClose: () => void;
}

export default function PreviewModal({
  images,
  initialIndex,
  onClose,
}: PreviewModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const image = images[index];

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIndex((i) => Math.min(images.length - 1, i + 1)),
    [images.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        onClick={prev}
        disabled={index === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/8 hover:bg-white/16 disabled:opacity-0 disabled:pointer-events-none text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="relative mx-16 max-w-5xl max-h-[90vh] flex items-center justify-center">
        <img
          key={image.public_id}
          src={image.secure_url}
          alt={image.public_id}
          className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
        />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur text-white p-2 rounded-full transition-colors border border-white/10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent rounded-b-2xl px-4 pt-8 pb-3 pointer-events-none">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {image.public_id}
              </p>
              <p className="text-white/50 text-xs mt-0.5">
                {[
                  image.width &&
                    image.height &&
                    `${image.width}x${image.height}`,
                  image.format?.toUpperCase()
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span className="text-white/35 text-xs tabular-nums shrink-0">
              {index + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={next}
        disabled={index === images.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/8 hover:bg-white/16 disabled:opacity-0 disabled:pointer-events-none text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>,
    document.body
  );
}
