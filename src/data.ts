import { ServiceType, Review } from "./types";

export const SERVICES_LIST: ServiceType[] = [
  {
    id: "drain-cleaning",
    name: "Clogged Drain & Sewer Cleaning",
    basePriceRange: "$150 - $350",
    description: "Expert removal of grease, soap build-up, foreign objects, or tree roots using professional drain machines and hydro-jetting.",
    icon: "ShowerHead"
  },
  {
    id: "water-heaters",
    name: "Water Heater Repair & Install",
    basePriceRange: "$180 - $2,800",
    description: "Troubleshooting faulty thermostats, electric elements, gas valves, or doing complete replacements of energy-efficient electric, gas, and tankless units.",
    icon: "Flame"
  },
  {
    id: "emergency-leaks",
    name: "Emergency Leak Repair",
    basePriceRange: "$190 - $650",
    description: "Swift detection and containment of bursting copper, PEX, or PVC lines. Emergency main shut-off assistance included.",
    icon: "Droplets"
  },
  {
    id: "toilet-fixtures",
    name: "Toilet & Fixture Replacement",
    basePriceRange: "$140 - $450",
    description: "Repairing running toilets, rebuilding tank fittings, and professional installation of sink faucets, garbage disposals, and master showers.",
    icon: "Wrench"
  },
  {
    id: "sewer-repair",
    name: "Sewer Pipe Repair & Video Audit",
    basePriceRange: "$400 - $3,500+",
    description: "High-resolution sewer camera inspection followed by trenchless or spot excavation pipe repairs to restore your structural main-drain.",
    icon: "Eye"
  },
  {
    id: "slab-leak",
    name: "Slab Leak Detection & Tuning",
    basePriceRange: "$350 - $1,500",
    description: "Electronic leak location beneath concrete foundations, with tailored sub-slab rerouting or targeted breakout repairs.",
    icon: "Hammer"
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Robert Miller",
    rating: 5,
    date: "2 days ago",
    text: "Excellent and honest service. They found where my kitchen drain was blocked, cleared it quickly, and cleaned up after themselves perfectly. Rates were exactly as quoted.",
    source: "Google Local",
    verified: true
  },
  {
    id: "rev-2",
    author: "Maria S.",
    rating: 5,
    date: "1 week ago",
    text: "My water heater started leaking at 6:00 AM. I called Absolute Plumbing and they had a technician at my house in Deer Park before 8:30! Very professional and helpful.",
    source: "Google Local",
    verified: true
  },
  {
    id: "rev-3",
    author: "Gary Thompson",
    rating: 4,
    date: "3 weeks ago",
    text: "Reasonably priced and trustworthy. Absolute Plumbing resolved our slab leak issues without cutting up our main hallway floors. Appreciate the great communication.",
    source: "Google Local",
    verified: true
  },
  {
    id: "rev-4",
    author: "Samantha Harris",
    rating: 5,
    date: "1 month ago",
    text: "Highly recommend! They cleared our mainline sewer tree root clogs. Incredible modern scoping equipment, got to see exactly what the issue was before we paid.",
    source: "Google Local",
    verified: true
  },
];

export const TROUBLESHOOTING_TEMPLATES = [
  {
    title: "Toilet keeps running constantly",
    issue: "My toilet keeps running water into the bowl non-stop.",
    urgency: "Standard"
  },
  {
    title: "Burst water line flooding utility room",
    issue: "A water pipe burst and there's a heavy leak flooding the cellar/house.",
    urgency: "Emergency"
  },
  {
    title: "Water heater has only cold water",
    issue: "My water heater isn't outputting any hot water. Only cold/lukewarm water coming out.",
    urgency: "Standard"
  },
  {
    title: "Kitchen double sink backed up & smells",
    issue: "Both kitchen sinks are backed up and water is pooling. Standing water has sour smell.",
    urgency: "Standard"
  }
];
