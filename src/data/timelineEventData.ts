export interface MonthlyEventPoint {
  id: string;
  monthIndex: number; // 0 to 7 (Aug 2026 to Mar 2027)
  monthLabel: string;
  fullDate: string;
  eventPhase: string;
  progress: number; // mapped to WaveCanvas progress (-0.3 to 1.3)
  coastalDay: number; // mapped to North American coastal day (65 to 120)
  oni: number; // Oceanic Niño Index (°C)
  nino34Sst: number; // SST in Niño 3.4 (°C)
  subsurfaceCoreAnomaly: number; // Peak subsurface anomaly (°C)
  thermoclineDepthM: number; // Depth in meters
  thermoclineDepressionM: number; // Depression below normal (m)
  sshaSurgeCm: number; // Sea Surface Height Anomaly (cm)
  sshaSurgeInches: number; // SSHA in inches
  zonalWindAnomalyMs: number; // m/s
  basinLocation: string;
  summary: string;
  riskCategory: 'High' | 'Extreme' | 'Historic';
  badgeLabel: string;
}

export const HISTORICAL_TIMELINE_MONTHS: MonthlyEventPoint[] = [
  {
    id: 'aug-2026',
    monthIndex: 0,
    monthLabel: 'Aug 2026',
    fullDate: 'August 2026',
    eventPhase: 'Westerly Wind Burst (WWB) Genesis',
    progress: -0.15,
    coastalDay: 65,
    oni: 0.7,
    nino34Sst: 27.8,
    subsurfaceCoreAnomaly: 3.2,
    thermoclineDepthM: 140,
    thermoclineDepressionM: 20,
    sshaSurgeCm: 6.0,
    sshaSurgeInches: 2.4,
    zonalWindAnomalyMs: 9.4,
    basinLocation: '140°E – 160°E (Western Warm Pool)',
    summary:
      'Madden-Julian Oscillation (MJO) active phase 8-1 and twin tropical cyclones trigger surface westerlies exceeding 12 m/s, arresting the normal westward South Equatorial Current.',
    riskCategory: 'High',
    badgeLabel: 'WWB Trigger',
  },
  {
    id: 'sep-2026',
    monthIndex: 1,
    monthLabel: 'Sep 2026',
    fullDate: 'September 2026',
    eventPhase: 'Equatorial Kelvin Wave Deep Initiation',
    progress: 0.12,
    coastalDay: 66,
    oni: 1.3,
    nino34Sst: 28.2,
    subsurfaceCoreAnomaly: 6.8,
    thermoclineDepthM: 175,
    thermoclineDepressionM: 55,
    sshaSurgeCm: 14.2,
    sshaSurgeInches: 5.6,
    zonalWindAnomalyMs: 7.8,
    basinLocation: '165°E – 175°W (Western / Central Basin)',
    summary:
      'Baroclinic mode-1 Kelvin wave organizes along the equatorial waveguide, driving rapid thermocline downwelling and insulating extreme heat beneath the mixed layer.',
    riskCategory: 'High',
    badgeLabel: 'Thermocline Bulge',
  },
  {
    id: 'oct-2026',
    monthIndex: 2,
    monthLabel: 'Oct 2026',
    fullDate: 'October 2026',
    eventPhase: 'Central Basin Trans-Pacific Peak (Current State)',
    progress: 0.48,
    coastalDay: 67,
    oni: 2.2,
    nino34Sst: 29.4,
    subsurfaceCoreAnomaly: 10.4,
    thermoclineDepthM: 195,
    thermoclineDepressionM: 95,
    sshaSurgeCm: 24.8,
    sshaSurgeInches: 9.8,
    zonalWindAnomalyMs: 5.1,
    basinLocation: '170°W – 140°W (Niño 3.4 Central Core)',
    summary:
      'Record-breaking subsurface thermal core passes 140°W with +10.4°C anomaly at 140m depth. Sea surface height anomaly reaches +24.8 cm, detected by Sentinel-6 altimetry.',
    riskCategory: 'Historic',
    badgeLabel: 'Peak Kelvin Wave',
  },
  {
    id: 'nov-2026',
    monthIndex: 3,
    monthLabel: 'Nov 2026',
    fullDate: 'November 2026',
    eventPhase: 'Eastern Basin Downwelling & Upwelling Suppression',
    progress: 0.74,
    coastalDay: 68,
    oni: 2.6,
    nino34Sst: 29.8,
    subsurfaceCoreAnomaly: 9.8,
    thermoclineDepthM: 160,
    thermoclineDepressionM: 95,
    sshaSurgeCm: 26.5,
    sshaSurgeInches: 10.4,
    zonalWindAnomalyMs: 3.4,
    basinLocation: '120°W – 95°W (Niño 3 / Galápagos Front)',
    summary:
      'Downwelling pulse reaches the eastern boundary cold tongue, cutting off normal nutrient-rich upwelling. Galápagos and Peruvian coastal waters experience rapid SST heating.',
    riskCategory: 'Extreme',
    badgeLabel: 'Upwelling Collapse',
  },
  {
    id: 'dec-2026',
    monthIndex: 4,
    monthLabel: 'Dec 2026',
    fullDate: 'December 2026',
    eventPhase: 'Continental Landfall & Coastal Bifurcation',
    progress: 0.96,
    coastalDay: 75,
    oni: 2.9,
    nino34Sst: 30.2,
    subsurfaceCoreAnomaly: 8.2,
    thermoclineDepthM: 135,
    thermoclineDepressionM: 85,
    sshaSurgeCm: 28.0,
    sshaSurgeInches: 11.0,
    zonalWindAnomalyMs: 2.8,
    basinLocation: '80°W (Panama Bight / Coastal Ecuador)',
    summary:
      'Equatorial wave collides with the Americas continental boundary, surfacing into severe marine heatwave anomalies and bifurcating into northward and southward Coastal Kelvin Waves.',
    riskCategory: 'Historic',
    badgeLabel: 'Americas Landfall',
  },
  {
    id: 'jan-2027',
    monthIndex: 5,
    monthLabel: 'Jan 2027',
    fullDate: 'January 2027',
    eventPhase: 'North American Coastal Surge & King Tides Resonance',
    progress: 1.12,
    coastalDay: 90,
    oni: 3.1,
    nino34Sst: 30.4,
    subsurfaceCoreAnomaly: 6.5,
    thermoclineDepthM: 120,
    thermoclineDepressionM: 70,
    sshaSurgeCm: 30.0,
    sshaSurgeInches: 11.8,
    zonalWindAnomalyMs: 2.1,
    basinLocation: '32°N – 42°N (California Shoreline)',
    summary:
      'Poleward Coastal Kelvin Wave strikes California during astronomical winter King Tides (+7.2 ft). Total Water Level exceeds 8.0 ft MLLW, inundating coastal seawalls and highway corridors.',
    riskCategory: 'Historic',
    badgeLabel: 'King Tides Surge',
  },
  {
    id: 'feb-2027',
    monthIndex: 6,
    monthLabel: 'Feb 2027',
    fullDate: 'February 2027',
    eventPhase: 'Atmospheric Rivers & Super El Niño Teleconnections',
    progress: 1.22,
    coastalDay: 105,
    oni: 2.9,
    nino34Sst: 29.9,
    subsurfaceCoreAnomaly: 5.1,
    thermoclineDepthM: 110,
    thermoclineDepressionM: 55,
    sshaSurgeCm: 22.0,
    sshaSurgeInches: 8.7,
    zonalWindAnomalyMs: 1.8,
    basinLocation: 'Global Pacific Teleconnection Belt',
    summary:
      'Peak coupled ocean-atmosphere Bjerknes feedback. Supercharged subtropical jet stream channels relentless Atmospheric Rivers into California while severe drought grips Indonesia.',
    riskCategory: 'Extreme',
    badgeLabel: 'Atmospheric Rivers',
  },
  {
    id: 'mar-2027',
    monthIndex: 7,
    monthLabel: 'Mar 2027',
    fullDate: 'March 2027',
    eventPhase: 'Alaskan Gyre Dissipation & Rossby Reflection',
    progress: 1.30,
    coastalDay: 116,
    oni: 2.4,
    nino34Sst: 29.1,
    subsurfaceCoreAnomaly: 3.8,
    thermoclineDepthM: 100,
    thermoclineDepressionM: 40,
    sshaSurgeCm: 15.0,
    sshaSurgeInches: 5.9,
    zonalWindAnomalyMs: 1.2,
    basinLocation: '54°N (Gulf of Alaska) & Reflected Rossby Waves',
    summary:
      'Coastal wave wraps into the Subarctic Gyre, losing boundary coherence. Equatorial boundary reflection spawns westward-traveling Rossby waves, starting the slow basin adjustment.',
    riskCategory: 'High',
    badgeLabel: 'Alaskan Dissipation',
  },
];
