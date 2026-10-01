export interface KelvinRealtimeTelemetry {
  longitudeDeg: number;
  longitudeStr: string;
  distanceKm: number;
  percentTransited: number;
  basinZone: string;
  zoneTag: string;
  phaseSpeedMs: number;
  phaseSpeedKmh: number;
  phaseSpeedMph: number;
  phaseSpeedKmDay: number;
  coreTempC: number;
  coreTempF: number;
  tempAnomalyC: number;
  tempAnomalyF: number;
  thermoclineDepthM: number;
  thermoclineDepthFt: number;
  normalThermoclineDepthM: number;
  thermoclineDepressionM: number;
  sshaCm: number;
  sshaInches: number;
  heatEnergyJoules: number; // in Joules
  heatEnergyZJ: number; // Zettajoules (10^21 J)
  volumeTransportSv: number; // Sverdrups (10^6 m^3/s)
  rossbyRadiusKm: number; // km
  daysToCoast: number;
  hoursToCoast: number;
  closestBuoy: {
    name: string;
    longitude: string;
    distanceToWaveKm: number;
    status: 'in-range' | 'approaching' | 'passed';
  };
  severityLevel: 'extreme' | 'critical' | 'severe';
}

export function computeKelvinTelemetry(progress: number): KelvinRealtimeTelemetry {
  // Clamp effective progress for distance calculation: 0 to 1 represents 140°E to 80°W (15,570 km)
  const normProg = Math.max(0, Math.min(1.15, (progress + 0.15) / 1.15));
  const totalBasinKm = 15570;
  const distanceKm = Math.round(normProg * totalBasinKm);
  const percentTransited = Math.min(100, Math.max(0, Math.round(normProg * 100)));

  // Longitude calculation (130°E to 80°W)
  // 150 degrees span across the Pacific
  const degSpan = normProg * 150;
  let lonStr = '140.0°E';
  let longitudeDeg = 140;

  if (degSpan <= 40) {
    const degE = 140 + degSpan;
    lonStr = `${degE.toFixed(1)}°E`;
    longitudeDeg = degE;
  } else if (degSpan <= 150) {
    const degW = 180 - (degSpan - 40);
    lonStr = `${degW.toFixed(1)}°W`;
    longitudeDeg = -degW;
  } else {
    lonStr = '80.0°W (Americas Coast)';
    longitudeDeg = -80;
  }

  // Basin Zone
  let basinZone = 'Western Pacific Warm Pool';
  let zoneTag = 'Warm Pool';
  if (normProg < 0.18) {
    basinZone = 'Western Warm Pool Genesis (130°E–165°E)';
    zoneTag = 'Genesis Zone';
  } else if (normProg < 0.38) {
    basinZone = 'Western-Central Pacific / Niño 4 (165°E–170°W)';
    zoneTag = 'Niño 4';
  } else if (normProg < 0.65) {
    basinZone = 'Central Equatorial Pacific / Niño 3.4 (170°W–120°W)';
    zoneTag = 'Niño 3.4 Core';
  } else if (normProg < 0.88) {
    basinZone = 'Eastern Equatorial Pacific / Niño 3 (120°W–90°W)';
    zoneTag = 'Niño 3';
  } else if (normProg <= 1.02) {
    basinZone = 'Galápagos & Coastal Peru / Niño 1+2 (90°W–80°W)';
    zoneTag = 'Niño 1+2';
  } else {
    basinZone = 'Americas Coastal Boundary (North/South Coastal Kelvin Waves)';
    zoneTag = 'Coastal Waveguide';
  }

  // Phase Speed: varies with stratification (deeper western warm layer gives slightly higher phase speed c = sqrt(g' H))
  // West ~ 2.85 m/s, East ~ 2.62 m/s
  const phaseSpeedMs = +(2.85 - normProg * 0.22 + Math.sin(normProg * Math.PI) * 0.05).toFixed(2);
  const phaseSpeedKmh = +(phaseSpeedMs * 3.6).toFixed(1);
  const phaseSpeedMph = +(phaseSpeedMs * 2.237).toFixed(1);
  const phaseSpeedKmDay = Math.round(phaseSpeedMs * 86.4);

  // Core Subsurface Temperature & Anomaly
  // Normal base thermocline drops from 200m in west to 80m in east
  const normalThermoclineDepthM = Math.round(200 - normProg * 120);

  // Depression peaks in central/eastern basin where thermocline is pushed down most dramatically relative to shallow normal
  const thermoclineDepressionM = Math.round(55 + Math.sin(Math.min(1, normProg) * Math.PI * 0.9) * 45);
  const thermoclineDepthM = normalThermoclineDepthM + thermoclineDepressionM;
  const thermoclineDepthFt = Math.round(thermoclineDepthM * 3.28084);

  // Core temperature anomaly: peaks at >10.4°C in central/eastern basin
  const tempAnomalyC = +(7.5 + Math.sin(Math.min(1, normProg) * Math.PI * 0.85) * 2.9).toFixed(1);
  const tempAnomalyF = +(tempAnomalyC * 1.8).toFixed(1);

  // Actual core absolute temperature (around 27.5°C down at 160m!)
  const coreTempC = +(17.5 + tempAnomalyC).toFixed(1);
  const coreTempF = +(coreTempC * 1.8 + 32).toFixed(1);

  // Sea Surface Height Anomaly (SSHA)
  const sshaCm = +(16 + Math.sin(normProg * Math.PI) * 12.5).toFixed(1);
  const sshaInches = +(sshaCm * 0.3937).toFixed(1);

  // Total Thermal Heat Energy Content in Joules
  // Volume: length ~ 2000 km, width ~ 500 km, depth ~ 100 m = 10^14 m^3 of water with ~4-10°C anomaly
  // Heat Q = rho * Cp * V * deltaT ~ 1000 * 4184 * 10^14 * 6 ~ 2.5 * 10^20 Joules
  const heatEnergyJoules = +(2.4e20 + normProg * 1.8e20);
  const heatEnergyZJ = +(heatEnergyJoules / 1e21).toFixed(2); // Zettajoules

  // Volume Transport in Sverdrups (1 Sv = 10^6 m^3/s)
  const volumeTransportSv = +(32 + Math.sin(normProg * Math.PI) * 14).toFixed(1);

  // Equatorial Rossby Radius of deformation: Re = sqrt(c / (2*beta))
  // beta = 2.28 * 10^-11 m^-1 s^-1
  const beta = 2.28e-11;
  const rossbyRadiusM = Math.sqrt(phaseSpeedMs / (2 * beta));
  const rossbyRadiusKm = Math.round(rossbyRadiusM / 1000);

  // ETA to Americas (distance remaining / speed)
  const remainingKm = Math.max(0, totalBasinKm - distanceKm);
  const hoursToCoast = Math.round((remainingKm / phaseSpeedKmDay) * 24);
  const daysToCoast = +(hoursToCoast / 24).toFixed(1);

  // Closest Buoy Detection
  const buoyLons = [
    { name: '165°E Mooring', deg: 165 },
    { name: '180° Date Line', deg: 180 },
    { name: '140°W Niño 3.4', deg: -140 },
    { name: '110°W Niño 3', deg: -110 },
    { name: '95°W Galápagos', deg: -95 },
  ];

  let closest = buoyLons[0];
  let minDiff = Infinity;
  buoyLons.forEach((b) => {
    const diff = Math.abs(b.deg - longitudeDeg);
    if (diff < minDiff) {
      minDiff = diff;
      closest = b;
    }
  });

  const distToBuoyKm = Math.round(minDiff * 111); // ~111 km per degree along equator
  let buoyStatus: 'in-range' | 'approaching' | 'passed' = 'approaching';
  if (distToBuoyKm < 350) buoyStatus = 'in-range';
  else if (longitudeDeg < 0 && closest.deg > 0) buoyStatus = 'passed';
  else if (longitudeDeg < 0 && closest.deg < 0 && longitudeDeg < closest.deg) buoyStatus = 'passed';

  return {
    longitudeDeg,
    longitudeStr: lonStr,
    distanceKm,
    percentTransited,
    basinZone,
    zoneTag,
    phaseSpeedMs,
    phaseSpeedKmh,
    phaseSpeedMph,
    phaseSpeedKmDay,
    coreTempC,
    coreTempF,
    tempAnomalyC,
    tempAnomalyF,
    thermoclineDepthM,
    thermoclineDepthFt,
    normalThermoclineDepthM,
    thermoclineDepressionM,
    sshaCm,
    sshaInches,
    heatEnergyJoules,
    heatEnergyZJ,
    volumeTransportSv,
    rossbyRadiusKm,
    daysToCoast,
    hoursToCoast,
    closestBuoy: {
      name: closest.name,
      longitude: `${Math.abs(closest.deg)}°${closest.deg > 0 ? 'E' : 'W'}`,
      distanceToWaveKm: distToBuoyKm,
      status: buoyStatus,
    },
    severityLevel: tempAnomalyC > 9.5 ? 'extreme' : tempAnomalyC > 7.5 ? 'critical' : 'severe',
  };
}
