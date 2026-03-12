import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/session";
import { cloudinary, cloudinaryFolder } from "@/lib/cloudinary/server";

export const runtime = "nodejs";

export async function POST() {
  const customer = await requireCustomer();

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${cloudinaryFolder()}/payment-proofs/${customer.uid}`.replace(/\/+$/g, "");

  const paramsToSign: Record<string, string | number> = { timestamp, folder };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return NextResponse.json({
    ok: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  });
}