import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { uploadToCloudinary, compressImage } from '../services/cloudinaryService';

export interface ImageUploaderProps {
  /** Current image URL (to show preview) */
  value: string;
  /** Called with the new Cloudinary secure URL once upload succeeds */
  onChange: (url: string) => void;
  /** Optional label override */
  label?: string;
  /** Called while uploading (to disable parent submit) */
  onUploadingChange?: (uploading: boolean) => void;
}

/**
 * Dual-mode image uploader:
 *  - 📂 File picker  — upload from computer memory / gallery
 *  - 📷 Camera      — capture directly via phone/webcam  (capture="environment")
 *
 * On mobile, tapping "Take Photo" opens the rear camera.
 * On desktop it falls back to the file picker.
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Crop Photo',
  onUploadingChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    onUploadingChange?.(true);
    setProgress(10);

    try {
      // Compress before upload
      const compressed = await compressImage(file, 1200);
      setProgress(40);

      const result = await uploadToCloudinary(compressed);
      setProgress(100);
      onChange(result.secure_url);
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
        {label}
      </label>

      {/* Preview */}
      {value && (
        <div className="relative group">
          <img
            src={value}
            alt="Crop preview"
            className="w-full h-40 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
            title="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
            ✓ Uploaded
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* File from computer/gallery */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading ? 'Uploading…' : 'Upload File'}
        </button>

        {/* Camera capture (env camera on mobile, file picker fallback on desktop) */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => cameraRef.current?.click()}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-zinc-600 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-3.5 h-3.5" />
          Take Photo
        </button>
      </div>

      {/* No-photo placeholder */}
      {!value && !uploading && (
        <div className="w-full h-24 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-1 text-zinc-400">
          <ImageIcon className="w-6 h-6" />
          <span className="text-[11px]">No photo yet — upload or take one above</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {/* capture="environment" = rear camera on mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};
