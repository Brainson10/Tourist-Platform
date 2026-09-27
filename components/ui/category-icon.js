import { createElement } from "react";
import { Bird, Camera, Compass, Drum, Flower2, Landmark, Leaf, Mountain, PawPrint, Soup, Tent, Waves } from "lucide-react";

const ICONS = {
  wildlife: PawPrint,
  nature: Leaf,
  culture: Drum,
  spiritual: Landmark,
  food: Soup,
  adventure: Mountain,
  photography: Camera,
  camping: Tent,
  lakes: Waves,
  birding: Bird,
  festival: Flower2,
  festivals: Flower2,
};

export function categoryIcon(slugOrName = "") {
  return ICONS[slugOrName.toLowerCase()] ?? Compass;
}

export function CategoryIcon({ slug, className = "h-5 w-5", strokeWidth = 1.75 }) {
  return createElement(categoryIcon(slug), { "aria-hidden": true, className, strokeWidth });
}
