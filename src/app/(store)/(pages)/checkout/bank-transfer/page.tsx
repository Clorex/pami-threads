import { requireCustomer } from "@/lib/auth/session";
import { getOrderBySessionId } from "@/lib/firebase/orders.repo";
import { notFound } from "next/navigation";
import { BankTransferClient } from "./ui";

export const revalidate = 0;

export default async function BankTransferPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const customer = await requireCustomer();
  const sp = await searchParams;
  const orderId = (sp.orderId || "").trim();
  if (!orderId) return notFound();

  const order = await getOrderBySessionId(orderId);
  if (!order || (order.uid || "").trim() !== customer.uid) return notFound();

  return (
    <BankTransferClient
      orderId={orderId}
      status={order.status}
      amountTotalCents={order.amountTotalCents}
      currency={order.currency}
      proofUrl={order.paymentProof?.secureUrl || ""}
    />
  );
}