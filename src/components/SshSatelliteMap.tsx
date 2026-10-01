import React, { useRef, useEffect } from 'react';
import { Radio } from 'lucide-react';

interface SshSatelliteMapProps {
  progress: number;
}

export const SshSatelliteMap: React.FC<SshSatelliteMapProps> = ({ progress }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background deep oceanic map
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Latitudinal lines
    // 20°N (y ~ 15%), 10°N, 0° (Equator, y = 50%), 10°S, 20°S
    const equatorY = height * 0.5;

    // Draw continent coastlines simplified
    // West: Indonesia / Papua New Guinea (left edge)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;

    // Indonesia / Philippines landmasses on West
    ctx.beginPath();
    ctx.ellipse(width * 0.05, equatorY - 40, 25, 45, -0.2, 0, Math.PI * 2);
    ctx.ellipse(width * 0.08, equatorY + 30, 35, 20, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Australia in Southwest
    ctx.beginPath();
    ctx.ellipse(width * 0.09, height * 0.85, 45, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Americas on East
    // Central & South America
    ctx.beginPath();
    ctx.moveTo(width * 0.92, 0);
    ctx.bezierCurveTo(width * 0.93, height * 0.35, width * 0.95, height * 0.45, width * 0.94, equatorY);
    ctx.bezierCurveTo(width * 0.94, equatorY + 30, width * 0.96, height * 0.8, width * 0.95, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Grid coordinates
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    // Equator line
    ctx.beginPath();
    ctx.moveTo(0, equatorY);
    ctx.lineTo(width, equatorY);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 10°N & 10°S
    const y10N = height * 0.3;
    const y10S = height * 0.7;
    ctx.beginPath();
    ctx.moveTo(0, y10N);
    ctx.lineTo(width, y10N);
    ctx.moveTo(0, y10S);
    ctx.lineTo(width, y10S);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // SSHA Anomaly Field (Sea Surface Height Anomaly)
    // Map wave progress to X coordinate
    const waveX = progress * width;
    const waveLength = width * 0.28;
    const meridionalTrappingRadius = height * 0.16; // Trapped within ~5° of equator!

    // Draw SSHA Gaussian plume
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Render smooth SSHA field
    for (let py = 0; py < height; py += 3) {
      const dy = py - equatorY;
      const latGaussian = Math.exp(-(dy * dy) / (2 * meridionalTrappingRadius * meridionalTrappingRadius));

      for (let px = 0; px < width; px += 3) {
        const dx = px - waveX;
        const lonGaussian = Math.exp(-(dx * dx) / (2 * (waveLength * 0.45) * (waveLength * 0.45)));

        // SSHA anomaly in cm: up to +28 cm
        let ssha = 28 * lonGaussian * latGaussian;

        // Add subtle background ENSO warm pool basin tilt
        ssha += (1 - px / width) * 4;

        if (ssha > 1) {
          // Color mapping:
          // ssha 0..8: cyan to blue
          // ssha 8..18: yellow to orange
          // ssha 18..28: red to bright magenta
          let r = 0,
            g = 0,
            b = 0,
            a = 0;

          if (ssha < 8) {
            r = Math.floor((ssha / 8) * 50);
            g = Math.floor(100 + (ssha / 8) * 120);
            b = 240;
            a = Math.floor((ssha / 8) * 140);
          } else if (ssha < 18) {
            const t = (ssha - 8) / 10;
            r = Math.floor(220 + t * 35);
            g = Math.floor(180 - t * 80);
            b = Math.floor(40 - t * 30);
            a = Math.floor(140 + t * 80);
          } else {
            const t = Math.min(1, (ssha - 18) / 10);
            r = 255;
            g = Math.floor(80 * (1 - t));
            b = Math.floor(40 + t * 160);
            a = Math.floor(200 + t * 55);
          }

          for (let dy3 = 0; dy3 < 3 && py + dy3 < height; dy3++) {
            for (let dx3 = 0; dx3 < 3 && px + dx3 < width; dx3++) {
              const idx = ((py + dy3) * width + (px + dx3)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Labels
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText('0° EQUATOR (Equatorial Waveguide)', 20, equatorY - 8);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('10°N', 20, y10N - 6);
    ctx.fillText('10°S', 20, y10S - 6);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('WESTERN PACIFIC', 30, height - 20);
    ctx.textAlign = 'right';
    ctx.fillText('EASTERN PACIFIC (AMERICAS)', width - 30, height - 20);
    ctx.textAlign = 'left';

    // Satellite track beam annotation
    if (waveX > 30 && waveX < width - 30) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(waveX, equatorY, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(waveX, equatorY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fecaca';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText('+28 cm SSHA Crest', waveX + 12, equatorY - 24);
    }
  }, [progress]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Sentinel-6 & Jason-3 Radar Altimetry Map</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Coverage: 20°N – 20°S</span>
          <span>Parameter: Sea Surface Height Anomaly (SSHA)</span>
        </div>
      </div>

      <div className="relative w-full h-[360px] md:h-[420px]">
        <canvas ref={canvasRef} width={900} height={420} className="w-full h-full block" />

        {/* Altimetry Color Scale Bar */}
        <div className="absolute top-4 right-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md text-xs space-y-1.5 shadow-xl">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            SSHA Elevation (cm)
          </div>
          <div className="h-3 w-40 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-amber-400 via-red-500 to-fuchsia-500"></div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300">
            <span>-10cm</span>
            <span>0</span>
            <span>+15cm</span>
            <span className="text-red-400 font-bold">+28cm</span>
          </div>
        </div>

        {/* Equatorial Trapping Callout */}
        <div className="absolute bottom-4 left-4 max-w-sm bg-slate-950/85 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 backdrop-blur-md">
          <span className="font-semibold text-cyan-300">Equatorial Beta-Plane Trapping: </span>
          The Coriolis force $f = \beta y$ vanishes at the equator, creating an eastward waveguide that prevents the wave
          energy from leaking north or south.
        </div>
      </div>
    </div>
  );
};
