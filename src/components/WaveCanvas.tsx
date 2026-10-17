import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Crosshair, Eye, Sparkles, Navigation, Layers, BookmarkPlus, MapPin, Trash2, X, Plus, Flame, Thermometer } from 'lucide-react';
import { BUOY_STATIONS } from '../data/scientificData';
import { BuoyStation } from '../types/kelvin';

export interface CanvasAnnotation {
  id: string;
  xPercent: number;
  yPercent: number;
  depthM: number;
  tempAnomalyC: number;
  longitudeStr: string;
  isThermocline: boolean;
  timestamp: string;
  label?: string;
}

interface WaveCanvasProps {
  progress: number;
  setProgress: (val: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (val: number) => void;
  onSelectBuoy: (buoy: BuoyStation) => void;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
}

export const WaveCanvas: React.FC<WaveCanvasProps> = ({
  progress,
  setProgress,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onSelectBuoy,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    depthM: number;
    longitudeStr: string;
    tempAnomalyC: number;
    layer: string;
  } | null>(null);

  // Annotate mode & markers state
  const [isAnnotating, setIsAnnotating] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<CanvasAnnotation[]>([]);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

  const [showParticles, setShowParticles] = useState(true);
  const [showBuoys, setShowBuoys] = useState(true);
  const [showWindArrows, setShowWindArrows] = useState(true);
  const [showIsotherms, setShowIsotherms] = useState(true);
  const [showThermalHeatmap, setShowThermalHeatmap] = useState(true);

  // Particles for advection flow
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles
  useEffect(() => {
    const pts: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      pts.push({
        x: Math.random() * 1200,
        y: 60 + Math.random() * 200,
        speed: 0.4 + Math.random() * 0.8,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
      });
    }
    particlesRef.current = pts;
  }, []);

  // Animation frame loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isPlaying) {
        setProgress((prev) => {
          const next = prev + 0.0016 * playbackSpeed;
          return next > 1.3 ? -0.3 : next;
        });
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, setProgress]);

  // Main canvas render
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Deep Ocean Background
    const deepGradient = ctx.createLinearGradient(0, 50, 0, height);
    deepGradient.addColorStop(0, '#0a192f');
    deepGradient.addColorStop(0.3, '#071527');
    deepGradient.addColorStop(1, '#020617');
    ctx.fillStyle = deepGradient;
    ctx.fillRect(0, 0, width, height);

    // Depth markers & horizontal gridlines
    const depths = [
      { y: 50, label: '0m (Surface)', temp: '29°C' },
      { y: 130, label: '100m', temp: '22°C' },
      { y: 220, label: '200m', temp: '16°C' },
      { y: 310, label: '300m', temp: '11°C' },
      { y: 400, label: '400m (Abyssal)', temp: '8°C' },
    ];

    ctx.font = '11px Inter, system-ui, sans-serif';
    depths.forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(0, d.y);
      ctx.lineTo(width, d.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (d.y < height - 25) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.textAlign = 'left';
        ctx.fillText(d.label, 14, d.y - 6);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText(`~${d.temp}`, width - 14, d.y - 6);
      }
    });

    // Wave Physics calculation
    const waveX = progress * width;
    const waveWidth = Math.max(220, width * 0.28);
    const waveAmplitude = 115; // Vertical depression depth of thermocline

    const thermoclineWestY = 195;
    const thermoclineEastY = 95;

    // Build the Thermocline points
    const thermoclinePoints: { x: number; y: number; bulge: number }[] = [];
    const thermoclinePath = new Path2D();
    thermoclinePath.moveTo(0, 50);

    for (let x = 0; x <= width; x += 4) {
      const baseY = thermoclineWestY - (x / width) * (thermoclineWestY - thermoclineEastY);
      const dist = Math.abs(x - waveX);
      let bulge = 0;
      if (dist < waveWidth) {
        const norm = dist / waveWidth;
        // Cosine bell envelope
        bulge = ((Math.cos(norm * Math.PI) + 1) / 2) * waveAmplitude;
      }
      const actualY = baseY + bulge;
      thermoclinePoints.push({ x, y: actualY, bulge });
      thermoclinePath.lineTo(x, actualY);
    }
    thermoclinePath.lineTo(width, 50);
    thermoclinePath.closePath();

    // 2. Mixed Warm Surface Layer
    const upperGradient = ctx.createLinearGradient(0, 50, 0, 320);
    upperGradient.addColorStop(0, 'rgba(2, 132, 199, 0.95)'); // sky-600
    upperGradient.addColorStop(0.5, 'rgba(3, 105, 161, 0.88)'); // sky-700
    upperGradient.addColorStop(1, 'rgba(14, 116, 144, 0.82)'); // cyan-700
    ctx.fillStyle = upperGradient;
    ctx.fill(thermoclinePath);

    // 3. Draw the Subsurface Downwelling Kelvin Wave Heat Core & Dynamic Thermal Heatmap
    if (waveX > -waveWidth && waveX < width + waveWidth) {
      const coreBaseY = thermoclineWestY - (waveX / width) * (thermoclineWestY - thermoclineEastY);
      const coreY = coreBaseY + waveAmplitude * 0.65;

      ctx.save();

      if (showThermalHeatmap) {
        // ================= DYNAMIC THERMAL INTENSITY HEATMAP OVERLAY =================
        // A. Multi-Scale Continuous Thermal Anomaly Field
        const heatField = ctx.createRadialGradient(waveX, coreY, 8, waveX, coreY, waveWidth * 1.35);
        heatField.addColorStop(0, 'rgba(255, 255, 255, 0.98)'); // Super-heated white-hot core
        heatField.addColorStop(0.12, 'rgba(255, 0, 110, 0.95)'); // +11.8°C Extreme anomaly (magenta/crimson)
        heatField.addColorStop(0.28, 'rgba(239, 68, 68, 0.90)'); // +9.5°C Severe downwelling (fiery red)
        heatField.addColorStop(0.48, 'rgba(249, 115, 22, 0.78)'); // +7.0°C High heat anomaly (vibrant orange)
        heatField.addColorStop(0.68, 'rgba(234, 179, 8, 0.52)'); // +4.5°C Moderate warming (golden amber)
        heatField.addColorStop(0.85, 'rgba(16, 185, 129, 0.25)'); // +2.0°C Outer ambient warming (lime/emerald)
        heatField.addColorStop(1, 'rgba(6, 182, 212, 0)'); // Dissipation into surrounding ocean

        ctx.fillStyle = heatField;
        ctx.beginPath();
        ctx.ellipse(waveX, coreY, waveWidth * 1.25, waveAmplitude * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // B. Forward Thermal Advection Plume (Heat transported eastward)
        const plumeGrad = ctx.createRadialGradient(waveX + 30, coreY - 10, 10, waveX + 60, coreY - 5, waveWidth * 0.9);
        plumeGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
        plumeGrad.addColorStop(0.6, 'rgba(234, 179, 8, 0.2)');
        plumeGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = plumeGrad;
        ctx.beginPath();
        ctx.ellipse(waveX + 40, coreY - 10, waveWidth * 0.95, waveAmplitude * 0.75, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // C. Dynamic Thermal Anomaly Contour Shells (Isopleths: +10°C, +8°C, +6°C, +4°C, +2°C)
        const isopleths = [
          { rx: waveWidth * 0.28, ry: waveAmplitude * 0.28, color: 'rgba(255, 255, 255, 0.85)', label: '+10.4°C Core', dash: [3, 2], lw: 1.5 },
          { rx: waveWidth * 0.52, ry: waveAmplitude * 0.52, color: 'rgba(239, 68, 68, 0.75)', label: '+8.0°C', dash: [4, 3], lw: 1.2 },
          { rx: waveWidth * 0.78, ry: waveAmplitude * 0.78, color: 'rgba(249, 115, 22, 0.65)', label: '+6.0°C', dash: [5, 4], lw: 1.1 },
          { rx: waveWidth * 1.05, ry: waveAmplitude * 0.98, color: 'rgba(234, 179, 8, 0.5)', label: '+4.0°C', dash: [6, 4], lw: 1.0 },
          { rx: waveWidth * 1.28, ry: waveAmplitude * 1.18, color: 'rgba(6, 182, 212, 0.4)', label: '+2.0°C Anom.', dash: [8, 5], lw: 0.9 },
        ];

        isopleths.forEach((iso) => {
          ctx.beginPath();
          ctx.ellipse(waveX, coreY, iso.rx, iso.ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = iso.color;
          ctx.lineWidth = iso.lw;
          ctx.setLineDash(iso.dash);
          ctx.stroke();
          ctx.setLineDash([]);

          // Labeled isopleth tag on the right flank
          if (waveX + iso.rx + 25 < width - 20) {
            ctx.font = 'bold 8.5px JetBrains Mono, monospace';
            ctx.fillStyle = iso.color;
            ctx.textAlign = 'left';
            ctx.fillText(iso.label, waveX + iso.rx + 4, coreY + 3);
          }
        });

        // D. Vertical Downwelling Velocity Vectors (Fluid moving downward)
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.65)';
        ctx.fillStyle = 'rgba(254, 215, 170, 0.65)';
        ctx.lineWidth = 1.4;
        [-waveWidth * 0.35, 0, waveWidth * 0.35].forEach((offset) => {
          const vx = waveX + offset;
          const vyTop = coreY - waveAmplitude * 0.45;
          const vyBottom = coreY + waveAmplitude * 0.25;

          ctx.beginPath();
          ctx.moveTo(vx, vyTop);
          ctx.lineTo(vx, vyBottom);
          ctx.stroke();

          // Arrowhead pointing down
          ctx.beginPath();
          ctx.moveTo(vx - 3.5, vyBottom - 5);
          ctx.lineTo(vx, vyBottom);
          ctx.lineTo(vx + 3.5, vyBottom - 5);
          ctx.fill();
        });

        // E. Central White-Hot Core Nucleus
        const centerNucleus = ctx.createRadialGradient(waveX, coreY, 0, waveX, coreY, 28);
        centerNucleus.addColorStop(0, '#ffffff');
        centerNucleus.addColorStop(0.35, 'rgba(254, 202, 202, 0.95)');
        centerNucleus.addColorStop(0.7, 'rgba(239, 68, 68, 0.9)');
        centerNucleus.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = centerNucleus;
        ctx.beginPath();
        ctx.arc(waveX, coreY, 26, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard Classic Core Rendering (when heatmap overlay is off)
        const coreGlow = ctx.createRadialGradient(waveX, coreY, 15, waveX, coreY, waveWidth * 0.95);
        coreGlow.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
        coreGlow.addColorStop(0.25, 'rgba(249, 115, 22, 0.85)');
        coreGlow.addColorStop(0.55, 'rgba(234, 179, 8, 0.45)');
        coreGlow.addColorStop(0.85, 'rgba(2, 132, 199, 0.15)');
        coreGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.ellipse(waveX, coreY, waveWidth * 0.85, waveAmplitude * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        const innerCore = ctx.createRadialGradient(waveX, coreY, 0, waveX, coreY, 40);
        innerCore.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        innerCore.addColorStop(0.4, 'rgba(254, 202, 202, 0.8)');
        innerCore.addColorStop(0.8, 'rgba(239, 68, 68, 0.8)');
        innerCore.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = innerCore;
        ctx.beginPath();
        ctx.arc(waveX, coreY, 35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating Core Telemetry Badge
      if (waveX > 75 && waveX < width - 75) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = showThermalHeatmap ? '#ef4444' : 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 1.5;
        const tagX = waveX;
        const tagY = coreY + 48;
        const text = showThermalHeatmap ? '🔥 THERMAL CORE: +10.4°C ANOMALY' : 'KELVIN CORE: +10.4°C ANOMALY';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        const txtWidth = ctx.measureText(text).width;

        ctx.beginPath();
        ctx.roundRect(tagX - txtWidth / 2 - 10, tagY - 11, txtWidth + 20, 22, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fecaca';
        ctx.textAlign = 'center';
        ctx.fillText(text, tagX, tagY + 4);
      }

      ctx.restore();
    }

    // 4. Streamline Particles (Eastward Advective Flow)
    if (showParticles) {
      ctx.save();
      particlesRef.current.forEach((p) => {
        // Move particle
        const distToWave = Math.abs(p.x - waveX);
        const waveBoost = distToWave < waveWidth ? 2.5 : 0.8;
        p.x += p.speed * waveBoost * playbackSpeed;
        if (p.x > width) p.x = 0;

        // Calculate local thermocline depth
        const localNormX = p.x / width;
        const localBaseY = thermoclineWestY - localNormX * (thermoclineWestY - thermoclineEastY);
        const localDist = Math.abs(p.x - waveX);
        const localBulge =
          localDist < waveWidth ? ((Math.cos((localDist / waveWidth) * Math.PI) + 1) / 2) * waveAmplitude : 0;
        const thermY = localBaseY + localBulge;

        // Keep particle within mixed layer or slightly into thermocline
        if (p.y > thermY + 20) {
          p.y = 55 + Math.random() * 80;
        }

        ctx.fillStyle =
          distToWave < waveWidth ? `rgba(254, 215, 170, ${p.alpha * 0.9})` : `rgba(186, 230, 253, ${p.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Eastward flow streak
        ctx.strokeStyle =
          distToWave < waveWidth ? `rgba(251, 146, 60, ${p.alpha * 0.6})` : `rgba(56, 189, 248, ${p.alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.speed * 8, p.y);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 5. Isotherms (14°C, 20°C, 28°C)
    if (showIsotherms) {
      // 20°C Isotherm (The Thermocline line)
      ctx.beginPath();
      ctx.moveTo(thermoclinePoints[0].x, thermoclinePoints[0].y);
      for (let i = 1; i < thermoclinePoints.length; i++) {
        ctx.lineTo(thermoclinePoints[i].x, thermoclinePoints[i].y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // 14°C Isotherm (Sub-thermocline boundary)
      ctx.beginPath();
      for (let i = 0; i < thermoclinePoints.length; i++) {
        const pt = thermoclinePoints[i];
        const y14 = pt.y + 60 + pt.bulge * 0.35;
        if (i === 0) ctx.moveTo(pt.x, y14);
        else ctx.lineTo(pt.x, y14);
      }
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 28°C Isotherm (Warm pool boundary near surface)
      ctx.beginPath();
      for (let i = 0; i < thermoclinePoints.length; i++) {
        const pt = thermoclinePoints[i];
        const y28 = 50 + (pt.y - 50) * 0.45;
        if (i === 0) ctx.moveTo(pt.x, y28);
        else ctx.lineTo(pt.x, y28);
      }
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 6. Atmospheric Layer (Top 0-50px)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, width, 50);

    // Ocean surface line (sea surface height anomaly bulge)
    ctx.beginPath();
    ctx.moveTo(0, 50);
    for (let x = 0; x <= width; x += 4) {
      const dist = Math.abs(x - waveX);
      let sshaBulge = 0;
      if (dist < waveWidth) {
        // Kelvin wave elevated sea level (+20 to +30cm mapped to canvas pixels)
        const norm = dist / waveWidth;
        sshaBulge = ((Math.cos(norm * Math.PI) + 1) / 2) * 8; // subtle 8px surface elevation
      }
      ctx.lineTo(x, 50 - sshaBulge);
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 7. Westerly Wind Burst Arrows & Trade Winds
    if (showWindArrows) {
      const windStartX = Math.max(20, waveX - waveWidth * 1.4);
      const windEndX = waveX - waveWidth * 0.15;

      if (windEndX > windStartX + 45 && windStartX < width - 40) {
        // Arrow for Westerly Wind Burst
        drawWindArrow(ctx, windStartX, 25, windEndX, 25, '#f59e0b', 'WESTERLY WIND BURST (WWB)');
      }

      // Normal Easterly Trade Winds (ahead of wave)
      const tradeStartX = Math.min(width - 30, waveX + waveWidth * 1.6);
      const tradeEndX = Math.max(waveX + waveWidth * 0.6, width * 0.5);
      if (tradeStartX > tradeEndX + 50 && tradeStartX > 100) {
        drawWindArrow(ctx, tradeStartX, 25, tradeEndX, 25, '#94a3b8', 'Weakened Easterly Trades');
      }
    }

    // 8. TAO/TRITON Buoy Stations Markers
    if (showBuoys) {
      BUOY_STATIONS.forEach((buoy) => {
        // Map longitude to x position
        // 130°E (x=0) to 80°W (x=width)
        // Total degrees span: (180 - 130) + (180 - 80) = 50 + 100 = 150 degrees
        let degFromWest = 0;
        if (buoy.lonDegrees >= 130 && buoy.lonDegrees <= 180) {
          degFromWest = buoy.lonDegrees - 130;
        } else if (buoy.lonDegrees < 0) {
          // e.g. -140W => 180 - 140 = 40 deg east of dateline => 50 + (180 - 140) = 90
          degFromWest = 50 + (180 - Math.abs(buoy.lonDegrees));
        }
        const buoyX = (degFromWest / 150) * width;

        if (buoyX >= 25 && buoyX <= width - 25) {
          // Buoy surface float
          ctx.save();
          ctx.fillStyle = buoy.status === 'critical' ? '#ef4444' : buoy.status === 'warning' ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(buoyX, 48, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Mooring wire down to bottom
          ctx.beginPath();
          ctx.moveTo(buoyX, 54);
          ctx.lineTo(buoyX, height - 40);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Buoy ID label
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillStyle = '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.fillText(buoy.longitude, buoyX, 38);

          ctx.restore();
        }
      });
    }

    // 9. Geographical Bottom Axis (Longitude & Continents)
    ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
    ctx.fillRect(0, height - 36, width, 36);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 36);
    ctx.lineTo(width, height - 36);
    ctx.stroke();

    const longitudes = [
      { ratio: 0.05, label: '140°E (Indonesia)', align: 'left' as CanvasTextAlign },
      { ratio: 0.22, label: '165°E (Warm Pool)', align: 'center' as CanvasTextAlign },
      { ratio: 0.38, label: '180° (Date Line)', align: 'center' as CanvasTextAlign },
      { ratio: 0.58, label: '140°W (Niño 3.4)', align: 'center' as CanvasTextAlign },
      { ratio: 0.78, label: '110°W (Niño 3)', align: 'center' as CanvasTextAlign },
      { ratio: 0.95, label: '80°W (Americas / Peru)', align: 'right' as CanvasTextAlign },
    ];

    ctx.font = 'bold 11px Inter, sans-serif';
    longitudes.forEach((item) => {
      const lx = item.ratio * width;
      ctx.textAlign = item.align;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(item.label, lx, height - 14);

      // Tick mark
      ctx.beginPath();
      ctx.moveTo(lx, height - 36);
      ctx.lineTo(lx, height - 30);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
    });
  }, [progress, playbackSpeed, showParticles, showBuoys, showWindArrows, showIsotherms, showThermalHeatmap]);

  // Helper for drawing wind arrows
  const drawWindArrow = (
    ctx: CanvasRenderingContext2D,
    fromx: number,
    fromy: number,
    tox: number,
    toy: number,
    color: string,
    label: string
  ) => {
    const headlen = 10;
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, (fromx + tox) / 2, fromy - 8);
    ctx.restore();
  };

  // Resize canvas handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const cssWidth = rect.width;
      const cssHeight = Math.min(520, Math.max(380, window.innerHeight * 0.52));

      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Re-render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Mouse Move for Interactive Inspection Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (y < 0 || y > rect.height || x < 0 || x > rect.width) {
      setHoverInfo(null);
      return;
    }

    // Calculate approximate depth in meters (y: 50 -> 0m, y: 400 -> 400m)
    const depthM = Math.max(0, Math.round(((y - 50) / (rect.height - 86)) * 400));

    // Calculate longitude string
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    // 130°E to 80°W (150 degrees span)
    const degFromWest = ratio * 150;
    let lonStr = '';
    if (degFromWest <= 50) {
      lonStr = `${Math.round(130 + degFromWest)}°E`;
    } else {
      lonStr = `${Math.round(180 - (degFromWest - 50))}°W`;
    }

    // Thermocline depth at this x
    const waveX = progress * rect.width;
    const waveWidth = Math.max(220, rect.width * 0.28);
    const waveAmplitude = 115;
    const thermWestY = 195;
    const thermEastY = 95;
    const baseY = thermWestY - (x / rect.width) * (thermWestY - thermEastY);
    const dist = Math.abs(x - waveX);
    const bulge = dist < waveWidth ? ((Math.cos((dist / waveWidth) * Math.PI) + 1) / 2) * waveAmplitude : 0;
    const localThermY = baseY + bulge;

    let layer = 'Mixed Surface Layer';
    let anomaly = 0.4;
    if (y < 50) {
      layer = 'Atmosphere (Surface Boundary)';
      anomaly = 0.0;
    } else if (y > localThermY + 40) {
      layer = 'Deep Ocean (Abyssal Cold)';
      anomaly = 0.1;
    } else {
      // In the mixed layer or thermocline core
      if (dist < waveWidth && Math.abs(y - (baseY + waveAmplitude * 0.65)) < 60) {
        layer = 'Kelvin Wave Thermal Core';
        anomaly = Math.round((10.4 * (1 - dist / waveWidth) + Math.random() * 0.1) * 10) / 10;
      } else {
        layer = 'Epipelagic Thermocline Zone';
        anomaly = Math.round((2.5 * (1 - x / rect.width) + 0.5) * 10) / 10;
      }
    }

    setHoverInfo({
      x,
      y,
      depthM,
      longitudeStr: lonStr,
      tempAnomalyC: anomaly,
      layer,
    });
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isAnnotating) {
      // Calculate longitude string
      const normX = Math.max(0, Math.min(1, x / rect.width));
      const degFromWest = normX * 150;
      let lonStr = '140°E';
      if (degFromWest <= 50) {
        const degE = 130 + degFromWest;
        lonStr = `${degE.toFixed(1)}°E`;
      } else {
        const degW = 180 - (degFromWest - 50);
        lonStr = `${degW.toFixed(1)}°W`;
      }

      // Calculate thermocline actualY at this x
      const waveX = progress * rect.width;
      const waveWidth = Math.max(220, rect.width * 0.28);
      const waveAmplitude = 115;
      const thermoclineWestY = 195;
      const thermoclineEastY = 95;
      const baseY = thermoclineWestY - normX * (thermoclineWestY - thermoclineEastY);
      const dist = Math.abs(x - waveX);
      const bulge = dist < waveWidth ? ((Math.cos((dist / waveWidth) * Math.PI) + 1) / 2) * waveAmplitude : 0;
      const thermoY = baseY + bulge;

      // Check if click was within 40px of thermocline to snap
      const isNearThermocline = Math.abs(y - thermoY) <= 40;
      const targetY = isNearThermocline ? thermoY : y;
      const depthM = Math.max(0, Math.min(400, Math.round(((targetY - 50) / (rect.height - 50)) * 400)));

      // Calculate thermal anomaly at this coordinate
      let anomaly = 0;
      if (dist < waveWidth) {
        const normDist = dist / waveWidth;
        const coreBaseY = baseY + waveAmplitude * 0.65;
        const distToCore = Math.hypot(x - waveX, targetY - coreBaseY);
        if (distToCore < waveWidth * 0.5) {
          anomaly = +(10.4 * (1 - distToCore / (waveWidth * 0.5))).toFixed(1);
        } else {
          anomaly = +(Math.cos((normDist * Math.PI) / 2) * 6.5).toFixed(1);
        }
      } else {
        anomaly = +(2.5 * (1 - normX)).toFixed(1);
      }
      if (isNearThermocline && anomaly < 1.5) {
        anomaly = +(1.5 + (1 - normX) * 1.5).toFixed(1);
      }

      const newAnnotation: CanvasAnnotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        xPercent: +(normX * 100).toFixed(1),
        yPercent: +((targetY / rect.height) * 100).toFixed(1),
        depthM,
        tempAnomalyC: anomaly,
        longitudeStr: lonStr,
        isThermocline: isNearThermocline,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        label: isNearThermocline ? 'Thermocline (20°C Isotherm)' : undefined,
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      return;
    }

    // Find nearest buoy station
    let closestBuoy = BUOY_STATIONS[0];
    let minDistance = Infinity;

    BUOY_STATIONS.forEach((buoy) => {
      let degFromWest = 0;
      if (buoy.lonDegrees >= 130 && buoy.lonDegrees <= 180) {
        degFromWest = buoy.lonDegrees - 130;
      } else if (buoy.lonDegrees < 0) {
        degFromWest = 50 + (180 - Math.abs(buoy.lonDegrees));
      }
      const buoyX = (degFromWest / 150) * rect.width;
      const d = Math.abs(buoyX - x);
      if (d < minDistance) {
        minDistance = d;
        closestBuoy = buoy;
      }
    });

    onSelectBuoy(closestBuoy);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
      {/* Simulation Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40 transition-colors shadow-sm"
            title={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              setProgress(-0.25);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors"
            title="Reset wave to Western Pacific"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Speed Controls */}
          <div className="flex items-center rounded-lg bg-slate-800/80 border border-slate-700 p-0.5">
            {[0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-slate-400">
          {/* Dynamic Thermal Intensity Heatmap Overlay Toggle */}
          <button
            onClick={() => setShowThermalHeatmap(!showThermalHeatmap)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
              showThermalHeatmap
                ? 'bg-gradient-to-r from-red-950/90 via-orange-950/80 to-amber-950/70 border-red-500/70 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.35)] ring-1 ring-red-400/50'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle dynamic thermal intensity anomaly heatmap overlay"
          >
            <Flame className={`w-3.5 h-3.5 ${showThermalHeatmap ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Thermal Heatmap</span>
            <span className={`w-1.5 h-1.5 rounded-full ${showThermalHeatmap ? 'bg-red-400 animate-ping' : 'bg-slate-600'}`}></span>
          </button>

          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] transition-colors ${
              showParticles
                ? 'bg-blue-950/70 border-blue-500/50 text-blue-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-500'
            }`}
            title="Toggle fluid velocity particles"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden md:inline">Particles</span>
          </button>

          <button
            onClick={() => setShowBuoys(!showBuoys)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] transition-colors ${
              showBuoys
                ? 'bg-red-950/70 border-red-500/50 text-red-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-500'
            }`}
            title="Toggle TAO mooring buoys"
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden md:inline">TAO Buoys</span>
          </button>

          <button
            onClick={() => setShowIsotherms(!showIsotherms)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] transition-colors ${
              showIsotherms
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-500'
            }`}
            title="Toggle temperature isotherms"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden md:inline">Isotherms</span>
          </button>

          {/* Annotate Feature Toggle */}
          <button
            onClick={() => {
              const next = !isAnnotating;
              setIsAnnotating(next);
              if (next && annotations.length === 0) {
                // Pre-populate 2 instructive markers on the thermocline
                setAnnotations([
                  {
                    id: 'sample-1',
                    xPercent: 60.0,
                    yPercent: 54.0,
                    depthM: 216,
                    tempAnomalyC: 10.4,
                    longitudeStr: '140.0°W',
                    isThermocline: true,
                    timestamp: 'Active',
                    label: 'Kelvin Wave Downwelling Peak',
                  },
                  {
                    id: 'sample-2',
                    xPercent: 23.3,
                    yPercent: 43.5,
                    depthM: 174,
                    tempAnomalyC: 2.2,
                    longitudeStr: '165.0°E',
                    isThermocline: true,
                    timestamp: 'Active',
                    label: 'Warm Pool Thermocline',
                  },
                ]);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              isAnnotating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Click on the thermocline to place measurement markers"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Annotate</span>
            {annotations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
                {annotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scrub Timeline Bar */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/60 flex items-center gap-3">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Wave Timeline:</span>
        <input
          type="range"
          min={-0.3}
          max={1.3}
          step={0.005}
          value={progress}
          onChange={(e) => setProgress(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-ew-resize focus:outline-none"
        />
        <span className="text-[11px] font-mono text-cyan-400 font-bold whitespace-nowrap min-w-[70px] text-right">
          {progress < 0.1
            ? 'Western Pac.'
            : progress < 0.4
              ? 'Warm Pool'
              : progress < 0.7
                ? 'Central Pac.'
                : progress < 0.95
                  ? 'Eastern Pac.'
                  : 'Americas'}
        </span>
      </div>

      {/* Canvas Element Container */}
      <div ref={containerRef} className="relative w-full h-[380px] md:h-[480px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="block w-full h-full cursor-crosshair select-none"
        />

        {/* Dynamic Thermal Heatmap Status Pill in Top-Right */}
        {showThermalHeatmap && (
          <div className="absolute top-3 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/85 border border-red-500/40 text-[11px] font-mono shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <span className="text-red-300 font-bold">Thermal Heatmap Active</span>
            <span className="text-slate-500">|</span>
            <span className="text-white font-bold">+10.4°C Anomaly</span>
          </div>
        )}

        {/* Annotate Mode Instruction Banner */}
        {isAnnotating && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-950/95 border border-amber-500/70 shadow-2xl text-xs backdrop-blur-md">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Click anywhere on the thermocline (dashed line) to place probe markers
            </span>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAnnotations([
                    {
                      id: 'sample-1',
                      xPercent: 60.0,
                      yPercent: 54.0,
                      depthM: 216,
                      tempAnomalyC: 10.4,
                      longitudeStr: '140.0°W',
                      isThermocline: true,
                      timestamp: 'Active',
                      label: 'Kelvin Wave Downwelling Peak',
                    },
                    {
                      id: 'sample-2',
                      xPercent: 23.3,
                      yPercent: 43.5,
                      depthM: 174,
                      tempAnomalyC: 2.2,
                      longitudeStr: '165.0°E',
                      isThermocline: true,
                      timestamp: 'Active',
                      label: 'Warm Pool Thermocline',
                    },
                    {
                      id: 'sample-3',
                      xPercent: 86.7,
                      yPercent: 26.5,
                      depthM: 106,
                      tempAnomalyC: 7.5,
                      longitudeStr: '100.0°W',
                      isThermocline: true,
                      timestamp: 'Active',
                      label: 'Eastern Basin Thermocline',
                    },
                  ]);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
              >
                Sample Probes
              </button>
              {annotations.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnnotations([]);
                  }}
                  className="text-[11px] text-red-400 hover:text-red-300 font-mono underline cursor-pointer"
                >
                  Clear ({annotations.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rendered Interactive Annotation Markers */}
        {annotations.map((ann) => {
          const isHovered = hoveredAnnotationId === ann.id;
          return (
            <div
              key={ann.id}
              style={{
                left: `${ann.xPercent}%`,
                top: `${ann.yPercent}%`,
              }}
              onMouseEnter={() => setHoveredAnnotationId(ann.id)}
              onMouseLeave={() => setHoveredAnnotationId(null)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
            >
              {/* Outer Pulse Ring */}
              <div className="w-6 h-6 rounded-full bg-amber-500/30 border border-amber-400/80 animate-ping absolute -inset-1 pointer-events-none"></div>

              {/* Pinpoint Core */}
              <div className="relative w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-red-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
              </div>

              {/* Vertical guideline down to depth baseline */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-amber-400/30 border-l border-dashed border-amber-400 pointer-events-none"></div>

              {/* Annotation Card Badge */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-950/95 border ${
                  ann.isThermocline ? 'border-amber-500/80' : 'border-cyan-500/80'
                } rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-[11px] font-mono whitespace-nowrap z-30 transition-all ${
                  isHovered ? 'scale-105 shadow-amber-500/20' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1">
                  <span className="font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {ann.longitudeStr}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnnotations((prev) => prev.filter((a) => a.id !== ann.id));
                    }}
                    className="p-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Remove marker"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Depth:</span>
                    <span className="font-bold text-amber-300">{ann.depthM} meters</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Anomaly:</span>
                    <span className="font-bold text-red-400">+{ann.tempAnomalyC}°C</span>
                  </div>
                  {ann.isThermocline && (
                    <div className="text-[9px] text-cyan-400 font-semibold pt-0.5 border-t border-slate-800/80">
                      20°C Thermocline Boundary
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Hover Inspection Tooltip */}
        {hoverInfo && !isAnnotating && (
          <div
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950/95 border border-cyan-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[210px]"
            style={{
              left: `${hoverInfo.x}px`,
              top: `${Math.max(60, hoverInfo.y)}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                {hoverInfo.longitudeStr}
              </span>
              <span className="text-slate-400 font-mono">Depth: {hoverInfo.depthM}m</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Layer:</span>
                <span className="font-semibold text-white">{hoverInfo.layer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Thermal Anomaly:</span>
                <span
                  className={`font-mono font-bold ${
                    hoverInfo.tempAnomalyC > 5
                      ? 'text-red-400 text-sm'
                      : hoverInfo.tempAnomalyC > 2
                        ? 'text-amber-400'
                        : 'text-cyan-300'
                  }`}
                >
                  +{hoverInfo.tempAnomalyC.toFixed(1)}°C (+{(hoverInfo.tempAnomalyC * 1.8).toFixed(1)}°F)
                </span>
              </div>
            </div>
            <div className="mt-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
              Click anywhere to inspect closest TAO Buoy
            </div>
          </div>
        )}

        {/* Static Legend Overlay & Dynamic Thermal Heatmap Scale */}
        <div className="absolute bottom-11 left-4 right-4 md:right-auto bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-2 backdrop-blur-md shadow-2xl max-w-sm pointer-events-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Scientific Transect Legend
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">2026/27 Live</span>
          </div>

          {/* Dynamic Thermal Anomaly Colormap (Shown when Heatmap Overlay is active) */}
          {showThermalHeatmap && (
            <div className="p-2 rounded-lg bg-slate-950/80 border border-red-500/30 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-red-300 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400" />
                  Thermal Anomaly Heatmap (ΔT)
                </span>
                <span className="text-white font-bold bg-red-950 px-1.5 py-0.2 rounded border border-red-500/50">
                  Peak: +10.4°C
                </span>
              </div>
              {/* Continuous Colormap Bar */}
              <div className="h-2.5 w-full rounded bg-gradient-to-r from-cyan-500 via-yellow-400 via-orange-500 via-red-600 to-pink-500 border border-slate-700 shadow-inner"></div>
              <div className="flex justify-between text-[8.5px] font-mono text-slate-400">
                <span>0°C</span>
                <span>+2°C</span>
                <span>+4°C</span>
                <span>+6°C</span>
                <span>+8°C</span>
                <span className="text-red-300 font-bold">+10°C+</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 bg-sky-600 rounded shadow-sm shrink-0"></div>
            <span className="text-slate-300">Mixed Surface Layer (28–30°C)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 bg-slate-950 border border-slate-700 rounded shadow-sm shrink-0"></div>
            <span className="text-slate-300">Deep Abyssal Ocean (&lt;10°C)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 bg-gradient-to-r from-orange-500 to-red-600 rounded shadow-[0_0_8px_rgba(239,68,68,0.7)] shrink-0"></div>
            <span className="text-red-300 font-medium">Kelvin Wave Core (&gt;10°C Downwelling)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 border-t-2 border-dashed border-white shrink-0"></div>
            <span className="text-slate-300">Thermocline (20°C Isotherm)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white shrink-0"></div>
            <span className="text-slate-400">TAO/TRITON Moored Array Station</span>
          </div>
        </div>
      </div>

      {/* Placed Annotations Data Summary Bar */}
      {annotations.length > 0 && (
        <div className="px-4 py-3 bg-slate-950/95 border-t border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">
              Thermocline Markers ({annotations.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {annotations.map((ann) => (
                <span
                  key={ann.id}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-300 flex items-center gap-1.5"
                >
                  <span className="text-amber-400 font-bold">{ann.longitudeStr}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-300">{ann.depthM}m</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-red-400 font-bold">+{ann.tempAnomalyC}°C</span>
                  <button
                    onClick={() => setAnnotations((prev) => prev.filter((a) => a.id !== ann.id))}
                    className="text-slate-500 hover:text-red-400 ml-0.5 font-bold cursor-pointer"
                    title="Remove marker"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAnnotations([])}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-[11px] border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear All Markers</span>
          </button>
        </div>
      )}
    </div>
  );
};
