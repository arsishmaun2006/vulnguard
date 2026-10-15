import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, User, Key, Check, AlertCircle } from 'lucide-react';

interface AuthPortalProps {
  onLogin: (user: { uid: string; email: string; name: string }) => void;
  currentUser: { uid: string; email: string; name: string } | null;
  onLogout: () => void;
}

export default function AuthPortal({ onLogin, currentUser, onLogout }: AuthPortalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin is from standard .run.app or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const authorizedUser = event.data.user;
        if (authorizedUser) {
          setSuccess(`Authenticated as ${authorizedUser.name} via Google!`);
          setTimeout(() => {
            onLogin(authorizedUser);
            setSuccess(null);
          }, 1000);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);
    try {
      // Create the absolute redirect URI for the popup callbacks
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const response = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch authorization url');
      }

      const { url } = await response.json();
      
      // Open the Google / Sandbox OAuth URL in a popup
      const authWindow = window.open(
        url,
        'google_oauth_popup',
        'width=500,height=600,status=no,resizable=yes,scrollbars=yes'
      );

      if (!authWindow) {
        setError('Popup was blocked by your browser. Please allow popups for this site to log in with Google.');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(`Google Sign-In failed: ${err.message || err}`);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    if (isRegistering && !name.trim()) {
      setError('Please provide your name.');
      return;
    }

    // Read stored local users
    const usersJson = localStorage.getItem('autopentest_users') || '[]';
    const users = JSON.parse(usersJson);

    if (isRegistering) {
      // Check if user already exists
      const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setError('An account with this email already exists.');
        return;
      }

      const uid = 'usr_' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newUser = { uid, email: email.trim(), name: name.trim(), password };
      users.push(newUser);
      localStorage.setItem('autopentest_users', JSON.stringify(users));

      setSuccess('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLogin({ uid, email: newUser.email, name: newUser.name });
        // reset fields
        setEmail('');
        setPassword('');
        setName('');
        setSuccess(null);
      }, 1500);
    } else {
      // Login flow
      const matched = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matched) {
        onLogin({ uid: matched.uid, email: matched.email, name: matched.name });
      } else {
        // If they enter admin/admin or there are no accounts, we auto-create/let them in as a demo user
        if (email.toLowerCase() === 'admin@gmail.com' || (email.includes('@') && password.length >= 4)) {
          const uid = 'usr_DEMO88';
          const mockUser = { uid, email: email.trim(), name: name.trim() || 'Security Engineer' };
          onLogin(mockUser);
        } else {
          setError('Invalid email or password. Hint: You can register a new account or log in with any standard email and 4+ character password for testing.');
        }
      }
    }
  };

  if (currentUser) {
    return (
      <div id="auth-status-panel" className="bg-[#030712] border border-emerald-500/30 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/30">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white font-mono">{currentUser.name}</span>
              <span className="text-[9px] bg-emerald-950/60 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider font-bold">
                [OPERATOR_AUTHORIZED]
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 font-mono">
              <span className="text-xs text-slate-400">{currentUser.email}</span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] text-emerald-400/80">UID: {currentUser.uid}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          type="button"
          className="text-xs text-slate-400 hover:text-red-400 transition-colors border border-slate-800 hover:border-red-900/40 px-3.5 py-2 rounded-lg cursor-pointer hover:bg-red-500/5 font-mono font-medium"
        >
          [TERMINATE_SESSION]
        </button>
      </div>
    );
  }

  return (
    <div id="auth-portal" className="bg-[#030712] border border-emerald-500/20 rounded-3xl shadow-2xl max-w-5xl mx-auto overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
      {/* Decorative gradient corner */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-3xl z-0 pointer-events-none" />

      {/* Left Column: Cyber Security Hero Illustration */}
      <div className="md:col-span-5 relative bg-[#02050e] flex flex-col justify-between p-8 overflow-hidden min-h-[350px] md:min-h-[500px] border-b md:border-b-0 md:border-r border-slate-800/80">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity hover:opacity-60 transition-opacity duration-700">
          <img
            src="/src/assets/images/vulnguard_hero_1784443821582.jpg"
            alt="VulnGuard AI Core Security Interface"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Abstract overlay to blend image with slate theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050e] via-[#02050e]/60 to-[#02050e]/30 z-10" />

        <div className="relative z-20 font-mono">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI_SEC_OP // v3.5_flash
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight font-sans">
            Securing Web Infrastructure via Tactical Intelligence
          </h2>
          <p className="text-xs text-slate-300 mt-2 max-w-sm leading-relaxed font-sans">
            Automated passive reconnaissance, active injection vector testing, SSL/TLS analysis, and automated remediation code synthesis.
          </p>
        </div>

        <div className="relative z-20 mt-8">
          <div className="bg-[#030712]/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="font-mono">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Scope Authorization</span>
              <span className="text-xs font-semibold text-emerald-300">Authorized Target Audits Only.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30 shadow-inner mb-3 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-mono">
            {isRegistering ? 'INITIALIZE_OPERATOR_ACCOUNT' : 'OPERATOR_AUTHENTICATION'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[300px] font-mono">
            {isRegistering
              ? 'Initialize credentials to access the cyber penetration console'
              : 'Authenticate session to access vulnerability telemetry'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 max-w-sm mx-auto w-full font-mono">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Operator Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="SecOps Analyst"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#02050e] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email / Operator ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="operator@security.lab"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#02050e] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Access Keyphrase</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#02050e] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-500/40 text-red-400 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>[ERROR]: {error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 text-xs leading-relaxed">
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
              <p>[SUCCESS]: {success}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-sm py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 font-mono tracking-wider"
          >
            {isRegistering ? 'REGISTER & ENTER CONSOLE' : 'ACCESS SECURITY CONSOLE'}
          </button>

          <div className="relative my-4 flex py-1 items-center font-mono">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">// OR //</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-850 text-slate-200 font-semibold text-sm py-3 px-4 rounded-xl transition-colors cursor-pointer border border-slate-800 shadow-sm font-mono"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.13-.21-.24-.43-.35-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign In with Google
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors underline font-mono"
            >
              {isRegistering ? '[ALREADY REGISTERED? SIGN IN]' : '[NEW OPERATOR? INITIALIZE ACCESS]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
