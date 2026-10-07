import {
  Briefcase,
  CalendarDays,
  Candy,
  Cherry,
  Flame,
  Flower,
  Flower2,
  Leaf,
  Moon,
  Music,
  Snowflake,
  Sparkles,
  Sun,
  User,
  Users,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { FamilySlug, Gender, Occasion, Product, Season } from "../types";

/** Labels and icons for the profile values shown as chips (cards, product page, filters). */
export const GENDERS: Record<Gender, { label: string; Icon: LucideIcon }> = {
  men: { label: "Men", Icon: User },
  women: { label: "Women", Icon: User },
  unisex: { label: "Unisex", Icon: Users },
};
export const OCCASIONS: Record<Occasion, { label: string; Icon: LucideIcon }> =
  {
    everyday: { label: "Everyday", Icon: Sun },
    work: { label: "Work", Icon: Briefcase },
    date: { label: "Date Night", Icon: Moon },
    special: { label: "Special Occasions", Icon: Sparkles },
    club: { label: "Club Vibe", Icon: Music },
  };
export const SEASONS: Record<Season, { label: string; Icon: LucideIcon }> = {
  spring: { label: "Spring", Icon: Flower },
  summer: { label: "Summer", Icon: Sun },
  autumn: { label: "Autumn", Icon: Leaf },
  winter: { label: "Winter", Icon: Snowflake },
  all: { label: "All Year", Icon: CalendarDays },
};
export const FAMILY_ICONS: Record<FamilySlug, LucideIcon> = {
  fresh: Wind,
  oriental: Flame,
  floral: Flower2,
  fruity: Cherry,
  sweet: Candy,
};

/** Chips for a product: who it's for, its first family, first occasion and first season. */
export function profileChips(
  product: Product,
  familyName: (slug: FamilySlug) => string,
) {
  const chips: { label: string; Icon: LucideIcon }[] = [
    GENDERS[product.profile.gender],
  ];
  const family = product.families[0];
  if (family)
    chips.push({ label: familyName(family), Icon: FAMILY_ICONS[family] });
  const occasion = product.profile.occasions[0];
  if (occasion) chips.push(OCCASIONS[occasion]);
  const season = product.profile.seasons[0];
  if (season) chips.push(SEASONS[season]);
  return chips;
}
