export type ViewMode = 'cross-section' | 'satellite-ssh' | 'comparison' | 'north-america';

export interface CoastalStation {
  id: string;
  name: string;
  stateOrRegion: string;
  latitude: number;
  longitude: number;
  distanceFromEquatorKm: number;
  estArrivalDay: number;
  estArrivalDate: string;
  seaLevelSurgeInches: number;
  seaLevelSurgeCm: number;
  sstAnomalyC: number;
  kingTideRisk: 'Severe' | 'Extreme' | 'High';
  vulnerabilities: string[];
  xPercent: number;
  yPercent: number;
}

export interface BuoyStation {
  id: string;
  name: string;
  longitude: string; // e.g. "140°W"
  lonDegrees: number; // e.g. -140
  sst: number; // °C
  sstAnomaly: number; // °C
  thermoclineDepth: number; // meters
  normalThermoclineDepth: number; // meters
  heatContentAnomaly: number; // °C (top 300m)
  zonalWind: number; // m/s (positive = westerly)
  status: 'active' | 'warning' | 'critical';
}

export interface StageInfo {
  number: number;
  title: string;
  subtitle: string;
  progressRange: [number, number]; // [min, max] in 0..1
  jumpProgress: number;
  description: string;
  scientificDetail: string;
  indicators: string[];
}

export interface TeleconnectionImpact {
  id: string;
  region: string;
  title: string;
  severity: 'extreme' | 'high' | 'moderate';
  anomaly: string;
  summary: string;
  mechanisms: string[];
  keyRisks: string[];
}
