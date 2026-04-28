import {
  Sofa, CookingPot, BedDouble, BedSingle, Bath, Utensils,
  Monitor, Car, ArrowDownToLine, Shirt, ArrowUpToLine, Package,
} from "lucide-react";

export const roomIconMap: Record<string, React.ElementType> = {
  sofa: Sofa,
  "cooking-pot": CookingPot,
  "bed-double": BedDouble,
  "bed-single": BedSingle,
  bath: Bath,
  utensils: Utensils,
  monitor: Monitor,
  car: Car,
  "arrow-down-to-line": ArrowDownToLine,
  shirt: Shirt,
  "arrow-up-to-line": ArrowUpToLine,
  package: Package,
};
