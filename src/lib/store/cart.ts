export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  title: string;
  priceCents: number;
  imageUrl: string;
  qty: number;
  pick: { fabric: string; size: string; color: string };
};

const LS_KEY = "pt_cart_v1";

function safeParse(json: string | null): CartItem[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v as CartItem[];
  } catch {
    return [];
  }
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(LS_KEY));
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pt_cart_changed"));
}

export function addToCart(item: Omit<CartItem, "key">) {
  const key = `${item.productId}::${item.pick.fabric}::${item.pick.size}::${item.pick.color}`;
  const cart = readCart();
  const found = cart.find((x) => x.key === key);
  if (found) {
    found.qty += item.qty;
    writeCart(cart);
    return;
  }
  writeCart([{ ...item, key }, ...cart]);
}

export function removeFromCart(key: string) {
  const cart = readCart().filter((x) => x.key !== key);
  writeCart(cart);
}

export function setQty(key: string, qty: number) {
  const cart = readCart();
  const found = cart.find((x) => x.key === key);
  if (!found) return;
  found.qty = Math.max(1, Math.floor(qty || 1));
  writeCart(cart);
}

export function cartTotalCents() {
  return readCart().reduce((sum, i) => sum + i.priceCents * i.qty, 0);
}