// ─── Shared Types ───
export type Condition = "excellent" | "good" | "fair" | "poor" | "unknown";
export type Priority = "high" | "medium" | "low";
export type ProjectStatus = "planned" | "in-progress" | "completed" | "on-hold";
export type SystemCategory = "hvac" | "electrical" | "plumbing" | "security" | "network" | "appliances" | "lighting";

// ─── Property & Finances ───
export interface Property {
  address: string;
  purchasePrice: number;
  offerDate: string;
  closingDate: string;
  closingCosts: number;
  sellerConcessions: number;
  squareFeet: number;
  yearBuilt: number;
  lotSize: string;
  hoaMonthly: number;
  homeImage: string;
}

export interface Mortgage {
  loanAmount: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  startDate: string;
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  pmi: number;
  loanProgram: string;
}

export interface Appreciation {
  annualRate: number;
}

export interface InsurancePolicy {
  policyNumber: string;
  provider: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  coverageAmount: number;
  deductible: number;
  renewalDate: string;
  premiumAnnual: number;
  notes: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

// ─── Rooms & Inventory ───
export interface RoomMaterials {
  wallColor: string;
  wallBrand: string;
  trimColor: string;
  trimBrand: string;
  ceilingColor: string;
  ceilingBrand: string;
  flooring: string;
  flooringBrand: string;
  tile: string;
  tileBrand: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  cost: number;
  purchaseDate: string;
  condition: Condition;
  notes: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  url: string;
  priority: Priority;
  notes: string;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  floor: string;
  widthFt: number;
  widthIn: number;
  heightFt: number;
  heightIn: number;
  planX: number;
  planY: number;
  inventory: InventoryItem[];
  wishlist: WishlistItem[];
  materials: RoomMaterials;
  systemIds: string[];
}

// ─── Systems ───
export interface HomeSystem {
  id: string;
  name: string;
  icon: string;
  category: SystemCategory;
  scope: "whole-home" | "room-specific";
  installDate: string;
  lastServiceDate: string;
  nextServiceDate: string;
  warrantyExpiration: string;
  estimatedLifeYears: number;
  estimatedReplaceCost: number;
  condition: Condition;
  notes: string;
  // HVAC-specific
  filterSize?: string;
  filterChangeIntervalMonths?: number;
  // Network/service-specific
  provider?: string;
  monthlyPayment?: number;
  accountNumber?: string;
  // Appliance-specific
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  // Electrical-specific
  amperage?: number;
  // Plumbing-specific
  capacity?: string;
}

// ─── Upkeep ───
export interface SeasonalTask {
  id: string;
  season: "Spring" | "Summer" | "Fall" | "Winter";
  task: string;
  completed: boolean;
  year: number;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  budget: number;
  actualSpend: number;
  contractorId?: string;
  startDate: string;
  endDate: string;
  permitNumber: string;
  notes: string;
}

export interface UtilityBill {
  id: string;
  type: string;
  amount: number;
  date: string;
}

// ─── Custom Tasks ───
export interface CustomTask {
  id: string;
  name: string;
  location: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  completedDate?: string;
}

// ─── Reference ───
export interface EmergencyInfo {
  waterMainLocation: string;
  gasShutoffLocation: string;
  breakerPanelLocation: string;
  sewerCleanoutLocation: string;
  securityCode: string;
  wifiPassword: string;
  notes: string;
}

export interface Contractor {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  rating: number;
  lastUsedDate: string;
  notes: string;
}

export interface DocumentRef {
  id: string;
  name: string;
  category: string;
  date: string;
  location: string;
}

// ─── Feature Flags ───
export interface FeatureFlags {
  temperature: boolean;
  humidity: boolean;
  askDoby: boolean;
  advisories: boolean;
  alertBanner: boolean;
  seasonalChecklist: boolean;
  projectTracker: boolean;
  utilityTracker: boolean;
  expenseTracker: boolean;
  insurancePanel: boolean;
  contractorDirectory: boolean;
  documentIndex: boolean;
  emergencyPanel: boolean;
  wishlist: boolean;
  materials: boolean;
  mortgageCalculator: boolean;
  costBreakdown: boolean;
  roomCostAttribution: boolean;
}

// ─── Root Store State ───
export interface DobyState {
  property: Property;
  mortgage: Mortgage;
  appreciation: Appreciation;
  insurance: InsurancePolicy;
  expenses: Expense[];
  rooms: Room[];
  systems: HomeSystem[];
  seasonalTasks: Record<string, boolean>;
  projects: Project[];
  utilities: UtilityBill[];
  emergencyInfo: EmergencyInfo;
  contractors: Contractor[];
  documents: DocumentRef[];
  customTasks: CustomTask[];
  featureFlags: FeatureFlags;
}
