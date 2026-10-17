import jsPDF from 'jspdf';
import { ViewMode, BuoyStation, CoastalStation } from '../types/kelvin';
import { BUOY_STATIONS, STAGES_DATA, TELECONNECTIONS } from '../data/scientificData';
import { COASTAL_STATIONS } from '../data/coastalTrajectoryData';

export interface PdfReportOptions {
  currentProgress: number;
  currentViewMode: ViewMode;
  includeBuoyData: boolean;
  includeCoastalTrajectory: boolean;
  includeTeleconnections: boolean;
  analystName?: string;
  organization?: string;
  customNotes?: string;
}

export function generateKelvinPdfReport(options: PdfReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm
  let y = 14;

  const primaryDark = [2, 6, 23]; // #020617 (slate-950)
  const navyAccent = [15, 23, 42]; // #0f172a (slate-900)
  const cyanColor = [6, 182, 212]; // #06b6d4 (cyan-500)
  const blueColor = [37, 99, 235]; // #2563eb (blue-600)
  const amberColor = [245, 158, 11]; // #f59e0b
  const redColor = [239, 68, 68]; // #ef4444
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];

  // Helper: check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 16;
      drawPageBorder();
    }
  };

  // Helper: draw professional header & footer bar
  const drawPageBorder = () => {
    // Top subtle bar
    doc.setFillColor(6, 182, 212);
    doc.rect(margin, 8, contentWidth, 1.2, 'F');

    // Bottom running footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const dateStr = new Date().toISOString().split('T')[0];
    doc.text(
      `Tech & Tonic (techandtonic.tech) · NOAA PMEL / CPC ENSO Diagnostic Bulletin · Generated ${dateStr}`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  };

  drawPageBorder();

  // ==================== COVER / HEADER BANNER ====================
  // Dark header card
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');

  // Cyan left accent line
  doc.setFillColor(6, 182, 212);
  doc.roundedRect(margin, y, 3, 34, 1.5, 1.5, 'F');

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 182, 212);
  doc.text('TECH & TONIC · SCIENTIFIC SUMMARY REPORT · techandtonic.tech', margin + 7, y + 7);

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Planetary Equatorial Kelvin Wave Dynamics', margin + 7, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(
    'Real-Time Oceanographic Telemetry, Downwelling Wavefront & Coastal Hazard Forecast (2026/27)',
    margin + 7,
    y + 22
  );

  // Metadata badges inside header
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Published by Tech & Tonic (techandtonic.tech) · Issue Date: ${reportDate}`, margin + 7, y + 29);

  y += 40;

  // ==================== EXECUTIVE SUMMARY & SCENARIO STATE ====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE STATE & HYDRODYNAMIC TELEMETRY', margin, y);
  y += 5;

  // Compute scenario parameters
  const progPct = Math.round(Math.max(0, Math.min(100, (options.currentProgress + 0.3) / 1.6 * 100)));
  const progressLon =
    options.currentProgress < 0.2
      ? '165°E – 175°E (Western Warm Pool)'
      : options.currentProgress < 0.5
      ? '170°W – 150°W (Date Line Niño 4)'
      : options.currentProgress < 0.75
      ? '140°W – 120°W (Central Basin Niño 3.4)'
      : '95°W – 80°W (Eastern Boundary / Coastal Ecuador)';

  // Key metric tiles (3 columns)
  const tileWidth = (contentWidth - 6) / 3;
  const tileHeight = 18;

  const metrics = [
    { label: 'Wave Core Subsurface Anomaly', value: '+10.4°C', sub: 'Depth: 140m @ 140°W' },
    { label: 'Max Thermocline Downwelling', value: '+95 m', sub: '20°C Isotherm Depressed' },
    { label: 'Sea Surface Height Anomaly', value: '+24.8 cm', sub: '+9.8 in Altimetry Peak' },
    { label: 'Theoretical Phase Speed', value: '2.7 m/s', sub: '~233 km/day (Internal Gravity)' },
    { label: 'Equatorial Rossby Radius', value: '245 km', sub: 'Boundary Trapping Width' },
    { label: 'Oceanic Niño Index (ONI)', value: '+2.5°C', sub: 'Super El Niño Threshold (>2.0)' },
  ];

  metrics.forEach((m, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const tx = margin + col * (tileWidth + 3);
    const ty = y + row * (tileHeight + 3);

    doc.setFillColor(248, 250, 252); // light slate background
    doc.setDrawColor(226, 232, 240); // border
    doc.roundedRect(tx, ty, tileWidth, tileHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, tx + 3.5, ty + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, tx + 3.5, ty + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(m.sub, tx + 3.5, ty + 15.5);
  });

  y += 2 * (tileHeight + 3) + 5;

  // View Mode Snapshot note
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Active Simulation Mode: ${options.currentViewMode.toUpperCase()}`, margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Simulated Wavefront Location: ${progressLon} · Overall Basin Traversal: ${progPct}% complete`,
    margin + 4,
    y + 9
  );
  y += 18;

  // Optional Analyst Metadata
  if (options.analystName || options.organization || options.customNotes) {
    checkPageBreak(18);
    doc.setFillColor(240, 253, 250); // mint/cyan light
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 118, 110);
    const authorStr = [
      options.analystName ? `Analyst: ${options.analystName}` : '',
      options.organization ? `Organization: ${options.organization}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    doc.text(authorStr || 'Operational Briefing Notes', margin + 4, y + 4.5);

    if (options.customNotes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const splitNotes = doc.splitTextToSize(`Notes: ${options.customNotes}`, contentWidth - 8);
      doc.text(splitNotes, margin + 4, y + 9);
    }
    y += 18;
  }

  // ==================== SECTION 2: TAO/TRITON BUOY ARRAY TELEMETRY ====================
  if (options.includeBuoyData) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. EQUATORIAL TAO/TRITON MOORING ARRAY TELEMETRY', margin, y);
    y += 5;

    // Table Header
    const colWidths = [38, 24, 26, 34, 34, 26]; // Total = 182
    const headers = ['Mooring Station', 'Longitude', 'SST / Anom.', 'Thermocline Depth', 'Heat Content (300m)', 'Zonal Wind'];

    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    let curX = margin;
    headers.forEach((h, i) => {
      doc.text(h, curX + 2, y + 4.8);
      curX += colWidths[i];
    });
    y += 7;

    // Table Rows
    BUOY_STATIONS.forEach((buoy, rIdx) => {
      checkPageBreak(7);
      const isAlt = rIdx % 2 === 1;
      doc.setFillColor(isAlt ? 248 : 255, isAlt ? 250 : 255, isAlt ? 252 : 255);
      doc.rect(margin, y, contentWidth, 6.5, 'F');

      // Thin bottom border
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      let xPos = margin;
      // Col 1: Name
      doc.setFont('helvetica', 'bold');
      doc.text(buoy.name.split(' (')[0], xPos + 2, y + 4.5);
      xPos += colWidths[0];

      // Col 2: Longitude
      doc.setFont('helvetica', 'normal');
      doc.text(buoy.longitude, xPos + 2, y + 4.5);
      xPos += colWidths[1];

      // Col 3: SST
      const sstStr = `${buoy.sst}°C (${buoy.sstAnomaly > 0 ? '+' : ''}${buoy.sstAnomaly}°C)`;
      doc.text(sstStr, xPos + 2, y + 4.5);
      xPos += colWidths[2];

      // Col 4: Thermocline
      const thStr = `${buoy.thermoclineDepth}m (Norm: ${buoy.normalThermoclineDepth}m)`;
      doc.text(thStr, xPos + 2, y + 4.5);
      xPos += colWidths[3];

      // Col 5: Heat Content
      doc.text(`+${buoy.heatContentAnomaly}°C Anomaly`, xPos + 2, y + 4.5);
      xPos += colWidths[4];

      // Col 6: Zonal Wind
      doc.text(`${buoy.zonalWind > 0 ? '+' : ''}${buoy.zonalWind} m/s (W)`, xPos + 2, y + 4.5);

      y += 6.5;
    });

    y += 6;
  }

  // ==================== SECTION 3: NORTH AMERICAN COASTAL TRAJECTORY ====================
  if (options.includeCoastalTrajectory) {
    checkPageBreak(65);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. NORTH AMERICAN COASTAL KELVIN WAVE (CKW) & KING TIDES RISK', margin, y);
    y += 5;

    // Table Header
    const colW = [42, 22, 26, 26, 32, 34]; // Total 182
    const ckwHeaders = ['Coastal Station', 'Latitude', 'Arrival Date', 'Surge (SSHA)', 'SST Anomaly', 'King Tide Risk'];

    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    let curX = margin;
    ckwHeaders.forEach((h, i) => {
      doc.text(h, curX + 2, y + 4.8);
      curX += colW[i];
    });
    y += 7;

    COASTAL_STATIONS.slice(2, 9).forEach((station, sIdx) => {
      checkPageBreak(6.5);
      const isAlt = sIdx % 2 === 1;
      doc.setFillColor(isAlt ? 248 : 255, isAlt ? 250 : 255, isAlt ? 252 : 255);
      doc.rect(margin, y, contentWidth, 6.5, 'F');

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

      let xPos = margin;
      // Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(30, 41, 59);
      doc.text(station.name.split(' (')[0], xPos + 2, y + 4.5);
      xPos += colW[0];

      // Latitude
      doc.setFont('helvetica', 'normal');
      doc.text(`${station.latitude}°N`, xPos + 2, y + 4.5);
      xPos += colW[1];

      // Arrival Date
      doc.text(station.estArrivalDate, xPos + 2, y + 4.5);
      xPos += colW[2];

      // Surge
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 182, 212);
      doc.text(`+${station.seaLevelSurgeInches}" (${station.seaLevelSurgeCm}cm)`, xPos + 2, y + 4.5);
      xPos += colW[3];

      // SST
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(239, 68, 68);
      doc.text(`+${station.sstAnomalyC}°C`, xPos + 2, y + 4.5);
      xPos += colW[4];

      // Risk
      doc.setFont('helvetica', 'bold');
      if (station.kingTideRisk === 'Extreme') {
        doc.setTextColor(220, 38, 38);
      } else if (station.kingTideRisk === 'Severe') {
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setTextColor(37, 99, 235);
      }
      doc.text(`${station.kingTideRisk} Risk`, xPos + 2, y + 4.5);

      y += 6.5;
    });

    y += 6;
  }

  // ==================== SECTION 4: CLIMATE TELECONNECTIONS ====================
  if (options.includeTeleconnections) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. GLOBAL CLIMATE TELECONNECTIONS & RISK ASSESSMENT', margin, y);
    y += 5;

    TELECONNECTIONS.forEach((tc) => {
      checkPageBreak(14);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 12.5, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`${tc.region}: ${tc.title}`, margin + 3, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(220, 38, 38);
      doc.text(`Severity: ${tc.severity.toUpperCase()} · ${tc.anomaly}`, pageWidth - margin - 3, y + 4.5, {
        align: 'right',
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const subSummary = doc.splitTextToSize(tc.summary, contentWidth - 6);
      doc.text(subSummary[0] ?? '', margin + 3, y + 9);

      y += 14.5;
    });

    y += 4;
  }

  // ==================== REPORT FOOTER & CITATIONS ====================
  checkPageBreak(18);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Authoritative Oceanographic Grounding & Data Sources:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    '1. NOAA PMEL Tropical Atmosphere Ocean (TAO) / TRITON Moored Buoy Network\n2. Copernicus Sentinel-6 Michael Freilich Radar Altimetry & Jason-3 Sea Surface Height\n3. NOAA CO-OPS National Water Level Observation Network (NWLON) & Argo Profiling Floats',
    margin + 4,
    y + 8.5
  );

  // Trigger download
  const sanitizedDate = new Date().toISOString().split('T')[0];
  const filename = `NOAA_Kelvin_Wave_Scientific_Report_${sanitizedDate}.pdf`;
  doc.save(filename);
}
