"use client";

import imageCompression, { type Options } from "browser-image-compression";

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export type UploadedImage = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

export async function compressForUpload(file: File): Promise<File> {
  const options: Options = {
    maxSizeMB: 0.35,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.72,
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed as File;
  } catch {
    // If compression fails for any reason, just upload original file
    return file;
  }
}

export async function uploadToCloudinary(file: File, signed: SignedUpload): Promise<UploadedImage> {
  const endpoint = `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`;

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signed.apiKey);
  body.append("timestamp", String(signed.timestamp));
  body.append("signature", signed.signature);
  body.append("folder", signed.folder);

  const r = await fetch(endpoint, { method: "POST", body });
  const j = await r.json();

  if (!r.ok) {
    throw new Error(j?.error?.message || "Upload failed");
  }

  return {
    publicId: j.public_id,
    secureUrl: j.secure_url,
    width: j.width,
    height: j.height,
    bytes: j.bytes,
    format: j.format,
  };
}