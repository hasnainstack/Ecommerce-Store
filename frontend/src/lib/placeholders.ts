export const PLACEHOLDER_MAP: Record<string, string> = {
  headphone: "/images/products/headphones.svg",
  earphone: "/images/products/headphones.svg",
  tshirt: "/images/products/tshirt.svg",
  "t-shirt": "/images/products/tshirt.svg",
  shirt: "/images/products/tshirt.svg",
  shoe: "/images/products/shoes.svg",
  sneaker: "/images/products/shoes.svg",
  footwear: "/images/products/shoes.svg",
  watch: "/images/products/watch.svg",
  furniture: "/images/products/furniture.svg",
  couch: "/images/products/furniture.svg",
  chair: "/images/products/furniture.svg",
  beauty: "/images/products/beauty.svg",
  cosmetic: "/images/products/beauty.svg",
  skincare: "/images/products/beauty.svg",
  sports: "/images/products/sports.svg",
  dumbbell: "/images/products/sports.svg",
  fitness: "/images/products/sports.svg",
  gym: "/images/products/sports.svg",
};

export function getProductPlaceholder(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, path] of Object.entries(PLACEHOLDER_MAP)) {
    if (lower.includes(key)) return path;
  }
  return "/images/products/product.svg";
}
