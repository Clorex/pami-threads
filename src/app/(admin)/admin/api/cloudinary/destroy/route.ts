import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { cloudinary } from "@/lib/cloudinary/server";

const Body = z.object({
  publicId: z.string().min(1),
});

export async function POST(req: Request) {
  await requireAdmin();

  const json = await req.json().catch(() => ({}));
  const { publicId } = Body.parse(json);

  const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });

  return NextResponse.json({ ok: true, result });
}
