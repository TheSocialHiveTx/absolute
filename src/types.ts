export interface ServiceType {
  id: string;
  name: string;
  basePriceRange: string;
  description: string;
  icon: string;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  urgency: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  description: string;
  status: "pending" | "dispatched" | "completed";
  createdAt: string;
}

export interface QuoteEstimate {
  id: string;
  serviceType: string;
  urgency: string;
  severity: "low" | "medium" | "high";
  propertyType: "residential" | "commercial";
  estimatedLow: number;
  estimatedHigh: number;
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  source: string;
  verified: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
