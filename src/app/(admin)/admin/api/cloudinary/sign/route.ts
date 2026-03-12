import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { cloudinary, cloudinaryFolder } from "@/lib/cloudinary/server";

const Body = z.object({
  folder: z.string().optional(),
});

export async function POST(req: Request) {
  await requireAdmin();

  const json = await req.json().catch(() => ({}));
  const { folder } = Body.parse(json);

  const timestamp = Math.floor(Date.now() / 1000);
  const finalFolder = (folder?.trim() || cloudinaryFolder()).replace(/\/+$/g, "");

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder: finalFolder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return NextResponse.json({
    ok: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder: finalFolder,
    signature,
  });
}
