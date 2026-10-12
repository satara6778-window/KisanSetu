/**
 * Cloudinary direct upload service (unsigned preset).
 * Docs: https://cloudinary.com/documentation/upload_images#unsigned_upload
 *
 * To configure:
 * 1. Log into cloudinary.com → Settings → Upload → Add upload preset (Unsigned mode)
 * 2. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in frontend/.env
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'YOUR_CLOUD_NAME';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? 'YOUR_UPLOAD_PRESET';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload a File (image from file picker or camera capture) to Cloudinary.
 * Returns the secure HTTPS URL of the uploaded image.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (CLOUD_NAME === 'YOUR_CLOUD_NAME' || UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET') {
    throw new Error(
      'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and ' +
      'VITE_CLOUDINARY_UPLOAD_PRESET in frontend/.env and restart the dev server.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'kisansetu/listings');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Upload failed' } }));
    throw new Error(err?.error?.message ?? 'Cloudinary upload failed');
  }

  return res.json() as Promise<CloudinaryUploadResult>;
}

/** Compress + resize an image File before uploading (client-side, no server needed) */
export async function compressImage(file: File, maxWidthPx = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxWidthPx / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.82
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
}
