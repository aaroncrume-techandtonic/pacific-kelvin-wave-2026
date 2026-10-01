export interface WindScenario {
  id: string;
  name: string;
  historicalPeriod: string;
  windIntensityMs: number; // Anomalous westerly speed in m/s
  windStressTau: number; // N/m^2
  phaseSpeedMs: number; // Kelvin wave phase speed (m/s)
  peakSubsurfaceAnomalyC: number;
  description: string;
}

export const WIND_SCENARIOS: WindScenario[] = [
  {
    id: '2026-super',
    name: '2026 Current Super-Burst (Observed)',
    historicalPeriod: 'October 2026',
    windIntensityMs: 11.8,
    windStressTau: 0.24,
    phaseSpeedMs: 2.82, // ~243 km/day
    peakSubsurfaceAnomalyC: 10.4,
    description:
      'Extreme twin cyclone WWB episode triggered by high-amplitude MJO phase 8-1 in Western Pacific warm pool.',
  },
  {
    id: '1997-monster',
    name: '1997 "El Niño of the Century" Analog',
    historicalPeriod: 'March–April 1997',
    windIntensityMs: 12.6,
    windStressTau: 0.28,
    phaseSpeedMs: 2.95, // ~255 km/day
    peakSubsurfaceAnomalyC: 9.8,
    description:
      'Legendary March 1997 WWB series that launched the catastrophic 1997-98 El Niño, crossing the Pacific in 62 days.',
  },
  {
    id: '2015-godzilla',
    name: '2015 "Godzilla" El Niño Analog',
    historicalPeriod: 'May–July 2015',
    windIntensityMs: 10.4,
    windStressTau: 0.20,
    phaseSpeedMs: 2.65, // ~229 km/day
    peakSubsurfaceAnomalyC: 8.9,
    description:
      'Persistent multi-week westerly bursts over western-central Pacific that sustained record global temperatures.',
  },
  {
    id: 'moderate-wwb',
    name: 'Moderate Climatological WWB',
    historicalPeriod: 'Standard Historical Average',
    windIntensityMs: 6.5,
    windStressTau: 0.09,
    phaseSpeedMs: 2.25, // ~194 km/day
    peakSubsurfaceAnomalyC: 4.8,
    description:
      'Typical seasonal westerly wind burst causing a standard moderate Kelvin wave without Super El Niño amplification.',
  },
];

export interface Milestone {
  id: string;
  name: string;
  coordinate: string;
  distanceKm: number;
  description: string;
  baseArrivalDay: number; // approximate day
}

export const PACIFIC_MILESTONES: Milestone[] = [
  {
    id: 'genesis',
    name: 'WWB Genesis (Indonesia)',
    coordinate: '140°E',
    distanceKm: 0,
    description: 'Anomalous wind stress accelerates warm pool waters eastward.',
    baseArrivalDay: 0,
  },
  {
    id: 'warm-pool',
    name: 'Warm Pool Edge (TAO 165°E)',
    coordinate: '165°E',
    distanceKm: 2780,
    description: 'Thermocline begins deep downwelling, insulating heat core.',
    baseArrivalDay: 12,
  },
  {
    id: 'dateline',
    name: 'Date Line (Niño 4)',
    coordinate: '180°',
    distanceKm: 4450,
    description: 'Enters central equatorial Pacific; atmospheric convection follows.',
    baseArrivalDay: 19,
  },
  {
    id: 'nino34',
    name: 'Niño 3.4 Benchmark (140°W)',
    coordinate: '140°W',
    distanceKm: 8900,
    description: 'Core ENSO metric threshold; drives global teleconnections.',
    baseArrivalDay: 38,
  },
  {
    id: 'nino3',
    name: 'Niño 3 Eastern Basin (110°W)',
    coordinate: '110°W',
    distanceKm: 12230,
    description: 'Shuts down equatorial upwelling cold tongue.',
    baseArrivalDay: 52,
  },
  {
    id: 'galapagos',
    name: 'Galápagos / Niño 1+2 (95°W)',
    coordinate: '95°W',
    distanceKm: 13900,
    description: 'Extreme thermal shock hits marine ecosystems and coral reefs.',
    baseArrivalDay: 59,
  },
  {
    id: 'americas',
    name: 'South America Coast (80°W / Peru)',
    coordinate: '80°W',
    distanceKm: 15570,
    description: 'Wave collides with continent, surfacing and raising coastal sea level.',
    baseArrivalDay: 66,
  },
  {
    id: 'california',
    name: 'California Coast (King Tides Surge)',
    coordinate: '34°N / US West Coast',
    distanceKm: 18200,
    description: 'Coastal Kelvin wave propagates poleward, causing +6-12" sea level rise.',
    baseArrivalDay: 78,
  },
];

export function calculateProjection(
  daysAhead: number,
  scenario: WindScenario,
  baseDate: Date = new Date('2026-10-01T00:00:00')
) {
  // Speed in km per day: phaseSpeedMs (m/s) * 86.4
  const kmPerDay = scenario.phaseSpeedMs * 86.4;
  const distanceTraveledKm = Math.min(19000, daysAhead * kmPerDay);

  // Projected target date
  const projectedDate = new Date(baseDate.getTime() + daysAhead * 86400 * 1000);

  // Calculate arrival date for each milestone
  const milestoneStatuses = PACIFIC_MILESTONES.map((m) => {
    const requiredDays = Math.round(m.distanceKm / kmPerDay);
    const arrivalDate = new Date(baseDate.getTime() + requiredDays * 86400 * 1000);
    const hasPassed = daysAhead >= requiredDays + 3;
    const isArrivingNow = Math.abs(daysAhead - requiredDays) <= 3;
    const isUpcoming = daysAhead < requiredDays - 3;
    const daysUntil = requiredDays - daysAhead;

    return {
      ...m,
      requiredDays,
      arrivalDate,
      hasPassed,
      isArrivingNow,
      isUpcoming,
      daysUntil,
    };
  });

  // Calculate current longitude / location
  let currentLongitude = '140°E';
  if (distanceTraveledKm < 4450) {
    const degE = 140 + (distanceTraveledKm / 4450) * 40;
    currentLongitude = `${degE.toFixed(1)}°E`;
  } else if (distanceTraveledKm <= 15570) {
    const degW = 180 - ((distanceTraveledKm - 4450) / (15570 - 4450)) * 100;
    currentLongitude = `${degW.toFixed(1)}°W`;
  } else {
    currentLongitude = 'South America → California (Coastal Wave)';
  }

  // Calculate projected Niño 3.4 SST Anomaly at this day
  // Rises as wave approaches and passes 140°W (~8900km)
  const distToNino34 = Math.abs(distanceTraveledKm - 8900);
  let projectedNino34Anomaly = 1.6; // baseline starting anomaly
  if (distanceTraveledKm >= 4450) {
    const waveImpact = Math.max(0, 1 - distToNino34 / 5000);
    projectedNino34Anomaly = +(1.6 + waveImpact * (scenario.peakSubsurfaceAnomalyC * 0.15)).toFixed(2);
  }
  if (distanceTraveledKm > 10000) {
    // Remains elevated due to coupled basin warming
    projectedNino34Anomaly = +(2.2 + (scenario.windIntensityMs / 12) * 0.4).toFixed(2);
  }

  // Calculate projected thermocline depression in meters
  const thermoclineDepressionM = Math.round(
    30 + (scenario.windIntensityMs / 12) * 65 * Math.min(1, distanceTraveledKm / 12000)
  );

  // Normalized simulation progress (-0.2 to 1.1)
  const simulationProgress = -0.15 + (distanceTraveledKm / 15570) * 1.05;

  return {
    projectedDate,
    distanceTraveledKm,
    currentLongitude,
    projectedNino34Anomaly,
    thermoclineDepressionM,
    milestoneStatuses,
    simulationProgress,
    kmPerDay: Math.round(kmPerDay),
  };
}
