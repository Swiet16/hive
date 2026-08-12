// Curated catalog metadata used across admin form and filters.
// Updated for Life Hive — multi-category "everything is here" store.
// Schema stays the same (products.category is just a text column),
// only the option list shown in the admin form changes.

export const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion",     label: "Fashion" },
  { value: "home",        label: "Home & Living" },
  { value: "beauty",      label: "Beauty & Health" },
  { value: "sports",      label: "Sports & Outdoor" },
  { value: "grocery",     label: "Grocery & Gourmet" },
  { value: "toys",        label: "Toys & Baby" },
  { value: "books",       label: "Books & Stationery" },
  { value: "auto",        label: "Automotive" },
  { value: "garden",      label: "Garden & Outdoor" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const BRANDS_BY_CATEGORY: Record<CategoryValue, string[]> = {
  electronics: ["Aurora", "Pulse", "ZenBook", "Mecha", "Flash", "Boost", "Samsung", "Apple", "Sony", "Bose", "Anker", "Logitech"],
  fashion:     ["Coast", "Trail", "Artisan", "Northwind", "Levi's", "Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Patagonia"],
  home:        ["Lumina", "ErgoLab", "Hearth", "ZenHome", "IKEA", "Dyson", "Philips", "Casper", "KitchenAid"],
  beauty:      ["Glow", "Hydra", "Velvet", "The Ordinary", "L'Oréal", "Maybelline", "Neutrogena", "CeraVe", "Fenty"],
  sports:      ["ZenFit", "IronCore", "Aero", "Nike", "Adidas", "Under Armour", "Decathlon", "Wilson", "Callaway"],
  grocery:     ["Bean Lab", "Hive Pure", "Nestlé", "Quaker", "Kellogg's", "Heinz", "Organic Valley", "Lavazza"],
  toys:        ["LittleHands", "CuddleCo", "LEGO", "Mattel", "Hasbro", "Fisher-Price", "Melissa & Doug"],
  books:       ["Penguin", "HarperCollins", "Scholastic", "Cal Newport", "James Clear", "Simon Sinek"],
  auto:        ["RoadEye", "CleanRide", "Bosch", "Michelin", "Castrol", "Mobil 1", "WeatherTech", "Garmin"],
  garden:      ["Sprout", "GreenThumb", "Scotts", "Miracle-Gro", "Fiskars", "Black+Decker"],
};

// Order status pipeline (used by admin + track-order). Uses `key` field
// to stay compatible with existing routes & DB text column.
export const ORDER_STAGES = [
  { key: "pending",    label: "Order Placed",  desc: "We've received your order" },
  { key: "confirmed",  label: "Confirmed",     desc: "Payment verified & approved" },
  { key: "processing", label: "Processing",    desc: "Picking from warehouse" },
  { key: "shipped",    label: "Shipped",       desc: "On the way to your address" },
  { key: "delivered",  label: "Delivered",     desc: "Successfully delivered" },
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number]["key"];
export type OrderStageKey = OrderStage;

export function stageIndex(status: string): number {
  const i = ORDER_STAGES.findIndex((s) => s.key === status.toLowerCase());
  return i < 0 ? 0 : i;
}

// Helper to validate category
export function isValidCategory(c: string | undefined | null): c is CategoryValue {
  return !!c && CATEGORIES.some((x) => x.value === c);
}
