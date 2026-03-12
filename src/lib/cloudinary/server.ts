import "server-only";

import { v2 as cloudinary } from "cloudinary";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

cloudinary.config({
  cloud_name: required("CLOUDINARY_CLOUD_NAME"),
  api_key: required("CLOUDINARY_API_KEY"),
  api_secret: required("CLOUDINARY_API_SECRET"),
  secure: true,
});

export { cloudinary };

export function cloudinaryFolder() {
  return process.env.CLOUDINARY_FOLDER?.trim() || "pami-threads";
}
