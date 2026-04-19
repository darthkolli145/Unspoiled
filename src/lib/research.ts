export interface Citation {
  id: string;
  source: string;
  year: string;
  title: string;
  url: string;
  quote: string;
}

export interface MarketClaim {
  id: string;
  label: string;
  value: string;
  citationId: string;
}

export const citations: Citation[] = [
  {
    id: "refed-138m-tons",
    source: "ReFED",
    year: "2023",
    title: "From Surplus to Solutions: U.S. Food Waste Analysis",
    url: "https://refed.org/food-waste/the-problem/",
    quote:
      "The U.S. generates 138 million tons of surplus food each year, with most ending up as waste.",
  },
  {
    id: "refed-382b-value",
    source: "ReFED",
    year: "2023",
    title: "Economic Value of Surplus Food in the U.S.",
    url: "https://refed.org/food-waste/the-problem/",
    quote:
      "Surplus food carries roughly $382B in annual economic value across the U.S. food system.",
  },
  {
    id: "epa-landfill-share",
    source: "U.S. EPA",
    year: "2023",
    title: "Facts and Figures about Materials, Waste and Recycling",
    url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/food-material-specific-data",
    quote:
      "Landfills and combustion are dominant end destinations for wasted food in the U.S.",
  },
  {
    id: "usda-2030-goal",
    source: "USDA + EPA",
    year: "2015",
    title: "U.S. 2030 Food Loss and Waste Reduction Goal",
    url: "https://www.usda.gov/foodlossandwaste",
    quote:
      "National policy target is to cut food loss and waste by 50% by 2030.",
  },
  {
    id: "massdep-waste-ban",
    source: "MassDEP",
    year: "2024",
    title: "Commercial Food Material Disposal Ban",
    url: "https://www.mass.gov/guides/commercial-food-material-disposal-ban",
    quote:
      "Massachusetts enforces a commercial food material disposal ban with generator requirements.",
  },
  {
    id: "vermont-universal-recycling",
    source: "Vermont ANR",
    year: "2024",
    title: "Universal Recycling Law (Act 148)",
    url: "https://dec.vermont.gov/waste-management/solid/universal-recycling",
    quote:
      "Vermont's Universal Recycling law phases in food scrap diversion requirements statewide.",
  },
  {
    id: "calrecycle-organics",
    source: "CalRecycle",
    year: "2024",
    title: "SB 1383 Short-Lived Climate Pollutants",
    url: "https://calrecycle.ca.gov/organics/slcp/",
    quote:
      "California requires organics diversion and edible food recovery under SB 1383.",
  },
  {
    id: "ct-commercial-organics",
    source: "CT DEEP",
    year: "2024",
    title: "Commercial Organics Recycling Law",
    url: "https://portal.ct.gov/deep/reduce-reuse-recycle/organics-recycling",
    quote:
      "Connecticut requires certain commercial food residual generators to divert organics.",
  },
  {
    id: "ri-food-scrap-ban",
    source: "RI DEM",
    year: "2024",
    title: "Food Scrap Ban Program",
    url: "https://dem.ri.gov/environmental-protection-bureau/waste-management/food-scrap-ban",
    quote:
      "Rhode Island food scrap requirements apply to large generators with distance criteria.",
  },
  {
    id: "compology-site",
    source: "Compology",
    year: "2024",
    title: "Compology Product Overview",
    url: "https://www.compology.com/",
    quote:
      "Compology provides container monitoring and hauling optimization for waste operations.",
  },
  {
    id: "rubicon-site",
    source: "Rubicon",
    year: "2024",
    title: "Rubicon Waste and Recycling Solutions",
    url: "https://www.rubicon.com/",
    quote:
      "Rubicon focuses on enterprise waste, recycling, and sustainability technology.",
  },
  {
    id: "recyclist-site",
    source: "Recyclist",
    year: "2024",
    title: "Recyclist Product",
    url: "https://recyclist.co/",
    quote:
      "Recyclist provides recycling compliance and reporting workflows for organizations.",
  },
];

export const citationsById = new Map(citations.map((c) => [c.id, c]));

export const marketClaims: MarketClaim[] = [
  {
    id: "us-surplus-food",
    label: "U.S. surplus food generated annually",
    value: "138M tons/year",
    citationId: "refed-138m-tons",
  },
  {
    id: "us-surplus-value",
    label: "Estimated annual economic value at risk",
    value: "$382B/year",
    citationId: "refed-382b-value",
  },
  {
    id: "us-policy-target",
    label: "Federal reduction target",
    value: "50% by 2030",
    citationId: "usda-2030-goal",
  },
];

export function getCitation(id: string): Citation {
  const citation = citationsById.get(id);
  if (!citation) {
    throw new Error(`Unknown citation id: ${id}`);
  }
  return citation;
}
