import type {
  Property,
  Mortgage,
  Appreciation,
  InsurancePolicy,
  EmergencyInfo,
  RoomMaterials,
  FeatureFlags,
  DobyState,
} from "./types";

export const defaultProperty: Property = {
  address: "",
  purchasePrice: 0,
  offerDate: "",
  closingDate: "",
  closingCosts: 0,
  sellerConcessions: 0,
  squareFeet: 0,
  yearBuilt: 0,
  lotSize: "",
  hoaMonthly: 0,
  homeImage: "",
};

export const defaultMortgage: Mortgage = {
  loanAmount: 0,
  downPayment: 0,
  interestRate: 0,
  termYears: 30,
  startDate: "",
  propertyTaxAnnual: 0,
  homeInsuranceAnnual: 0,
  pmi: 0,
  loanProgram: "",
};

export const defaultAppreciation: Appreciation = {
  annualRate: 3.5,
};

export const defaultInsurance: InsurancePolicy = {
  policyNumber: "",
  provider: "",
  agentName: "",
  agentPhone: "",
  agentEmail: "",
  coverageAmount: 0,
  deductible: 0,
  renewalDate: "",
  premiumAnnual: 0,
  notes: "",
};

export const defaultEmergencyInfo: EmergencyInfo = {
  waterMainLocation: "",
  gasShutoffLocation: "",
  breakerPanelLocation: "",
  sewerCleanoutLocation: "",
  securityCode: "",
  wifiPassword: "",
  notes: "",
};

export const defaultMaterials: RoomMaterials = {
  wallColor: "",
  wallBrand: "",
  trimColor: "",
  trimBrand: "",
  ceilingColor: "",
  ceilingBrand: "",
  flooring: "",
  flooringBrand: "",
  tile: "",
  tileBrand: "",
};

export const defaultFeatureFlags: FeatureFlags = {
  advisories: true,
  alertBanner: true,
  seasonalChecklist: true,
  projectTracker: true,
  utilityTracker: true,
  expenseTracker: true,
  insurancePanel: true,
  contractorDirectory: true,
  documentIndex: true,
  emergencyPanel: true,
  wishlist: true,
  materials: true,
  mortgageCalculator: true,
  costBreakdown: true,
  roomCostAttribution: true,
};

export const defaultState: DobyState = {
  property: defaultProperty,
  globalMaterials: defaultMaterials,
  mortgage: defaultMortgage,
  appreciation: defaultAppreciation,
  insurance: defaultInsurance,
  expenses: [],
  rooms: [],
  systems: [],
  seasonalTasks: {},
  projects: [],
  utilities: [],
  emergencyInfo: defaultEmergencyInfo,
  contractors: [],
  documents: [],
  customTasks: [],
  featureFlags: defaultFeatureFlags,
  theme: "dark" as const,
};

// ─── Presets ───

export const roomPresets = [
  { name: "Living Room", icon: "sofa", color: "#3083DC" },
  { name: "Kitchen", icon: "cooking-pot", color: "#FE9000" },
  { name: "Master Bedroom", icon: "bed-double", color: "#8B5CF6" },
  { name: "Bedroom", icon: "bed-single", color: "#6366F1" },
  { name: "Bathroom", icon: "bath", color: "#06B6D4" },
  { name: "Dining Room", icon: "utensils", color: "#F59E0B" },
  { name: "Office", icon: "monitor", color: "#058C42" },
  { name: "Garage", icon: "car", color: "#8a8b91" },
  { name: "Basement", icon: "arrow-down-to-line", color: "#64748B" },
  { name: "Laundry", icon: "shirt", color: "#EC4899" },
  { name: "Attic", icon: "arrow-up-to-line", color: "#A3A3A3" },
  { name: "Pantry", icon: "package", color: "#D97706" },
] as const;

export const floorOptions = ["Basement", "Main", "Upper", "Attic"] as const;

export const systemPresets = [
  // Whole-home systems — apply to entire property, no per-room linking
  { name: "HVAC", icon: "thermometer", estimatedLifeYears: 15, category: "hvac" as const, scope: "whole-home" as const },
  { name: "Water Heater", icon: "flame", estimatedLifeYears: 12, category: "plumbing" as const, scope: "whole-home" as const },
  { name: "Roof", icon: "home", estimatedLifeYears: 25, category: "hvac" as const, scope: "whole-home" as const },
  { name: "Furnace", icon: "flame-kindling", estimatedLifeYears: 20, category: "hvac" as const, scope: "whole-home" as const },
  { name: "Air Conditioner", icon: "snowflake", estimatedLifeYears: 15, category: "hvac" as const, scope: "whole-home" as const },
  { name: "Electrical Panel", icon: "zap", estimatedLifeYears: 40, category: "electrical" as const, scope: "whole-home" as const },
  { name: "Plumbing", icon: "pipette", estimatedLifeYears: 50, category: "plumbing" as const, scope: "whole-home" as const },
  { name: "Septic System", icon: "cylinder", estimatedLifeYears: 25, category: "plumbing" as const, scope: "whole-home" as const },
  { name: "Sump Pump", icon: "droplets", estimatedLifeYears: 10, category: "plumbing" as const, scope: "whole-home" as const },
  { name: "Garage Door", icon: "door-open", estimatedLifeYears: 20, category: "security" as const, scope: "whole-home" as const },
  { name: "WiFi / Network", icon: "wifi", estimatedLifeYears: 7, category: "network" as const, scope: "whole-home" as const },
  // Room-specific systems — placed in individual rooms
  { name: "Washer", icon: "shirt", estimatedLifeYears: 10, category: "appliances" as const, scope: "room-specific" as const },
  { name: "Dryer", icon: "wind", estimatedLifeYears: 13, category: "appliances" as const, scope: "room-specific" as const },
  { name: "Dishwasher", icon: "utensils-crossed", estimatedLifeYears: 10, category: "appliances" as const, scope: "room-specific" as const },
  { name: "Refrigerator", icon: "refrigerator", estimatedLifeYears: 14, category: "appliances" as const, scope: "room-specific" as const },
] as const;

export const systemCategories = [
  { key: "hvac" as const, label: "HVAC", icon: "thermometer" },
  { key: "electrical" as const, label: "Electrical", icon: "zap" },
  { key: "plumbing" as const, label: "Plumbing", icon: "pipette" },
  { key: "security" as const, label: "Security", icon: "shield" },
  { key: "network" as const, label: "Network", icon: "wifi" },
  { key: "appliances" as const, label: "Appliances", icon: "refrigerator" },
  { key: "lighting" as const, label: "Lighting", icon: "lightbulb" },
] as const;

export const seasonalTaskPresets: Record<string, string[]> = {
  Spring: [
    "Inspect roof for winter damage",
    "Clean gutters and downspouts",
    "Service HVAC — replace filters",
    "Check exterior paint and caulking",
    "Test sump pump",
    "Fertilize lawn and garden beds",
    "Power wash deck and siding",
    "Check window screens",
  ],
  Summer: [
    "Inspect and clean dryer vent",
    "Check irrigation system",
    "Trim trees away from house",
    "Inspect deck/patio for damage",
    "Clean range hood filter",
    "Check attic ventilation",
    "Service lawn mower",
    "Inspect garage door operation",
  ],
  Fall: [
    "Clean gutters before winter",
    "Service furnace — replace filter",
    "Drain outdoor faucets and hoses",
    "Seal gaps around windows and doors",
    "Test smoke and CO detectors",
    "Reverse ceiling fan direction",
    "Inspect weather stripping",
    "Stock winter supplies (salt, shovels)",
  ],
  Winter: [
    "Check for ice dams",
    "Inspect insulation in attic",
    "Test backup generator",
    "Check water heater pressure valve",
    "Inspect pipes for freezing risk",
    "Deep clean kitchen appliances",
    "Plan spring projects and budget",
    "Review insurance coverage",
  ],
};

export const expenseCategories = [
  "Maintenance",
  "Repair",
  "Improvement",
  "Utility",
  "Insurance",
  "Tax",
  "Landscaping",
  "Cleaning",
  "Furnishing",
  "Other",
] as const;

export const utilityTypes = [
  "Electric",
  "Gas",
  "Water",
  "Sewer",
  "Trash",
  "Internet",
  "Phone",
  "Cable",
] as const;

export const contractorTypes = [
  "General",
  "Plumber",
  "Electrician",
  "HVAC",
  "Roofer",
  "Painter",
  "Landscaper",
  "Handyman",
  "Carpenter",
  "Mason",
  "Other",
] as const;

export const documentCategories = [
  "Deed",
  "Title",
  "Survey",
  "Inspection",
  "Appraisal",
  "Insurance",
  "Warranty",
  "Permit",
  "Tax",
  "Receipt",
  "Contract",
  "Other",
] as const;

export const utilityProviderMap: Record<string, string> = {
  Electric: "BGE",
  Gas: "BGE",
  Water: "Howard County",
  Sewer: "Howard County",
  Trash: "Howard County",
  Internet: "Provider",
  Phone: "Provider",
  Cable: "Provider",
};

export const systemCategoryColors: Record<string, string> = {
  hvac: "#3083DC",
  electrical: "#FE9000",
  plumbing: "#058C42",
  security: "#95190C",
  network: "#8B5CF6",
  appliances: "var(--d-text-muted)",
  lighting: "#EAB308",
};
