import React from 'react';
import { Scan } from '../types';
import { Calendar, CheckCircle, ShieldAlert, Award, ChevronRight, Trash2, TrendingUp } from 'lucide-react';

interface ScanHistoryProps {
  scans: Scan[];
  activeScanId: string | null;
  onSelectScan: (scanId: string) => void;
  onDeleteScan: (scanId: string) => void;
  domainName: string;
}

export default function ScanHistory({ scans, activeScanId, onSelectScan, onDeleteScan, domainName }: ScanHistoryProps) {
  // Sort scans chronological for trend charts
  const sortedForTrend = [...scans].sort(
    (a, b) => new Date(a.scanDate).getTime() - new Date(b.scanDate).getTime()
  );

  // Custom SVG trend calculations
  const maxScore = 100;
  const chartHeight = 80;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 10;

  const points = sortedForTrend.map((scan, index) => {
    const x =
      scans.length > 1
        ? paddingLeft +
          (index / (scans.length - 1)) * (260 - paddingLeft - paddingRight)
        : 130;
    // Invert score since 0 is bottom, 100 is top
    const y =
      paddingTop +
      (1 - scan.securityScore / maxScore) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, score: scan.securityScore, date: new Date(scan.scanDate).toLocaleDateString() };
  });

  const pathD = points.reduce((acc, p, index) => {
    return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  return (
    <div id="history-panel" className="bg-[#030712] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-mono">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">// EXPLOIT_LOGS</h3>
        </div>
        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
          {scans.length} RECORDS
        </span>
      </div>

      {/* Trend Graph */}
      {scans.length > 0 && (
        <div className="bg-[#02050e] border border-slate-800/80 rounded-xl p-4 space-y-3 font-mono">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300">HISTORICAL DEFENSE TRAJECTORY</span>
            <span className="text-[10px] text-emerald-400/70 font-mono">target: {domainName}</span>
          </div>

          <div className="relative h-20 w-full">
            {scans.length > 1 ? (
              <svg className="w-full h-full" viewBox="0 0 260 80" preserveAspectRatio="none">
                {/* Horizontal reference grid lines */}
                <line x1="30" y1="10" x2="255" y2="10" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="30" y1="40" x2="255" y2="40" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="30" y1="70" x2="255" y2="70" stroke="#064e3b" strokeWidth="0.5" strokeDasharray="2" />

                {/* Score Axis Labels */}
                <text x="5" y="14" fill="#10b981" className="text-[8px] font-mono">100</text>
                <text x="5" y="44" fill="#059669" className="text-[8px] font-mono">50</text>
                <text x="10" y="74" fill="#047857" className="text-[8px] font-mono">0</text>

                {/* Main Trend Line */}
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

                {/* Dots on Data points */}
                {points.map((p, index) => {
                  let dotColor = 'fill-emerald-400 stroke-emerald-950';
                  if (p.score < 50) dotColor = 'fill-red-500 stroke-red-950';
                  else if (p.score < 80) dotColor = 'fill-amber-500 stroke-amber-950';

                  return (
                    <g key={index} className="group/dot">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        className={`${dotColor} stroke-2 cursor-pointer hover:r-5 transition-all`}
                      />
                      <title>{`Score: ${p.score} on ${p.date}`}</title>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-[11px] text-slate-500 italic">
                Trend trajectory will plot automatically once multiple audits are recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* History List */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 font-mono">
        {scans.map((scan, idx) => {
          const isActive = scan.id === activeScanId;
          const scanDateFormatted = new Date(scan.scanDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          // Severity status badges
          const criticalCount = scan.vulnerabilities.filter((v) => v.severity === 'Critical').length;
          const highCount = scan.vulnerabilities.filter((v) => v.severity === 'High').length;
          const totalIssues = scan.vulnerabilities.length;

          let scoreBadge = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
          if (scan.securityScore < 50) {
            scoreBadge = 'text-red-400 bg-red-950/40 border-red-500/30';
          } else if (scan.securityScore < 80) {
            scoreBadge = 'text-amber-400 bg-amber-950/40 border-amber-500/30';
          }

          return (
            <div
              key={scan.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isActive
                  ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                  : 'border-slate-800/80 bg-[#02050e] hover:border-emerald-500/30 hover:bg-[#02050e]/90'
              }`}
            >
              <div
                onClick={() => onSelectScan(scan.id)}
                className="flex-1 cursor-pointer min-w-0 pr-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-200">{scanDateFormatted}</span>
                  <span className="text-[9px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded uppercase border border-slate-800">
                    {scan.scanType}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${scoreBadge}`}>
                    SCORE: {scan.securityScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {totalIssues === 0 ? (
                      <span className="text-emerald-400">0 EXPLOITS FOUND</span>
                    ) : (
                      <span>
                        {totalIssues} findings
                        {criticalCount > 0 && <span className="text-red-400 ml-1">({criticalCount} CRIT)</span>}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectScan(scan.id)}
                  className="p-1.5 hover:bg-emerald-950/40 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="View Report"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteScan(scan.id)}
                  className="p-1.5 hover:bg-red-950/40 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete scan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
