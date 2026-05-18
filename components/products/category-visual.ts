import {
  Atom,
  Beaker,
  Box,
  Droplets,
  FlaskConical,
  Layers,
  TestTube,
} from "lucide-react";

/**
 * Icon + brand-gradient accent for each product category. Kept separate from
 * the catalog data — the DB doesn't know about icons. Add a new entry
 * whenever a new category id appears in `data/products.json`.
 */
export const CATEGORY_VISUAL: Record<
  string,
  { icon: typeof Atom; accent: string }
> = {
  fluororesin:                { icon: Beaker,       accent: "from-brand-600 to-brand-800" },
  fluoroelastomer:            { icon: Atom,         accent: "from-brand-500 to-accent-400" },
  pvdf:                       { icon: Layers,       accent: "from-accent-400 to-accent-600" },
  ptfe:                       { icon: FlaskConical, accent: "from-brand-700 to-brand-900" },
  fep:                        { icon: Box,          accent: "from-brand-400 to-brand-600" },
  pfa:                        { icon: Droplets,     accent: "from-accent-300 to-accent-500" },
  "fluorine-fine-chemicals":  { icon: TestTube,     accent: "from-brand-500 to-accent-500" },
};

export const DEFAULT_VISUAL = {
  icon: Atom,
  accent: "from-brand-600 to-brand-800",
};
