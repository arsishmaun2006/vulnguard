import React, { useState, useEffect } from 'react';
import { Website, Scan, Vulnerability, VerificationMethod } from './types';
import AuthPortal from './components/AuthPortal';
import DomainRegister from './components/DomainRegister';
import SecurityScoreCard from './components/SecurityScoreCard';
import VulnerabilityList from './components/VulnerabilityList';
import ScanHistory from './components/ScanHistory';
import SecuredServerAccessScan from './components/SecuredServerAccessScan';
import { Shield, ShieldCheck, Play, Download, Terminal, Settings, LogOut, CheckCircle, RefreshCw, AlertTriangle, Cpu, Globe, ArrowLeft, Heart, Calendar } from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('autopentest_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Websites state
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(() => {
    const saved = localStorage.getItem('autopentest_active_website');
    return saved ? JSON.parse(saved) : null;
  });

  // Scan history state
  const [scans, setScans] = useState<Scan[]>(() => {
    const saved = localStorage.getItem('autopentest_scans');
    return saved ? JSON.parse(saved) : [];
  });

  // Selected scan for viewing
  const [selectedScanId, setSelectedScanId] = useState<string | null>(() => {
    const saved = localStorage.getItem('autopentest_selected_scan_id');
    return saved || null;
  });

  // App running states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanTypeSelected, setScanTypeSelected] = useState<'passive' | 'active' | 'both'>('both');
  const [scanProgressLogs, setScanProgressLogs] = useState<string[]>([]);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [detectedScanScore, setDetectedScanScore] = useState<number | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('autopentest_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('autopentest_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeWebsite) {
      localStorage.setItem('autopentest_active_website', JSON.stringify(activeWebsite));
    } else {
      localStorage.removeItem('autopentest_active_website');
    }
  }, [activeWebsite]);

  useEffect(() => {
    localStorage.setItem('autopentest_scans', JSON.stringify(scans));
  }, [scans]);

  useEffect(() => {
    if (selectedScanId) {
      localStorage.setItem('autopentest_selected_scan_id', selectedScanId);
    } else {
      localStorage.removeItem('autopentest_selected_scan_id');
    }
  }, [selectedScanId]);

  // Auth actions
  const handleLogin = (user: { uid: string; email: string; name: string }) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveWebsite(null);
    setScans([]);
    setSelectedScanId(null);
    localStorage.clear();
  };

  // Register & Verify Domain
  const handleRegisterAndVerify = async (domainInput: string, method: VerificationMethod, token: string, simulate: boolean) => {
    setIsVerifying(true);
    setVerifyError(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: domainInput,
          method,
          token,
          simulate,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newWebsite: Website = {
          id: 'web_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          domain: data.domain,
          verified: true,
          verificationMethod: method,
          verificationToken: token,
          createdAt: new Date().toISOString(),
        };
        setActiveWebsite(newWebsite);
      } else {
        setVerifyError(data.message || 'Verification failed. Please check setup configurations.');
      }
    } catch (err: any) {
      setVerifyError(`Unable to contact verification server: ${err.message || err}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Run scanning flow with log stream
  const triggerScan = async () => {
    if (!activeWebsite) return;
    setIsScanning(true);
    setSelectedScanId(null);
    setScanProgressLogs([]);
    setScanStepIndex(0);
    setDetectedScanScore(null);

    // Launch the security audit request concurrently with terminal animation
    const scanPromise = fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: activeWebsite.domain,
        scanType: scanTypeSelected,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.securityScore === 'number') {
            setDetectedScanScore(data.securityScore);
          }
          return data;
        }
        return null;
      })
      .catch((err) => {
        console.error('Scan background fetch error:', err);
        return null;
      });

    const steps = [
      'ACCESSING SECURED SERVER: Binding exploit socket & initializing TLS 1.3 handshake on port 443...',
      'INJECTING BINARY PAYLOAD: Flooding target buffers with machine opcodes (01101001 01101110)...',
      'BYPASSING PERIMETER DEFENSE: Interrogating Cloud WAF, rate-limit thresholds & DDoS shields...',
      'CRYPTOGRAPHIC BREACH TEST: Testing X.509 PKI certificate chain, OCSP stapling & AES-256-GCM ciphers...',
      'MEMORY BUFFER OVERFLOW AUDIT: Probing stack canary flags & heap integrity registers (0x7FFF5FBFF)...',
      scanTypeSelected === 'passive'
        ? 'PASSIVE TELEMETRY SNIFFING: Dissecting HTTP response headers, CORS & server identity banners...'
        : 'ACTIVE INJECTION MATRIX: Deploying polyglot SQLi fuzzing & Cross-Site Scripting (XSS) probes...',
      'CROSS-ORIGIN ISOLATION AUDIT: Interrogating COOP, COEP & partitioned cookie boundaries...',
      'RECONNAISSANCE SNIFFING: Scanning for exposed admin paths, .git directory backups & API routes...',
      'HTTP PROTOCOL LEVEL ENFORCEMENT: Auditing HSTS Preload list, CSP frame-ancestors & Permissions Policy...',
      'NEURAL SECURITY INTELLIGENCE: Streaming binary diagnostics to Gemini AI Threat Assessment model...',
      'DECRYPTING SECURITY MATRIX: Generating plain-language remediation playbooks & mitigation snippets...',
      'MISSION COMPLETE: Secured server audit finalized! Synchronizing executive scorecard...',
    ];

    // Extended hacking simulation pacing allowing full binary matrix visualization
    for (let i = 0; i < steps.length; i++) {
      setScanStepIndex(i);
      setScanProgressLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`]);
      await new Promise((resolve) => setTimeout(resolve, i === 9 ? 2400 : 1300));
    }

    try {
      const data = await scanPromise;

      if (data) {
        const newScan: Scan = {
          id: 'scan_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          websiteId: activeWebsite.id,
          scanDate: data.scanDate || new Date().toISOString(),
          status: 'Completed',
          securityScore: data.securityScore,
          vulnerabilities: data.vulnerabilities,
          scanType: scanTypeSelected,
        };

        const updatedScans = [newScan, ...scans];
        setScans(updatedScans);
        setSelectedScanId(newScan.id);
      } else {
        setScanProgressLogs((prev) => [...prev, `[ERROR] Scan API did not return valid scorecard`]);
      }
    } catch (err: any) {
      setScanProgressLogs((prev) => [...prev, `[ERROR] Connection failed: ${err.message || err}`]);
    } finally {
      setIsScanning(false);
    }
  };

  // Actions for scans
  const handleDeleteScan = (scanId: string) => {
    const updated = scans.filter((s) => s.id !== scanId);
    setScans(updated);
    if (selectedScanId === scanId) {
      setSelectedScanId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSelectScan = (scanId: string) => {
    setSelectedScanId(scanId);
  };

  const activeScan = scans.find((s) => s.id === selectedScanId);

  // Print layout triggers print driver
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#02050e] cyber-grid-bg text-slate-100 flex flex-col font-sans selection:bg-emerald-600/30 selection:text-emerald-200 p-4 md:p-6 gap-6">
      {/* FULL-SCREEN SEPARATE SCANNING PAGE DOMINATED BY 0 AND 1 */}
      {isScanning && activeWebsite && (
        <SecuredServerAccessScan
          domain={activeWebsite.domain}
          stepIndex={scanStepIndex}
          totalSteps={12}
          currentStepDescription={
            scanProgressLogs[scanProgressLogs.length - 1]?.replace(/^\[.*?\]\s*/, '') ||
            'ACCESSING SECURED SERVER: Handshaking on port 443...'
          }
          scanType={scanTypeSelected}
          detectedScore={detectedScanScore}
          onAbort={() => setIsScanning(false)}
        />
      )}

      {/* 1. TOP HEADER NAVIGATION - HIDDEN IN PRINT */}
      <header className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#030712]/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl px-6 py-4 gap-4 sm:gap-0 shadow-2xl shadow-black/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
              VULNGUARD <span className="text-emerald-400 font-extrabold">&lt;AI/&gt;</span>
            </h1>
            <p className="text-[10px] text-emerald-500/80 font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CYBER PENETRATION & ASSESSMENT PLATFORM
            </p>
          </div>
        </div>
        
        {currentUser && (
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto font-mono">
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 justify-start sm:justify-end">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                {activeWebsite ? activeWebsite.domain : 'TARGET_PENDING'}
              </p>
              <p className="text-[10px] text-emerald-400/90 flex items-center gap-1.5 justify-start sm:justify-end mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                AUTH_STATUS: {activeWebsite ? `${activeWebsite.verificationMethod.toUpperCase()}_VERIFIED` : 'N/A'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeWebsite && (
                <button
                  onClick={() => {
                    setActiveWebsite(null);
                    setSelectedScanId(null);
                  }}
                  className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer"
                >
                  [NEW_TARGET]
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-950/30 hover:bg-red-900/40 text-red-300 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-red-900/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Disconnect Session"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>EXIT</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN LAYOUT GATEWAY */}
      <main className="no-print flex-1 w-full mx-auto flex flex-col justify-start">
        {!currentUser ? (
          /* AUTHENTICATION PORTAL */
          <div className="py-8">
            <AuthPortal currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
          </div>
        ) : !activeWebsite ? (
          /* WEBSITE REGISTRATION WIZARD */
          <div className="space-y-6">
            <div className="bg-[#030712]/80 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 max-w-3xl mx-auto shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                [SYSTEM READY]: Initialize target authorization by verifying domain control. Penetration audits require verified scope ownership.
              </p>
            </div>
            <DomainRegister onRegister={handleRegisterAndVerify} isVerifying={isVerifying} error={verifyError} />
          </div>
        ) : (
          /* REGISTERED AND VERIFIED - DASHBOARD WORKSPACE (BENTO GRID) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* 1. Security Score Card */}
            <div id="security-health-bento" className="col-span-1 md:col-span-4 bg-[#030712]/90 border border-slate-800/90 hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[340px] transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"></div>
              <div className="flex items-center justify-between w-full mb-6">
                <h3 className="text-slate-400 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Posture Health
                </h3>
                <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  DIAG_READY
                </span>
              </div>
              
              {activeScan ? (
                <div className="flex flex-col items-center justify-center flex-grow">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-900" />
                      <circle 
                        cx="88" 
                        cy="88" 
                        r="76" 
                        stroke="currentColor" 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 76} 
                        strokeDashoffset={2 * Math.PI * 76 - (activeScan.securityScore / 100) * (2 * Math.PI * 76)} 
                        className={`transition-all duration-1000 ease-out ${
                          activeScan.securityScore < 50 ? 'text-red-500' : activeScan.securityScore < 80 ? 'text-amber-500' : 'text-emerald-500'
                        }`} 
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-5xl font-black text-white font-mono">{activeScan.securityScore}</span>
                      <span className="block text-slate-500 text-xs font-mono font-medium">/ 100 PTS</span>
                    </div>
                  </div>
                  <div className={`mt-5 border px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] font-mono ${
                    activeScan.securityScore < 50 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                      : activeScan.securityScore < 80 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {activeScan.securityScore < 50 ? '[DEFENSE_BREACHED: HIGH_RISK]' : activeScan.securityScore < 80 ? '[MODERATE_RISK: GAP_DETECTED]' : '[FORTIFIED: MAXIMUM_DEFENSE]'}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center flex-grow py-6">
                  <div className="w-28 h-28 rounded-full border border-dashed border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center text-emerald-500/60 mb-4 shadow-inner">
                    <Shield className="w-10 h-10 stroke-1" />
                  </div>
                  <p className="text-xs text-slate-300 font-mono font-medium max-w-[200px]">NO TELEMETRY RECORDED</p>
                  <span className="text-[10px] text-emerald-500/80 mt-1.5 uppercase font-mono tracking-wider">Execute scan below</span>
                </div>
              )}
            </div>

            {/* 2. Vulnerability Breakdown Matrix Card */}
            <div id="vulnerability-matrix-bento" className="col-span-1 md:col-span-5 bg-[#030712]/90 border border-slate-800/90 hover:border-emerald-500/30 rounded-3xl p-6 shadow-2xl min-h-[340px] flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-slate-400 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Vulnerability Matrix
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">CVSS v3.1</span>
                </div>
                
                {activeScan ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        CRITICAL
                      </div>
                      <div className="flex-grow bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-red-500 h-full transition-all duration-500 shadow-sm shadow-red-500/50" style={{ width: `${Math.min(100, Math.max(4, (activeScan.vulnerabilities.filter(v => v.severity === 'Critical').length / Math.max(1, activeScan.vulnerabilities.length)) * 100))}%` }}></div>
                      </div>
                      <div className="w-8 text-right text-xs font-mono font-bold text-red-400">
                        {String(activeScan.vulnerabilities.filter(v => v.severity === 'Critical').length).padStart(2, '0')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-24 text-xs font-mono font-bold text-orange-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        HIGH
                      </div>
                      <div className="flex-grow bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-orange-500 h-full transition-all duration-500 shadow-sm shadow-orange-500/50" style={{ width: `${Math.min(100, Math.max(4, (activeScan.vulnerabilities.filter(v => v.severity === 'High').length / Math.max(1, activeScan.vulnerabilities.length)) * 100))}%` }}></div>
                      </div>
                      <div className="w-8 text-right text-xs font-mono font-bold text-orange-400">
                        {String(activeScan.vulnerabilities.filter(v => v.severity === 'High').length).padStart(2, '0')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-24 text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        MEDIUM
                      </div>
                      <div className="flex-grow bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-amber-500 h-full transition-all duration-500 shadow-sm shadow-amber-500/50" style={{ width: `${Math.min(100, Math.max(4, (activeScan.vulnerabilities.filter(v => v.severity === 'Medium').length / Math.max(1, activeScan.vulnerabilities.length)) * 100))}%` }}></div>
                      </div>
                      <div className="w-8 text-right text-xs font-mono font-bold text-amber-400">
                        {String(activeScan.vulnerabilities.filter(v => v.severity === 'Medium').length).padStart(2, '0')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-24 text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        LOW
                      </div>
                      <div className="flex-grow bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-cyan-500 h-full transition-all duration-500 shadow-sm shadow-cyan-500/50" style={{ width: `${Math.min(100, Math.max(4, (activeScan.vulnerabilities.filter(v => v.severity === 'Low').length / Math.max(1, activeScan.vulnerabilities.length)) * 100))}%` }}></div>
                      </div>
                      <div className="w-8 text-right text-xs font-mono font-bold text-cyan-400">
                        {String(activeScan.vulnerabilities.filter(v => v.severity === 'Low').length).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 py-4 opacity-40">
                    <div className="h-2.5 bg-slate-800 rounded-full w-3/4"></div>
                    <div className="h-2.5 bg-slate-800 rounded-full w-1/2"></div>
                    <div className="h-2.5 bg-slate-800 rounded-full w-5/6"></div>
                    <div className="h-2.5 bg-slate-800 rounded-full w-2/3"></div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-850 flex justify-between text-xs font-mono">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">TIMESTAMP</p>
                  <p className="text-xs mt-1 text-slate-300">
                    {activeScan ? new Date(activeScan.scanDate).toLocaleDateString() : 'NO_ASSESSMENT'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">ATTACK NODES</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">ZAP_DAEMON</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">NUCLEI_CORE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Engine Status & Compliance Card */}
            <div id="status-group-bento" className="col-span-1 md:col-span-3 flex flex-col gap-4 min-h-[340px]">
              {/* Engine Status */}
              <div className="bg-[#030712]/90 border border-slate-800/90 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl flex-grow">
                <h3 className="text-slate-400 text-xs uppercase tracking-widest font-mono font-bold mb-1">Scanner Nodes</h3>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850 font-mono">
                  <span className="text-xs font-semibold text-slate-300">OWASP ZAP</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold ${isScanning ? 'text-amber-400' : 'text-emerald-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                    {isScanning ? 'ATTACKING' : 'STANDBY'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850 font-mono">
                  <span className="text-xs font-semibold text-slate-300">Nuclei Engine</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold ${isScanning ? 'text-amber-400' : 'text-emerald-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                    {isScanning ? 'ATTACKING' : 'STANDBY'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850 font-mono">
                  <span className="text-xs font-semibold text-slate-300">Gemini AI</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold ${isScanning && scanStepIndex >= 7 ? 'text-cyan-400 animate-pulse' : 'text-emerald-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isScanning && scanStepIndex >= 7 ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                    {isScanning && scanStepIndex >= 7 ? 'DECRYPTING' : 'ONLINE'}
                  </span>
                </div>
              </div>

              {/* Verified domain check */}
              <div className="bg-[#04101e] border border-emerald-500/30 rounded-3xl p-5 flex items-center justify-between shadow-2xl text-emerald-300">
                <div className="min-w-0 flex-1 pr-2 font-mono">
                  <p className="font-bold text-xs uppercase tracking-wider text-emerald-400">TARGET SCOPE</p>
                  <p className="text-slate-200 text-xs font-mono truncate mt-1" title={activeWebsite.domain}>
                    {activeWebsite.domain}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>

            {/* 4. Assessment Scan Controls Card */}
            <div id="controls-bento" className="col-span-1 md:col-span-4 bg-[#030712]/90 border border-slate-800/90 rounded-3xl p-6 flex flex-col justify-between shadow-2xl min-h-[300px]">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-4">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Infiltration Vector</h3>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Attack Profile</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850 font-mono">
                    <button
                      type="button"
                      onClick={() => setScanTypeSelected('passive')}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        scanTypeSelected === 'passive' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Passive
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanTypeSelected('active')}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        scanTypeSelected === 'active' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanTypeSelected('both')}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        scanTypeSelected === 'both' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dual
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={triggerScan}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:border disabled:border-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-black font-extrabold font-mono text-sm py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/30 tracking-wide"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>INFILTRATION ACTIVE...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-black" />
                      <span>EXECUTE PENETRATION SCAN</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 5. Terminal Console Logger Card */}
            <div id="logs-bento" className={`col-span-1 md:col-span-8 bg-[#030712]/90 border rounded-3xl p-6 shadow-2xl min-h-[300px] flex flex-col justify-between transition-colors ${isScanning ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-slate-800/90'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2 mb-3 font-mono">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">Diagnostics Telemetry Console</span>
                </div>
                {isScanning && <span className="text-emerald-400 animate-pulse font-bold text-[10px]">[INFILTRATING_TARGET]</span>}
              </div>

              <div className="bg-[#02050e] rounded-xl p-4 border border-slate-850 h-[180px] overflow-y-auto font-mono text-[11px] leading-relaxed scrollbar-thin text-emerald-400/90 flex-grow shadow-inner">
                {scanProgressLogs.length > 0 ? (
                  <div className="space-y-1.5">
                    {scanProgressLogs.map((log, index) => (
                      <div key={index} className="transition-all duration-300">
                        {log}
                      </div>
                    ))}
                    {isScanning && (
                      <div className="text-slate-500 animate-pulse pl-4 border-l border-emerald-500/40 mt-2">
                        Intercepting network packets and response headers...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 text-center space-y-2">
                    <Terminal className="w-8 h-8 opacity-40 text-emerald-500/40" />
                    <p className="italic font-mono text-xs">Console standing by. Ready for attack authorization.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Vulnerabilities & AI Remediation findings block */}
            <div id="findings-bento" className="col-span-1 md:col-span-8 bg-[#030712]/90 border border-slate-800/90 rounded-3xl p-6 flex flex-col shadow-2xl">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 font-mono">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-white">Full-Screen Infiltration Terminal Active</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Accessing secured server in tactical hacking matrix mode (<span className="text-emerald-400 font-bold font-mono">010101010 0100101011 0101010</span>)...
                  </p>
                </div>
              ) : activeScan ? (
                <div className="space-y-6">
                  {/* Action items and PDF exporter toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#02050e] border border-slate-850 p-4 rounded-2xl">
                    <div className="text-xs font-mono text-slate-400">
                      TELEMETRY_FINALIZED: <span className="text-emerald-400">{new Date(activeScan.scanDate).toLocaleString()}</span>
                    </div>

                    <button
                      onClick={handlePrintReport}
                      type="button"
                      className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-300 text-xs font-mono font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all shadow-md"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      EXPORT_PDF_REPORT
                    </button>
                  </div>

                  {/* Vulnerabilities grouped detailed findings panels */}
                  <VulnerabilityList vulnerabilities={activeScan.vulnerabilities} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center p-8">
                  <div className="bg-emerald-950/20 p-4 rounded-full border border-emerald-500/30 mb-4 text-emerald-400 shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono">No Target Intelligence Compiled Yet</h3>
                  <p className="text-xs text-slate-400 max-w-[380px] mt-2 leading-relaxed mx-auto font-mono">
                    Target scope <span className="text-emerald-400 font-bold font-mono">{activeWebsite.domain}</span> is verified. Execute the scan above to stream live vulnerability discovery.
                  </p>
                </div>
              )}
            </div>

            {/* 7. Scan History Card */}
            <div id="history-bento" className="col-span-1 md:col-span-4 bg-[#030712]/90 border border-slate-800/90 rounded-3xl p-6 shadow-2xl">
              {scans.length > 0 ? (
                <ScanHistory
                  scans={scans}
                  activeScanId={selectedScanId}
                  onSelectScan={handleSelectScan}
                  onDeleteScan={handleDeleteScan}
                  domainName={activeWebsite.domain}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 font-mono">
                  <Calendar className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs italic">[ARCHIVE EMPTY]: Historical logs will compile here.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* 2. PRINT-ONLY COMPLIANCE REPORT COMPONENT - TRIGGERED NATIVELY VIA WINDOW.PRINT */}
      {activeScan && activeWebsite && (
        <div className="print-only p-8 space-y-8 bg-white text-black min-h-screen">
          <div className="flex items-center justify-between border-b-2 border-slate-950 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">AUTOPENTEST AI ASSESSMENT REPORT</h1>
              <p className="text-sm text-slate-500 font-mono mt-1">AI-Assisted Web Application Security Assessment Platform</p>
            </div>
            <div className="text-right font-mono text-xs text-slate-500">
              <div>REPORT ID: {activeScan.id}</div>
              <div>COMPILED: {new Date(activeScan.scanDate).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Executive Block */}
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-slate-200 p-4 rounded-xl col-span-2 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Executive Summary</h3>
              <p className="text-sm text-slate-850 leading-relaxed">
                This authorized security scan report has been generated on target {activeWebsite.domain} by owner authentication. Out-of-bounds scanning checked server headers, security cookie compliance flags, injection flaws, and exposed directories. Findings have been cataloged and remediated via Gemini compliance engines.
              </p>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Overall Security Score</h3>
              <div className="text-5xl font-mono font-extrabold text-indigo-600 mt-2">{activeScan.securityScore} / 100</div>
              <p className="text-[10px] text-slate-500 font-mono mt-2">
                {activeScan.securityScore >= 80 ? 'Optimal Secure Status' : activeScan.securityScore >= 50 ? 'Moderate Alert State' : 'Critical Action Needed'}
              </p>
            </div>
          </div>

          {/* Website Info Details */}
          <div className="border border-slate-200 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-bold border-b border-slate-200 pb-2">Website & Scope Audit Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Target Domain:</span>
                <span className="text-black font-semibold break-all">{activeWebsite.domain}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Scan Type:</span>
                <span className="text-black font-semibold uppercase">{activeScan.scanType} Scan</span>
              </div>
              <div>
                <span className="text-slate-500 block">Authorization Method:</span>
                <span className="text-black font-semibold uppercase">{activeWebsite.verificationMethod}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Vulnerabilities:</span>
                <span className="text-black font-semibold">{activeScan.vulnerabilities.length} Findings</span>
              </div>
            </div>
          </div>

          {/* Vulnerability report listings */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b-2 border-slate-900 pb-2">Vulnerability Diagnostics Breakdown</h3>
            <div className="space-y-6">
              {activeScan.vulnerabilities.map((v, i) => (
                <div key={v.id} className="border border-slate-200 p-5 rounded-xl space-y-3 page-break-inside-avoid">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">
                        {i + 1}. {v.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono mt-1 block">
                        Category: {v.owaspCategory} | Affected: {v.affectedUrl}
                      </span>
                    </div>
                    <span className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider font-mono py-1 px-3 rounded">
                      {v.severity} Severity
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                    <p><strong>Scanner Diagnosis:</strong> {v.description}</p>
                    {v.aiExplanation && (
                      <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                        <p className="text-indigo-900"><strong>AI Insight Overview:</strong> {v.aiExplanation.summary}</p>
                        <p><strong>Technical Attack Impact:</strong> {v.aiExplanation.riskDetails}</p>
                        <p className="whitespace-pre-wrap"><strong>Remediation Tasks:</strong>\n{v.aiExplanation.stepByStepRemediation}</p>
                        {v.aiExplanation.secureCodeExample && (
                          <div className="mt-2">
                            <span className="block font-semibold mb-1 text-slate-800">Remediation Code Config:</span>
                            <pre className="bg-slate-950 text-white p-3 rounded font-mono text-[10px] overflow-x-auto">
                              {v.aiExplanation.secureCodeExample}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Footer */}
          <div className="border-t border-slate-300 pt-5 text-center text-[10px] text-slate-500 font-mono">
            VulnGuard AI Assessment Portal - Compliance verified certificate scan. Confidential report for registered recipient owners.
          </div>
        </div>
      )}

      {/* FOOTER BAR - HIDDEN IN PRINT */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-500/80" />
            <span>VulnGuard AI © 2026.</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with security</span>
            <Heart className="w-3 h-3 text-red-500 fill-current" />
            <span>& AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
