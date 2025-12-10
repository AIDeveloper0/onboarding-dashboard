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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-40 w-full max-w-[160px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-slate-400">No image</span>
          )}
        </div>
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            disabled={uploading}
          >
            Choose file
          </button>
          {selectedFileName ? (
            <span className="text-xs text-slate-600">{selectedFileName}</span>
          ) : (
            <span className="text-xs text-slate-500">JPG, PNG, GIF</span>
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
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
            Uploading...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
