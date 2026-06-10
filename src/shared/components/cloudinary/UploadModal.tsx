import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImages } from "../../services/uploads";
import { Upload, X } from "lucide-react";

import type { CloudinaryResponse } from "../../services/uploads";

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete?: (responses: CloudinaryResponse[]) => void;
}

export default function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => uploadImages(files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      if (onUploadComplete) onUploadComplete(data);
      onClose();
    },
  });

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
  }, []);

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel centrado */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-[90vw] sm:w-[400px] md:w-[448px] max-w-full bg-surface rounded-2xl shadow-modal border border-outline-variant flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-primary shrink-0">
            <h2 className="text-title-md font-semibold text-on-primary">
              Subir imágenes
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-primary/70 hover:text-on-primary hover:bg-on-primary/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto">

            {/* Dropzone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 py-10 ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant hover:border-primary/60 hover:bg-primary/5"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-primary/10" : "bg-surface-container"}`}>
                <Upload className={`w-6 h-6 transition-colors ${dragging ? "text-primary" : "text-on-surface-variant"}`} />
              </div>
              <div className="text-center">
                <p className="text-body-sm text-on-surface">
                  <span className="font-bold text-primary">Hacé clic para buscar</span>{" "}
                  o arrastrá archivos acá
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  PNG, JPG, GIF, WEBP · máx. 10 MB c/u
                </p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            {/* Lista de archivos */}
            {files.length > 0 && (
              <ul className="max-h-44 overflow-y-auto space-y-2 custom-scrollbar">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 bg-surface-container rounded-xl p-2 border border-outline-variant group/item"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-outline-variant"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm text-on-surface truncate font-semibold">
                        {file.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {file.size < 1024 * 1024
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="p-2 text-on-surface-variant hover:text-error opacity-0 group-hover/item:opacity-100 transition-all shrink-0"
                      title="Quitar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Error */}
            {mutation.isError && (
              <div className="bg-error-container/30 border border-error/20 rounded-xl p-3">
                <p className="text-body-sm text-error font-semibold">
                  {(mutation.error as Error).message}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant shrink-0">
            <span className="text-xs text-on-surface-variant">
              {files.length > 0
                ? `${files.length} archivo${files.length > 1 ? "s" : ""} seleccionado${files.length > 1 ? "s" : ""}`
                : "Sin archivos seleccionados"}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="btn-secondary py-2 px-4 text-body-sm">
                Cancelar
              </button>
              <button
                disabled={files.length === 0 || mutation.isPending}
                onClick={() => mutation.mutate()}
                className="btn-primary py-2 px-5 text-body-sm"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />
                    Subiendo…
                  </span>
                ) : (
                  `Subir${files.length > 0 ? ` (${files.length})` : ""}`
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}
