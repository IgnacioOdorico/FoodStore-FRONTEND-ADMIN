import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImage } from "../../services/uploads";
import type { CloudinaryResponse } from "../../services/uploads";

function formatBytes(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ImageCardProps {
  image: CloudinaryResponse;
  onOpenPreview: () => void;
}

export default function ImageCard({ image, onOpenPreview }: ImageCardProps) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mutation = useMutation({
    mutationFn: () => deleteImage(image.public_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images"] }),
  });

  return (
    <div className="group relative overflow-hidden rounded-xl bg-zinc-800 break-inside-avoid mb-3 shadow-sm">
      <img
        src={image.secure_url}
        alt={image.public_id}
        className="w-full h-auto block cursor-pointer transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
        onClick={onOpenPreview}
      />

      <div
        className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        onClick={onOpenPreview}
      />

      <div className="absolute bottom-0 left-0 right-0 px-3 py-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <p className="text-white text-sm font-medium truncate leading-snug">
          {image.public_id}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white/50 text-xs">
            {[
              image.width && image.height && `${image.width}x${image.height}`
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          {image.format && (
            <span className="ml-auto text-[10px] uppercase bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-semibold tracking-wide">
              {image.format}
            </span>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                mutation.mutate();
              }}
              disabled={mutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-lg disabled:opacity-60 transition-colors shadow-lg"
            >
              {mutation.isPending ? "..." : "Delete"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
              className="bg-black/60 backdrop-blur text-white/80 hover:text-white text-xs px-2 py-1 rounded-lg border border-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className="bg-black/50 backdrop-blur hover:bg-red-500/80 text-white/70 hover:text-white p-1.5 rounded-lg border border-white/10 transition-all shadow"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
