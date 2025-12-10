import type { UsersCustom } from "@/types/user";
import { ImageSlot } from "./ImageSlot";

export type SlotState = {
  uploading: boolean;
  fileName?: string;
  error?: string;
};

type Props = {
  profile: UsersCustom;
  slotStates: Record<number, SlotState>;
  publicBaseUrl: string;
  onFileSelected: (slotIndex: number, file: File) => void;
};

export function ImageGrid({
  profile,
  slotStates,
  publicBaseUrl,
  onFileSelected,
}: Props) {
  const imagePaths = [
    profile.image1_path,
    profile.image2_path,
    profile.image3_path,
    profile.image4_path,
    profile.image5_path,
    profile.image6_path,
    profile.image7_path,
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Images
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Upload up to 7 images
          </h2>
          <p className="mt-1 text-sm text-slate-200/80">
            Each upload saves the storage path back to your profile.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {imagePaths.map((path, idx) => {
          const slotIndex = idx + 1;
          const state = slotStates[slotIndex] ?? { uploading: false };
          return (
            <ImageSlot
              key={slotIndex}
              label={`Image ${slotIndex}`}
              imagePath={path}
              publicBaseUrl={publicBaseUrl}
              uploading={state.uploading}
              selectedFileName={state.fileName}
              errorMessage={state.error}
              onFileSelected={(file) => onFileSelected(slotIndex, file)}
            />
          );
        })}
      </div>
    </div>
  );
}
