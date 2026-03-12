export const COL = {
  users: "users",
  products: "products",
  orders: "orders",
  reviews: "reviews",
  authPins: "authPins",
} as const;

export type CollectionName = (typeof COL)[keyof typeof COL];
