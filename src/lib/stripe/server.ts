import "server-only";
import Stripe from "stripe";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// With stripe@20.x, apiVersion is strongly typed to Stripe's LatestApiVersion.
// Removing it avoids TS build breaks and Stripe will use your account default.
export const stripe = new Stripe(required("STRIPE_SECRET_KEY"));