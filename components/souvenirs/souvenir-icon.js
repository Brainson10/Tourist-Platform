import { createElement } from "react";
import { Amphora, Coffee, Drum, Gem, Gift, Lamp, Palette, Scissors, Shirt, Soup, Sparkles, Spool } from "lucide-react";

const ICONS = {
  craft: Scissors,
  pottery: Amphora,
  textile: Spool,
  clothing: Shirt,
  jewelry: Gem,
  food: Soup,
  tea: Coffee,
  art: Palette,
  home: Lamp,
  gift: Gift,
  heritage: Drum,
  other: Sparkles,
};

/** The icon an admin picked for a souvenir category, or a gift. Decorative. */
export function SouvenirIcon({ icon, className = "h-5 w-5", strokeWidth = 1.75 }) {
  return createElement(ICONS[icon] ?? Gift, { "aria-hidden": true, className, strokeWidth });
}
