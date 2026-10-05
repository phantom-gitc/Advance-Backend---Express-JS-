import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  const { addToast } = useUIStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [formError, setFormError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!identifier || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    const res = await login({ email: identifier.trim(), password });
    if (res.success) {
      addToast({
        message: `Welcome back to the Archive, ${res.user?.name || 'Member'}`,
        type: 'success',
      });
      if (res.user?.role === 'seller') {
        navigate('/seller');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setFormError(res.error || 'Invalid credentials.');
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'seller') {
      setIdentifier('seller@atelier.com');
      setPassword('password123');
      addToast({ message: 'Loaded Seller Demo credentials', type: 'info' });
    } else {
      setIdentifier('customer@atelier.com');
      setPassword('password123');
      addToast({ message: 'Loaded Customer Demo credentials', type: 'info' });
    }
  };

  return (
    <div className="bg-[#fbfbfb] font-body text-black antialiased h-[100dvh] w-full overflow-hidden flex flex-col selection:bg-black selection:text-white">
      {/* 2-Column Desktop Grid utilizing full screen width with zero vertical scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full w-full">
        {/* Left Side: High-Fashion Lookbook Editorial Showcase (Visible on Desktop lg+) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 h-full relative overflow-hidden bg-neutral-950 text-white flex-col justify-between p-8 xl:p-12">
          {/* Background Lookbook Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 hover:scale-100"
            style={{
              backgroundImage: `url('/images/login_lookbook_bg.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/30" />

          {/* Top Left: Logo & Drop indicator */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-2 h-2 rounded-full bg-white group-hover:scale-125 transition-transform" />
              <span className="font-syne text-sm font-extrabold tracking-[0.25em] uppercase text-white">
                ATELIER CARBON
              </span>
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] uppercase tracking-widest font-semibold font-hanken">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>CAPSULE 08 LIVE</span>
            </div>
          </div>

          {/* Middle: Editorial Quote / Badge */}
          <div className="relative z-10 max-w-lg my-auto space-y-3">
            <span className="inline-block px-2.5 py-0.5 bg-white text-black font-hanken text-[9px] uppercase tracking-widest font-bold">
              LIMITED BATCH APPAREL
            </span>
            <h2 className="font-syne text-3xl xl:text-4xl font-extrabold uppercase tracking-tight leading-tight text-white">
              RESTRAINT. TENSION.<br />RAW EDITORIAL PRECISION.
            </h2>
            <p className="font-hanken text-xs xl:text-sm text-neutral-300 font-light leading-relaxed max-w-md">
              Milled from 360 GSM Japanese combed cotton. Hand-finished silhouettes engineered for contemporary luxury streetwear enthusiasts.
            </p>
          </div>

          {/* Bottom Left: Curated Lookbook Specs */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[10px] font-hanken uppercase tracking-widest text-neutral-400">
            <span>Archival Edition 2024</span>
            <div className="flex items-center gap-4">
              <span>Runs Under 300 Units</span>
              <span>•</span>
              <span>100% Plastic-Free</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container (lg:col-span-6 xl:col-span-5) */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 h-full bg-[#fbfbfb] flex flex-col justify-between px-6 sm:px-10 xl:px-14 py-4 xl:py-6 overflow-hidden">
          {/* Header */}
          <div>
            <header className="h-10 flex items-center justify-between border-b border-black/[0.05]">
              <button
                type="button"
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className="w-8 h-8 flex items-center justify-center text-black hover:opacity-60 transition-opacity -ml-1"
              >
                <span className="text-lg font-light leading-none">←</span>
              </button>
              <Link
                to="/"
                className="flex items-center tracking-[0.28em] font-headline text-xs font-bold uppercase text-black"
              >
                ATELIER
              </Link>
              <button
                type="button"
                aria-label="Close"
                onClick={() => navigate('/')}
                className="w-8 h-8 flex items-center justify-center text-black hover:opacity-60 transition-opacity -mr-1"
              >
                <span className="material-symbols-outlined text-[17px] font-light">close</span>
              </button>
            </header>

            {/* Segmented Switcher */}
            <div className="pt-2 pb-3">
              <div className="flex border-b border-black/[0.08] relative">
                <button
                  type="button"
                  className="flex-1 pb-2 text-center text-[10px] font-headline uppercase tracking-[0.16em] font-bold text-black relative"
                >
                  SIGN IN
                  <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-black"></span>
                </button>
                <Link
                  to="/register"
                  className="flex-1 pb-2 text-center text-[10px] font-headline uppercase tracking-[0.16em] font-semibold text-neutral-400 hover:text-black transition-colors"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            </div>

            {/* Editorial Title Banner */}
            <section className="mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-black"></span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                  Private Member Pass
                </span>
              </div>
              <h1 className="font-headline text-2xl xl:text-3xl leading-tight tracking-tight uppercase text-black font-extrabold">
                WELCOME BACK.
              </h1>
              <p className="text-xs text-neutral-600 font-light truncate">
                Access bespoke curations, VIP releases &amp; private archives.
              </p>
            </section>

            {/* 1-Click Fast Presets */}
            <div className="mb-3 px-3 py-1.5 bg-neutral-100/90 border border-neutral-200/80 flex items-center justify-between gap-2">
              <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-500 font-bold shrink-0">
                Demo Accounts:
              </span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <button
                  type="button"
                  onClick={() => handleDemoFill('customer')}
                  className="py-1 px-3 bg-white border border-neutral-300 hover:border-black text-[9px] font-headline uppercase tracking-wider font-semibold text-black transition-all"
                >
                  Customer Member
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('seller')}
                  className="py-1 px-3 bg-black text-white hover:bg-neutral-800 text-[9px] font-headline uppercase tracking-wider font-semibold transition-all"
                >
                  Seller Merchant
                </button>
              </div>
            </div>

            {(formError || error) && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5 animate-fade-in">
                <span className="material-symbols-outlined text-[14px] text-red-600">error</span>
                <span className="truncate">{formError || error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Email */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="memberIdentifier"
                    className="block text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-semibold"
                  >
                    Email Address
                  </label>
                  <span className="text-[8px] uppercase tracking-wider text-neutral-400">
                    Archival Dispatch
                  </span>
                </div>
                <div className="border border-black/[0.08] bg-white rounded-none transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <input
                    id="memberIdentifier"
                    type="email"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="client@atelier.com"
                    className="w-full h-10 px-3 bg-transparent text-xs text-black placeholder:text-neutral-300 focus:outline-none border-0"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="memberSecret"
                    className="block text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-semibold"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => addToast({ message: 'Demo password is: password123', type: 'info' })}
                    className="text-[8px] uppercase tracking-wider text-neutral-400 hover:text-black transition-colors underline-offset-2 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="border border-black/[0.08] bg-white rounded-none relative flex items-center transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <input
                    id="memberSecret"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 px-3 pr-9 bg-transparent text-xs text-black placeholder:text-neutral-300 focus:outline-none border-0 tracking-wider"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 px-2.5 text-neutral-400 hover:text-black transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember & SMS */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[10px] text-neutral-500 font-light select-none">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded-none border-black/30 text-black focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer accent-black"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => addToast({ message: 'SMS verification code sent to your phone', type: 'info' })}
                  className="text-[9px] uppercase tracking-wider text-neutral-500 hover:text-black transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[12px]">smartphone</span>
                  <span>SMS Code</span>
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-black text-white text-[10px] font-headline uppercase tracking-[0.2em] font-semibold flex items-center justify-between px-5 hover:bg-neutral-900 active:scale-[0.99] transition-all group disabled:opacity-50"
                >
                  <span>{isLoading ? 'Authorizing Key...' : 'Enter Atelier'}</span>
                  <span className="text-sm font-light transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </form>

            {/* Fast Sign-In Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-black/[0.08]"></div>
              <span className="absolute bg-[#fbfbfb] px-2 text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                Fast Sign In
              </span>
            </div>

            {/* Social Sign-In Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('customer')}
                className="h-9 border border-black/[0.1] bg-white hover:border-black transition-all flex items-center justify-center gap-1.5 px-2 text-black"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.57-6.5-9.98-11.66-21.66-15.48-35.05-3.82-13.38-5.72-25.75-5.72-37.11 0-16.7 4.18-30.04 12.54-40.03 8.36-9.98 18.77-15.09 31.23-15.34 5.37 0 11.27 1.41 17.69 4.23 6.42 2.82 10.37 4.29 11.85 4.41 1.48-.12 5.56-1.65 12.24-4.59 6.68-2.94 12.31-4.29 16.89-4.05 13.43.74 24.31 5.68 32.65 14.81-11.75 7.1-17.51 16.89-17.27 29.35.25 9.8 4.12 18.06 11.62 24.78 7.5 6.72 16.34 10.64 26.52 11.76-2.45 7.84-5.69 16.14-9.72 24.91zM119.22 33.15c0-7.35 2.66-14.42 7.99-21.21 5.33-6.79 12.08-11.08 20.25-12.87.62 1.47.93 2.94.93 4.41 0 7.35-2.78 14.54-8.34 21.57-5.56 7.03-12.24 11.19-20.03 12.49-.24-1.47-.48-2.93-.8-4.39z" />
                </svg>
                <span className="text-[9px] uppercase tracking-wider font-semibold font-headline">
                  Apple ID
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('seller')}
                className="h-9 border border-black/[0.1] bg-white hover:border-black transition-all flex items-center justify-center gap-1.5 px-2 text-black"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.26v3.15C3.25 21.37 7.34 24 12 24z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.26C.46 8.19 0 10.04 0 12s.46 3.81 1.26 5.41l4.02-3.15z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.59l4.02 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-[9px] uppercase tracking-wider font-semibold font-headline">
                  Google
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <footer className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-neutral-500 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-black">lock</span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-medium">
                Encrypted Client Vault
              </span>
            </div>
            <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono">
              TLS 1.3
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
};
