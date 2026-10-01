export interface HistoricalEnsoDataset {
  id: '2026' | '1997' | '2015';
  title: string;
  season: string;
  nino34Anomaly: number; // °C
  peakSubsurfaceAnomaly: number; // °C
  heatContentAnomaly: number; // °C (top 300m)
  thermoclineMaxDepression: number; // meters
  soiIndex: number;
  zonalWindAnomaly: number; // m/s
  phaseSpeedMs: number; // m/s
  totalEnergyZJ: number; // Zettajoules
  description: string;
  keyCharacteristic: string;
  color: string;
  borderColor: string;
  transectProfile: {
    lon: string;
    lonDeg: number;
    thermoclineDepthM: number;
    tempAnomalyC: number;
    sstAnomalyC: number;
  }[];
}

export const HISTORICAL_ENSO_DATASETS: Record<'2026' | '1997' | '2015', HistoricalEnsoDataset> = {
  '2026': {
    id: '2026',
    title: '2026–2027 Super El Niño (Current Live Event)',
    season: 'October 2026 – Present',
    nino34Anomaly: 2.5,
    peakSubsurfaceAnomaly: 10.4,
    heatContentAnomaly: 5.8,
    thermoclineMaxDepression: 95,
    soiIndex: -18.4,
    zonalWindAnomaly: 11.8,
    phaseSpeedMs: 2.82,
    totalEnergyZJ: 0.42,
    description:
      'Unprecedented subsurface heat pulse initiated by dual tropical cyclones and active MJO phase 8-1. Displays the deepest thermocline depression ever recorded in the central Pacific.',
    keyCharacteristic: 'Record subsurface thermal anomaly (>+10.4°C in top 200m) with rapid coupled basin amplification.',
    color: '#ef4444',
    borderColor: 'border-red-500',
    transectProfile: [
      { lon: '140°E', lonDeg: 140, thermoclineDepthM: 195, tempAnomalyC: 0.4, sstAnomalyC: 0.3 },
      { lon: '165°E', lonDeg: 165, thermoclineDepthM: 185, tempAnomalyC: 2.2, sstAnomalyC: 0.8 },
      { lon: '180°', lonDeg: 180, thermoclineDepthM: 175, tempAnomalyC: 5.8, sstAnomalyC: 1.6 },
      { lon: '160°W', lonDeg: -160, thermoclineDepthM: 170, tempAnomalyC: 8.9, sstAnomalyC: 2.1 },
      { lon: '140°W', lonDeg: -140, thermoclineDepthM: 165, tempAnomalyC: 10.4, sstAnomalyC: 2.5 },
      { lon: '110°W', lonDeg: -110, thermoclineDepthM: 145, tempAnomalyC: 8.8, sstAnomalyC: 3.1 },
      { lon: '95°W', lonDeg: -95, thermoclineDepthM: 120, tempAnomalyC: 7.2, sstAnomalyC: 3.8 },
      { lon: '80°W', lonDeg: -80, thermoclineDepthM: 105, tempAnomalyC: 6.5, sstAnomalyC: 4.0 },
    ],
  },
  '1997': {
    id: '1997',
    title: '1997–1998 "El Niño of the Century"',
    season: 'March 1997 – May 1998',
    nino34Anomaly: 2.4,
    peakSubsurfaceAnomaly: 9.8,
    heatContentAnomaly: 5.2,
    thermoclineMaxDepression: 90,
    soiIndex: -24.8,
    zonalWindAnomaly: 12.6,
    phaseSpeedMs: 2.95,
    totalEnergyZJ: 0.38,
    description:
      'The classic modern Super El Niño benchmark. Unleashed by explosive March 1997 westerly bursts, driving catastrophic Peruvian coastal flooding and record California winter storms.',
    keyCharacteristic: 'Extremely explosive spring onset with massive eastern Pacific coastal warming (Niño 1+2 anomaly peaked at +4.5°C).',
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    transectProfile: [
      { lon: '140°E', lonDeg: 140, thermoclineDepthM: 190, tempAnomalyC: 0.2, sstAnomalyC: 0.1 },
      { lon: '165°E', lonDeg: 165, thermoclineDepthM: 180, tempAnomalyC: 1.8, sstAnomalyC: 0.6 },
      { lon: '180°', lonDeg: 180, thermoclineDepthM: 168, tempAnomalyC: 5.1, sstAnomalyC: 1.4 },
      { lon: '160°W', lonDeg: -160, thermoclineDepthM: 162, tempAnomalyC: 7.8, sstAnomalyC: 1.9 },
      { lon: '140°W', lonDeg: -140, thermoclineDepthM: 155, tempAnomalyC: 9.8, sstAnomalyC: 2.4 },
      { lon: '110°W', lonDeg: -110, thermoclineDepthM: 140, tempAnomalyC: 9.2, sstAnomalyC: 3.3 },
      { lon: '95°W', lonDeg: -95, thermoclineDepthM: 125, tempAnomalyC: 8.5, sstAnomalyC: 4.2 },
      { lon: '80°W', lonDeg: -80, thermoclineDepthM: 110, tempAnomalyC: 7.9, sstAnomalyC: 4.5 },
    ],
  },
  '2015': {
    id: '2015',
    title: '2015–2016 "Godzilla" Super El Niño',
    season: 'May 2015 – April 2016',
    nino34Anomaly: 2.6,
    peakSubsurfaceAnomaly: 8.9,
    heatContentAnomaly: 5.6,
    thermoclineMaxDepression: 85,
    soiIndex: -20.2,
    zonalWindAnomaly: 10.4,
    phaseSpeedMs: 2.65,
    totalEnergyZJ: 0.40,
    description:
      'Sustained multi-year warmth building on 2014 pre-conditioning. Smashed Niño 3.4 SST monthly anomaly records at +2.6°C and propelled 2015 & 2016 to hottest global years on record.',
    keyCharacteristic: 'Highest continuous Niño 3.4 SST anomaly (+2.6°C) and massive broad central Pacific thermal pool.',
    color: '#a855f7',
    borderColor: 'border-purple-500',
    transectProfile: [
      { lon: '140°E', lonDeg: 140, thermoclineDepthM: 200, tempAnomalyC: 0.5, sstAnomalyC: 0.4 },
      { lon: '165°E', lonDeg: 165, thermoclineDepthM: 190, tempAnomalyC: 2.4, sstAnomalyC: 1.0 },
      { lon: '180°', lonDeg: 180, thermoclineDepthM: 178, tempAnomalyC: 6.2, sstAnomalyC: 1.8 },
      { lon: '160°W', lonDeg: -160, thermoclineDepthM: 172, tempAnomalyC: 8.4, sstAnomalyC: 2.4 },
      { lon: '140°W', lonDeg: -140, thermoclineDepthM: 160, tempAnomalyC: 8.9, sstAnomalyC: 2.6 },
      { lon: '110°W', lonDeg: -110, thermoclineDepthM: 130, tempAnomalyC: 7.4, sstAnomalyC: 2.8 },
      { lon: '95°W', lonDeg: -95, thermoclineDepthM: 105, tempAnomalyC: 6.1, sstAnomalyC: 3.0 },
      { lon: '80°W', lonDeg: -80, thermoclineDepthM: 90, tempAnomalyC: 5.0, sstAnomalyC: 3.2 },
    ],
  },
};

// Climatological Normal Baseline (for comparison)
export const NORMAL_CLIMATOLOGY_TRANSECT = [
  { lon: '140°E', thermoclineDepthM: 200, tempAnomalyC: 0, sstAnomalyC: 0 },
  { lon: '165°E', thermoclineDepthM: 190, tempAnomalyC: 0, sstAnomalyC: 0 },
  { lon: '180°', thermoclineDepthM: 140, tempAnomalyC: 0, sstAnomalyC: 0 },
  { lon: '160°W', thermoclineDepthM: 115, tempAnomalyC: 0, sstAnomalyC: 0 },
  { lon: '140°W', thermoclineDepthM: 100, tempAnomalyC: 0, sstAnomalyC: 0 },
  { lon: '110°W', thermoclineDepthM: 65, tempAnomalyC: 0, sstAnomalyC: 0 },
  { lon: '95°W', thermoclineDepthM: 45, tempAnomalyC: 0, sstAnomalyC: 0 },
  { lon: '80°W', thermoclineDepthM: 35, tempAnomalyC: 0, sstAnomalyC: 0 },
];
