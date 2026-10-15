import React from 'react';

interface SecurityScoreCardProps {
  score: number;
}

export default function SecurityScoreCard({ score }: SecurityScoreCardProps) {
  // SVG circular properties
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = 'text-emerald-500 stroke-emerald-500';
  let scoreBg = 'border-emerald-500/10 bg-emerald-500/5';
  let rating = 'Secure / Optimal';
  let ratingDesc = 'Minimal exposure detected. Keep up the secure coding practices!';

  if (score < 50) {
    scoreColor = 'text-red-500 stroke-red-500';
    scoreBg = 'border-red-500/10 bg-red-500/5';
    rating = 'Critical Action Required';
    ratingDesc = 'Severe security vulnerabilities identified. Prioritize patching immediate attack vectors.';
  } else if (score < 80) {
    scoreColor = 'text-amber-500 stroke-amber-500';
    scoreBg = 'border-amber-500/10 bg-amber-500/5';
    rating = 'Warning / Moderate Risk';
    ratingDesc = 'Configuration gaps and exposure detected. Review recommended remediations.';
  }

  return (
    <div id="security-score-card" className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border ${scoreBg} backdrop-blur-md transition-all duration-300`}>
      {/* Circle Progress Gauge */}
      <div className="relative flex items-center justify-center w-36 h-36">
        <svg className="transform -rotate-90 w-36 h-36">
          {/* Track Circle */}
          <circle
            className="text-slate-800"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="72"
            cy="72"
          />
          {/* Progress Circle */}
          <circle
            className={`transition-all duration-1000 ease-out ${scoreColor}`}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx="72"
            cy="72"
          />
        </svg>
        {/* Score Number in Center */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold tracking-tighter text-white">{score}</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium font-mono">Score</span>
        </div>
      </div>

      {/* Info Breakdown */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <span className={`inline-block w-2.5 h-2.5 rounded-full bg-current ${scoreColor}`} />
          <h3 className="text-lg font-semibold tracking-tight text-white">{rating}</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-md">{ratingDesc}</p>

        {/* Deductions breakdown breakdown */}
        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-400">Critical: -25 pts</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-slate-400">High: -15 pts</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Medium: -8 pts</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-slate-400">Low: -3 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
