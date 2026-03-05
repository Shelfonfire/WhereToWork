export interface WorkspaceDetails {
  coffeePriceGbp?: number;
  minSpendGbp?: number;
  hasFreeOption?: boolean;
  typicalStayMins?: number;
  maxStayMins?: number;
  stayNotes?: string;
  hasWifi?: boolean;
  wifiSpeedMbps?: number;
  wifiReliable?: boolean;
  hasPlugs?: boolean;
  plugQuantity?: string;
  seatingSize?: 'small' | 'medium' | 'large';
  noiseLevel?: 'quiet' | 'moderate' | 'lively';
  hasOutdoorSeating?: boolean;
  hasStandingDesks?: boolean;
  hasMeetingRooms?: boolean;
  busynessNotes?: string;
  bestTimes?: string;
  peakTimes?: string;
  hasToilets?: boolean;
  hasFood?: boolean;
  foodNotes?: string;
  laptopFriendlyScore?: number;
  notes?: string;
}

export interface OpeningHour {
  day: string;
  start: string;
  end: string;
}

export interface SocialLinks {
  website?: string;
  instagram?: string;
  x?: string;
  facebook?: string;
  tiktok?: string;
}

export interface ReviewSummary {
  averageScore: number | null;
  reviewCount: number;
}

export interface Place {
  id: number;
  name: string;
  description?: string;
  category?: string;
  categoryIcon?: string;
  latitude: number;
  longitude: number;
  address?: string;
  area?: string;
  postcode?: string;
  googleMapsUrl?: string;
  isVerified?: boolean;
  workspace?: WorkspaceDetails;
  openingHours?: OpeningHour[];
  socialLinks?: SocialLinks;
  reviewSummary?: ReviewSummary;
}
