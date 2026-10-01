import { BuoyStation, StageInfo, TeleconnectionImpact } from '../types/kelvin';

export const BUOY_STATIONS: BuoyStation[] = [
  {
    id: 'tao-165e',
    name: 'Western Warm Pool Mooring',
    longitude: '165°E',
    lonDegrees: 165,
    sst: 29.8,
    sstAnomaly: +0.4,
    thermoclineDepth: 185,
    normalThermoclineDepth: 190,
    heatContentAnomaly: +0.6,
    zonalWind: +7.2, // Westerly burst!
    status: 'active',
  },
  {
    id: 'tao-180',
    name: 'Date Line Mooring (Niño 4)',
    longitude: '180°',
    lonDegrees: 180,
    sst: 30.1,
    sstAnomaly: +1.6,
    thermoclineDepth: 175,
    normalThermoclineDepth: 140,
    heatContentAnomaly: +2.8,
    zonalWind: +5.5,
    status: 'warning',
  },
  {
    id: 'tao-140w',
    name: 'Central Pacific Mooring (Niño 3.4)',
    longitude: '140°W',
    lonDegrees: -140,
    sst: 29.4,
    sstAnomaly: +2.5,
    thermoclineDepth: 165,
    normalThermoclineDepth: 100,
    heatContentAnomaly: +5.4,
    zonalWind: +4.1,
    status: 'critical',
  },
  {
    id: 'tao-110w',
    name: 'Eastern Pacific Mooring (Niño 3)',
    longitude: '110°W',
    lonDegrees: -110,
    sst: 27.9,
    sstAnomaly: +3.1,
    thermoclineDepth: 145,
    normalThermoclineDepth: 65,
    heatContentAnomaly: +8.2,
    zonalWind: +2.8,
    status: 'critical',
  },
  {
    id: 'tao-95w',
    name: 'Galápagos / Coastal Mooring (Niño 1+2)',
    longitude: '95°W',
    lonDegrees: -95,
    sst: 26.8,
    sstAnomaly: +3.8,
    thermoclineDepth: 120,
    normalThermoclineDepth: 40,
    heatContentAnomaly: +9.7,
    zonalWind: +1.9,
    status: 'critical',
  },
];

export const STAGES_DATA: StageInfo[] = [
  {
    number: 1,
    title: 'The Catalyst',
    subtitle: 'Westerly Wind Bursts (WWB)',
    progressRange: [-0.3, 0.2],
    jumpProgress: 0.08,
    description:
      'Normal trade winds weaken or collapse. Anomalous westerly wind bursts in the western Pacific begin pushing vast amounts of sun-warmed surface water toward the east.',
    scientificDetail:
      'Driven by intense Madden-Julian Oscillation (MJO) active phases and twin cyclone pairs, surface westerlies reach 10–15 m/s. This arrests the normal westward South Equatorial Current and triggers anomalous eastward advection.',
    indicators: ['Winds: +8 to +12 m/s westerlies', 'Location: 130°E – 165°E', 'SST Warm Pool displacement'],
  },
  {
    number: 2,
    title: 'Downwelling',
    subtitle: 'Thermocline Depression',
    progressRange: [0.2, 0.45],
    jumpProgress: 0.32,
    description:
      'As the warm water piles up, gravity and planetary rotation force it downwards. This deepens the thermocline, creating a massive subsurface reservoir of trapped heat.',
    scientificDetail:
      'Ekman convergence drives downward vertical velocity ($w < 0$), depressing the 20°C isotherm by 60–90 meters. Trapped at depth, this thermal pulse is insulated from atmospheric cooling and evaporative heat loss.',
    indicators: ['Thermocline depth: 180m+ (vs 120m normal)', 'Peak heat core: +10.4°C anomaly', 'Location: 165°E – 170°W'],
  },
  {
    number: 3,
    title: 'The Journey',
    subtitle: 'Equatorial Waveguide Transit',
    progressRange: [0.45, 0.75],
    jumpProgress: 0.58,
    description:
      'This deep-ocean thermal pulse travels silently eastward along the equator. Isolated from the atmosphere, it retains its extreme heat over a 2 to 3 month journey.',
    scientificDetail:
      'The wave is trapped within the equatorial beta-plane deformation radius ($L_e \\approx 250\\text{ km}$). Because the Coriolis parameter $f$ changes sign across the equator, it cannot disperse poleward and propagates as a non-dispersive internal Kelvin wave at phase speed $c = \\sqrt{g\' H} \\approx 2.5\\text{ m/s}$.',
    indicators: ['Speed: 2.2 – 2.8 m/s (200 km/day)', 'Transit time: 60 – 75 days', 'Location: 160°W – 110°W'],
  },
  {
    number: 4,
    title: 'Surfacing & Impact',
    subtitle: 'Coastal Surfacing & Basin Coupling',
    progressRange: [0.75, 1.3],
    jumpProgress: 0.88,
    description:
      'Colliding with South America, the wave is forced upward. It dramatically warms the surface, raises coastal sea levels, and locks in the Super El Niño atmospheric pattern.',
    scientificDetail:
      'Upon striking the South American continent, the equatorial wave bifurcates into poleward Coastal Kelvin Waves propagating north toward California and south toward Chile. Thermal expansion forces sea level anomalies of +15 to +30 cm, while ocean-atmosphere Bjerknes feedback locks in global climate teleconnections.',
    indicators: ['Sea level rise: +6 to +12 in (15–30 cm)', 'SST anomaly: +3.8°C at Galápagos', 'Location: 95°W – 80°W / Americas'],
  },
];

export const TELECONNECTIONS: TeleconnectionImpact[] = [
  {
    id: 'california',
    region: 'California & US West Coast',
    title: 'Atmospheric Rivers & King Tides Surge',
    severity: 'extreme',
    anomaly: '+6 to +12 inches Sea Level Rise',
    summary:
      'Poleward coastal Kelvin waves elevate sea heights by up to a foot along San Francisco, Los Angeles, and San Diego. Combined with a supercharged subtropical jet stream, atmospheric rivers hit at historic tide peaks.',
    mechanisms: [
      'Thermal water column expansion elevates baseline sea surface height',
      'Suppression of coastal upwelling keeps coastal waters 3–5°C warmer than normal',
      'Extended Pacific jet stream steers relentless pineapple-express storm tracks directly into Central and Southern California',
    ],
    keyRisks: [
      'Overtopping of seawalls during King Tides',
      'Catastrophic coastal bluff erosion in Pacific Palisades & Big Sur',
      'Severe riverine flooding and urban infrastructure inundation',
    ],
  },
  {
    id: 'peru',
    region: 'Peru & Ecuador (Niño 1+2)',
    title: 'Fisheries Collapse & Torrential Deluges',
    severity: 'extreme',
    anomaly: '+4.0°C SST Coastal Spike',
    summary:
      'The surfacing Kelvin wave depresses the coastal thermocline by 80 meters, shutting off the cold, nutrient-rich Humboldt Current upwelling and triggering devastating flash flooding.',
    mechanisms: [
      'Deep thermocline prevents nitrate- and phosphate-rich abyssal water from reaching the photic zone',
      'Collapse of primary phytoplankton productivity collapses the anchoveta fishery',
      'Surface moisture convergence drives hyper-convective rainstorms over arid coastal deserts',
    ],
    keyRisks: [
      'Collapse of world’s largest single-species commercial fishery',
      'Destructive landslides (huaycos) throughout coastal valleys',
      'Outbreaks of waterborne and vector diseases (dengue, cholera)',
    ],
  },
  {
    id: 'indonesia-australia',
    region: 'Indonesia, Coral Triangle & Eastern Australia',
    title: 'Severe Drought & Extreme Bushfire Hazard',
    severity: 'high',
    anomaly: 'Ascending Walker Cell Displaced East',
    summary:
      'As convective rainfall shifts 6,000 miles east into the Central Pacific, the Western Pacific experiences strong atmospheric subsidence, desiccating rainforests and peatlands.',
    mechanisms: [
      'Reversal of Pacific Walker circulation shifts heavy precipitation to the Date Line',
      'Subsiding dry air locks in prolonged agricultural drought across Queensland, NSW, and Borneo',
      'Elevated fire danger indices rivaling the 1997 and 2019 "Black Summer" pre-conditions',
    ],
    keyRisks: [
      'Extensive peatland fires in Sumatra and Kalimantan causing toxic transboundary haze',
      'Severe crop yield deficits in palm oil, coffee, and wheat',
      'Critical urban and reservoir water shortages',
    ],
  },
  {
    id: 'coral-reefs',
    region: 'Galápagos & Eastern Tropical Pacific Reefs',
    title: 'Catastrophic Coral Bleaching',
    severity: 'extreme',
    anomaly: 'Degree Heating Weeks (DHW) > 16°C-weeks',
    summary:
      'Persistent subsurface and surface heat exposes endemic cold-water adapted corals to unprecedented thermal stress, triggering complete bleaching and mortality.',
    mechanisms: [
      'Thermal stress index exceeds mortality threshold for Pocillopora and Porites corals',
      'Loss of zooxanthellae symbionts across shallow marine ecosystems',
      'Starvation of marine iguanas, Galápagos penguins, and flightless cormorants due to green algae collapse',
    ],
    keyRisks: [
      'Widespread mortality across Galápagos Marine Reserve',
      'Irreversible loss of endemic cold-water corals',
      'Cascade collapse across apex predator populations',
    ],
  },
];

export const GLOSSARY_TERMS = [
  {
    term: 'Equatorial Kelvin Wave',
    definition:
      'A massive, non-dispersive internal ocean gravity wave trapped along the equator by the Coriolis beta effect ($f = \\beta y$). It can only propagate eastward at approximately 2.5 m/s, transporting enormous pulses of thermal energy across thousands of miles.',
  },
  {
    term: 'Thermocline',
    definition:
      'The sharp transition boundary layer between warm, mixed surface ocean waters (epipelagic) and the freezing deep abyssal ocean. Typically represented by the 20°C isotherm in tropical oceanography.',
  },
  {
    term: 'Downwelling',
    definition:
      'The process where surface waters converge and sink downwards into the deep ocean. In a downwelling Kelvin wave, this pushes the thermocline down by dozens of meters, trapping extreme heat beneath the surface.',
  },
  {
    term: 'Westerly Wind Burst (WWB)',
    definition:
      'Sudden episodes of strong anomalous winds blowing from west to east across the western tropical Pacific, lasting from one to three weeks. These wind bursts overcome the normal easterly trade winds and launch the Kelvin wave.',
  },
  {
    term: 'Bjerknes Feedback',
    definition:
      'A positive coupled ocean-atmosphere feedback loop: anomalous westerlies weaken the zonal SST gradient, which further weakens easterly trade winds, which amplifies warming, locking in an El Niño event.',
  },
  {
    term: 'TAO / TRITON Moored Array',
    definition:
      'A network of approximately 70 moored deep-ocean buoys anchored across the equatorial Pacific from 137°E to 95°W, providing real-time surface meteorological and subsurface ocean temperature data down to 500 meters.',
  },
];
