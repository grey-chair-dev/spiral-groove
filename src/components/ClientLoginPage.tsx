import React, { useEffect, useMemo, useState } from 'react';

import { ViewMode } from '../../types';

type ClientLoginPageProps = {
  viewMode: ViewMode;
  onSuccess: () => void;
};

export const ClientLoginPage: React.FC<ClientLoginPageProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Staging Access • Grey Chair';
  }, []);

  const expectedPassword = useMemo(() => {
    const env = (import.meta as any)?.env ?? {};
    const raw = env.VITE_CLIENT_LOGIN_PASSWORD ?? env.VITE_CLIENT_PASSWORD;
    return typeof raw === 'string' ? raw : '';
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pwd = password.trim();
    if (!pwd) {
      setError('Enter the staging password to continue.');
      return;
    }
    if (!expectedPassword) {
      setError('Missing server configuration: set VITE_CLIENT_LOGIN_PASSWORD (or VITE_CLIENT_PASSWORD).');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      if (pwd !== expectedPassword) {
        setIsSubmitting(false);
        setError("We couldn’t log you in. Check the password and try again.");
        return;
      }

      try {
        const now = new Date().toISOString();
        if (rememberMe) {
          localStorage.setItem('greychair_client_auth', 'true');
          localStorage.setItem('greychair_client_auth_at', now);
          sessionStorage.removeItem('greychair_client_auth');
          sessionStorage.removeItem('greychair_client_auth_at');
        } else {
          sessionStorage.setItem('greychair_client_auth', 'true');
          sessionStorage.setItem('greychair_client_auth_at', now);
          localStorage.removeItem('greychair_client_auth');
          localStorage.removeItem('greychair_client_auth_at');
        }
      } catch {
        // ignore storage failures; still allow session navigation
      }

      setIsSubmitting(false);
      onSuccess();
    }, 450);
  };

  return (
    <>
      <style>{`
        :root {
          --color-brand-logo-yellow: #FFD700;
          --color-brand-chair-light-gray: #6B7280;
          --color-brand-chair-dark-gray: #374151;
          --color-brand-wood-brown: #B45309;
          --color-brand-pure-white: #FFFFFF;
          --color-brand-vibrant-blue: #3B82F6;
          --color-brand-warm-orange: #F59E0B;
          --color-brand-success-green: #10B981;
          --color-brand-error-red: #EF4444;
          --color-brand-light-grey: #F9FAFB;
          --color-brand-medium-grey: #F3F4F6;
          --color-brand-dark-grey: #1F2937;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
          --shadow-lg: 0 20px 25px rgba(0,0,0,0.15);
          --radius-lg: 18px;
          --transition-fast: 0.15s ease-out;
          --transition-normal: 0.2s ease-out;
        }

        .gc * { box-sizing: border-box; }
        .gc {
          margin: 0;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          color: var(--color-brand-dark-grey);
          background: radial-gradient(1200px 600px at 20% 10%, rgba(255, 215, 0, 0.22), transparent 60%),
            radial-gradient(900px 500px at 80% 0%, rgba(59, 130, 246, 0.16), transparent 55%),
            var(--color-brand-light-grey);
          min-height: 100vh;
        }

        .gc a { color: var(--color-brand-vibrant-blue); text-decoration: none; }
        .gc a:hover { text-decoration: underline; }

        .gc :focus-visible {
          outline: 3px solid rgba(255, 215, 0, 0.9);
          outline-offset: 2px;
          border-radius: 6px;
        }

        .gc-skip-link {
          position: absolute;
          left: 12px;
          top: 12px;
          background: var(--color-brand-pure-white);
          border: 1px solid rgba(55, 65, 81, 0.15);
          padding: 10px 12px;
          border-radius: 10px;
          box-shadow: var(--shadow-sm);
          transform: translateY(-160%);
          transition: transform var(--transition-normal);
          z-index: 50;
        }
        .gc-skip-link:focus { transform: translateY(0); }

        .gc-shell {
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: 28px 16px;
        }

        .gc-card {
          width: min(420px, 100%);
          background: var(--color-brand-pure-white);
          border: 1px solid rgba(55, 65, 81, 0.14);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          padding: 18px;
        }
        @media (min-width: 520px) { .gc-card { padding: 22px; } }

        .gc-card h2 { margin: 0; font-size: 18px; letter-spacing: -0.01em; }
        .gc-card p {
          margin: 6px 0 0;
          color: rgba(107, 114, 128, 0.98);
          font-size: 13px;
          line-height: 1.55;
        }

        .gc-staging-note {
          margin-top: 12px;
          border-radius: 12px;
          padding: 12px;
          font-size: 13px;
          line-height: 1.45;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.22);
          color: rgba(124, 45, 18, 0.95);
        }

        .gc-alert {
          margin-top: 14px;
          border-radius: 12px;
          padding: 12px 12px;
          font-size: 13px;
          line-height: 1.45;
          background: rgba(239, 68, 68, 0.10);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: rgba(127, 29, 29, 0.95);
        }

        .gc-form { margin-top: 16px; }
        .gc-field { display: grid; gap: 8px; margin-top: 12px; }
        .gc-label-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
        .gc-label { font-size: 12px; font-weight: 600; color: rgba(31, 41, 55, 0.92); }
        .gc-hint { font-size: 12px; color: rgba(107, 114, 128, 0.98); }

        .gc-input {
          width: 100%;
          padding: 12px 12px;
          font-size: 14px;
          border-radius: 12px;
          border: 1px solid rgba(55, 65, 81, 0.18);
          background: rgba(249, 250, 251, 0.6);
          color: rgba(31, 41, 55, 0.95);
          transition: border-color var(--transition-normal), box-shadow var(--transition-normal), background var(--transition-normal);
        }
        .gc-input::placeholder { color: rgba(107, 114, 128, 0.85); }
        .gc-input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.65);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
          background: rgba(255, 255, 255, 0.9);
        }

        .gc-password-wrap { position: relative; display: grid; }
        .gc-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: 1px solid rgba(55, 65, 81, 0.15);
          background: rgba(255, 255, 255, 0.85);
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(31, 41, 55, 0.85);
          cursor: pointer;
          transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
        }
        .gc-toggle:hover { background: rgba(249, 250, 251, 1); border-color: rgba(59, 130, 246, 0.25); }
        .gc-toggle:active { transform: translateY(-50%) scale(0.98); }

        .gc-row {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .gc-checkbox {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(31, 41, 55, 0.86);
        }
        .gc-checkbox input { width: 16px; height: 16px; }

        .gc-btn {
          width: 100%;
          margin-top: 14px;
          padding: 12px 14px;
          border: none;
          border-radius: 14px;
          background: var(--color-brand-logo-yellow);
          color: rgba(31, 41, 55, 0.98);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
          box-shadow: 0 10px 22px rgba(255, 215, 0, 0.25);
        }
        .gc-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(255, 215, 0, 0.30); }
        .gc-btn:active { transform: translateY(0); }
        .gc-btn[aria-busy="true"] { opacity: 0.9; cursor: progress; }

        .gc-foot {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(107, 114, 128, 0.98);
          display: grid;
          gap: 8px;
        }
        .gc-foot small { line-height: 1.5; }

        /* --- Mobile friendliness tweaks --- */
        @media (max-width: 520px) {
          .gc-shell { padding: 18px 12px; place-items: start; }
          .gc-card { padding: 16px; }
        }

        @media (max-width: 380px) {
          .gc-toggle { padding: 7px 9px; }
        }
      `}</style>

      <div className="gc">
        <a className="gc-skip-link" href="#main">
          Skip to login form
        </a>

        <div className="gc-shell">
          <section className="gc-card" id="main" aria-label="Login card">
            <h2>Enter password</h2>
            <p>This staging environment is protected. Enter the shared password to continue.</p>

            <div className="gc-staging-note" role="note">
              <strong>Heads up:</strong> This is a <strong>staging</strong> environment. Content may change, and some
              features may be incomplete.
            </div>

            <div className="gc-alert" role="alert" hidden={!error}>
              {error || ' '}
            </div>

            <form className="gc-form" onSubmit={submit} aria-describedby="loginHelp">
              <div className="gc-field">
                <div className="gc-label-row">
                  <label className="gc-label" htmlFor="password">
                    Password
                  </label>
                  <a href="mailto:support@greychair.com" aria-label="Get help accessing staging">
                    Need access?
                  </a>
                </div>

                <div className="gc-password-wrap">
                  <input
                    className="gc-input"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="gc-toggle"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-controls="password"
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="gc-row">
                <label className="gc-checkbox" htmlFor="remember">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <span className="gc-hint">Private device recommended</span>
              </div>

              <button className="gc-btn" type="submit" aria-busy={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>

              <div className="gc-foot" id="loginHelp">
                <small>
                  Need the password? Email <a href="mailto:support@greychair.com">support@greychair.com</a>.
                </small>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};


