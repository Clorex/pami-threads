import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { deleteReview, setReviewApproval } from "@/lib/firebase/reviews.repo";

const Form = z.object({
  action: z.enum(["approve", "hide", "delete"]),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  await requireAdmin();
  const { id } = await ctx.params;

  const form = await req.formData();
  const parsed = Form.parse({ action: String(form.get("action") || "") });

  if (parsed.action === "delete") {
    await deleteReview(id);
  } else if (parsed.action === "approve") {
    await setReviewApproval(id, true);
  } else if (parsed.action === "hide") {
    await setReviewApproval(id, false);
  }

  return NextResponse.redirect(new URL("/admin/reviews", req.url));
}