import React, { useState } from 'react';
import { Website, VerificationMethod } from '../types';
import { Globe, FileCode, Hash, ShieldCheck, Download, Copy, CheckCircle, AlertTriangle, Play, HelpCircle } from 'lucide-react';

interface DomainRegisterProps {
  onRegister: (domain: string, method: VerificationMethod, token: string, simulate: boolean) => Promise<void>;
  isVerifying: boolean;
  error: string | null;
}

export default function DomainRegister({ onRegister, isVerifying, error }: DomainRegisterProps) {
  const [urlInput, setUrlInput] = useState('');
  const [method, setMethod] = useState<VerificationMethod>('verification_code');
  const [simulate, setSimulate] = useState(true); // Default to simulate so users can test immediately on any site
  const [tempToken, setTempToken] = useState(() => 'ap_verify_' + Math.random().toString(36).substring(2, 7).toUpperCase());
  const [copied, setCopied] = useState(false);

  // Generate a new random token on request
  const regenerateToken = () => {
    setTempToken('ap_verify_' + Math.random().toString(36).substring(2, 7).toUpperCase());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onRegister(urlInput.trim(), method, tempToken, simulate);
  };

  const cleanDomainDisplay = (val: string) => {
    let domain = val.trim();
    if (!domain) return 'yourwebsite.com';
    return domain.replace(/^https?:\/\//i, '').split('/')[0] || 'yourwebsite.com';
  };

  const activeDomain = cleanDomainDisplay(urlInput);

  return (
    <div id="domain-register-wizard" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-w-3xl mx-auto">
      {/* Visual Header Banner */}
      <div className="h-44 w-full relative bg-slate-950 flex items-end p-6 border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/secure_lock_badge_1784443855895.jpg"
            alt="Secure Shield Verification"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none">Register & Authorize Target Website</h2>
            <p className="text-xs text-slate-300 mt-1.5">Prove ownership or authorization over the target URL before scanning</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Target Website URL</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              required
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            We will analyze <code className="text-indigo-400">{activeDomain}</code>
          </span>
        </div>

        {/* Method Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Verification Method</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* HTML File */}
            <button
              type="button"
              onClick={() => setMethod('html_file')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                method === 'html_file'
                  ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <FileCode className={`w-5 h-5 mt-0.5 ${method === 'html_file' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <div>
                <span className="block text-sm font-semibold text-white">A. HTML File</span>
                <span className="block text-xs text-slate-400 mt-1">Upload a verification file to web root</span>
              </div>
            </button>

            {/* Meta Tag */}
            <button
              type="button"
              onClick={() => setMethod('meta_tag')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                method === 'meta_tag'
                  ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <Globe className={`w-5 h-5 mt-0.5 ${method === 'meta_tag' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <div>
                <span className="block text-sm font-semibold text-white">B. Meta Tag</span>
                <span className="block text-xs text-slate-400 mt-1">Add a &lt;meta&gt; tag to your home head</span>
              </div>
            </button>

            {/* DNS TXT */}
            <button
              type="button"
              onClick={() => setMethod('dns_txt')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                method === 'dns_txt'
                  ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <Hash className={`w-5 h-5 mt-0.5 ${method === 'dns_txt' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <div>
                <span className="block text-sm font-semibold text-white">C. DNS TXT</span>
                <span className="block text-xs text-slate-400 mt-1">Add a TXT record to your DNS records</span>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Verification Action Guides */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">Setup Instructions</h4>
            <button
              type="button"
              onClick={regenerateToken}
              className="text-[10px] text-slate-400 hover:text-white transition-colors underline font-mono"
            >
              Regenerate Token
            </button>
          </div>

          {method === 'verification_code' && (
            <div className="text-sm space-y-3">
              <p className="text-slate-300">
                1. Copy the following verification token precisely:
              </p>
              <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <code className="flex-1 text-xs text-indigo-300 font-mono break-all">
                  {tempToken}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(tempToken)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Copy Token"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-300">
                2. Paste this token into a text box, paragraph, or any readable location on your homepage (or a temporary page of your target website, e.g., <code className="text-indigo-400 font-mono">/verify.html</code>).
              </p>
              <p className="text-slate-300 text-xs text-slate-400 leading-relaxed">
                Our backend will fetch the URL you specified above and verify that the exact token string <code className="text-indigo-400 font-mono">{tempToken}</code> is present in the source code.
              </p>
            </div>
          )}

          {method === 'meta_tag' && (
            <div className="text-sm space-y-3">
              <p className="text-slate-300">
                1. Copy the following meta-tag precisely:
              </p>
              <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <code className="flex-1 text-xs text-indigo-300 font-mono break-all">
                  {`<meta name="autopentest-verification" content="${tempToken}">`}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(`<meta name="autopentest-verification" content="${tempToken}">`)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="Copy Code"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-300">
                2. Place it within the <code className="text-indigo-400 font-mono">&lt;head&gt;</code> section of your website home page, then rebuild/deploy the target.
              </p>
            </div>
          )}

          {method === 'dns_txt' && (
            <div className="text-sm space-y-3">
              <p className="text-slate-300">
                1. Add a new **TXT** record in your domain host DNS settings (e.g. Cloudflare, Namecheap, GoDaddy):
              </p>
              <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden text-xs font-mono">
                <div className="grid grid-cols-3 bg-slate-950 p-2 border-b border-slate-800 text-slate-400 font-bold">
                  <div>Type</div>
                  <div>Name / Host</div>
                  <div>Value</div>
                </div>
                <div className="grid grid-cols-3 p-2.5 text-slate-300">
                  <div>TXT</div>
                  <div>@ (or blank)</div>
                  <div className="flex items-center justify-between gap-1 break-all text-indigo-300">
                    <span>autopentest-verification={tempToken}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`autopentest-verification=${tempToken}`)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-xs">
                Note: DNS changes can occasionally take a few minutes to propagate across servers.
              </p>
            </div>
          )}
        </div>

        {/* Verification Settings / Options */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="block text-sm font-semibold text-white">Evaluation/Demo Override</span>
              <span className="block text-xs text-slate-400 mt-0.5 leading-relaxed">
                By default, this is active to bypass DNS/network lookups on public servers. Turn it off to run an active fetch/resolving verification against your real server.
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={simulate}
              onChange={(e) => setSimulate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600"></div>
          </label>
        </div>

        {/* Error messaging */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Submission Button */}
        <div className="flex justify-end pt-2">
          <input type="hidden" name="token" value={tempToken} />
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying ownership...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Verify and Initialize Target
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
