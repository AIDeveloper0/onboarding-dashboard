import { useRef } from "react";

type Props = {
  label: string;
  imagePath: string | null;
  publicBaseUrl: string;
  uploading: boolean;
  errorMessage?: string;
  selectedFileName?: string;
  onFileSelected: (file: File) => void;
};

export function ImageSlot({
  label,
  imagePath,
  publicBaseUrl,
  uploading,
  errorMessage,
  selectedFileName,
  onFileSelected,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrl =
    imagePath && publicBaseUrl
      ? `${publicBaseUrl}/${imagePath}`
      : null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-40 w-full max-w-[160px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/15 bg-white/5">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-slate-300">No image</span>
          )}
        </div>
        <span className="text-xs font-medium text-slate-200">{label}</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-emerald-300 hover:text-emerald-100"
            disabled={uploading}
          >
            Choose file
          </button>
          {selectedFileName ? (
            <span className="text-xs text-slate-200">{selectedFileName}</span>
          ) : (
            <span className="text-xs text-slate-400">JPG, PNG, GIF</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onFileSelected(file);
            }
          }}
        />

        {uploading ? (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-100">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-200/60 border-t-emerald-300" />
            Uploading...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg bg-rose-500/15 px-3 py-2 text-xs text-rose-50">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
