import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const { addToast } = useUIStore();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user'); // 'user' or 'seller'
  const [selectedTag, setSelectedTag] = useState('Menswear');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [formError, setFormError] = useState('');

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: 'Min 6 Chars' };
    if (password.length < 6) return { level: 1, text: 'Passcode: Low' };
    if (password.length < 10) return { level: 2, text: 'Passcode: Optimal' };
    return { level: 3, text: 'Vault Secure' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fullname || !email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (!agreedTerms) {
      setFormError('Please accept the member communication terms.');
      return;
    }

    const res = await register({
      name: fullname.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (res.success) {
      addToast({
        message: `Welcome to the Archive, ${fullname}! Membership authorized.`,
        type: 'success',
      });
      if (role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/shop');
      }
    } else {
      setFormError(res.error || 'Failed to create account.');
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
              backgroundImage: `url('/images/register_lookbook_bg.jpg')`,
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
              <span>PRIVATE ARCHIVE ACCESS</span>
            </div>
          </div>

          {/* Middle: Editorial Quote / Badge */}
          <div className="relative z-10 max-w-lg my-auto space-y-3">
            <span className="inline-block px-2.5 py-0.5 bg-white text-black font-hanken text-[9px] uppercase tracking-widest font-bold">
              CLIENT VAULT PASS
            </span>
            <h2 className="font-syne text-3xl xl:text-4xl font-extrabold uppercase tracking-tight leading-tight text-white">
              JOIN THE ARCHIVE.<br />CONFIDENTIAL DROPS.
            </h2>
            <p className="font-hanken text-xs xl:text-sm text-neutral-300 font-light leading-relaxed max-w-md">
              Unlock private lookbook invitations, custom atelier sizing profiles, and pre-release priority on strictly serialized batch runs.
            </p>
          </div>

          {/* Bottom Left: Curated Lookbook Specs */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[10px] font-hanken uppercase tracking-widest text-neutral-400">
            <span>Client Key #ATC-2024</span>
            <div className="flex items-center gap-4">
              <span>Encrypted Pass</span>
              <span>•</span>
              <span>Global Dispatch</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container (lg:col-span-6 xl:col-span-5) */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 h-full bg-[#fbfbfb] flex flex-col justify-between px-6 sm:px-10 xl:px-14 py-3 xl:py-5 overflow-hidden">
          {/* Top Section */}
          <div>
            {/* Header */}
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
            <div className="pt-1.5 pb-2">
              <div className="flex border-b border-black/[0.08] relative">
                <Link
                  to="/login"
                  className="flex-1 pb-1.5 text-center text-[10px] font-headline uppercase tracking-[0.16em] font-semibold text-neutral-400 hover:text-black transition-colors"
                >
                  SIGN IN
                </Link>
                <button
                  type="button"
                  className="flex-1 pb-1.5 text-center text-[10px] font-headline uppercase tracking-[0.16em] font-bold text-black relative"
                >
                  CREATE ACCOUNT
                  <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-black"></span>
                </button>
              </div>
            </div>

            {/* Editorial Title Banner */}
            <section className="mb-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-black"></span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                  Client Vault Edition
                </span>
              </div>
              <h1 className="font-headline text-xl leading-tight tracking-tight uppercase text-black font-extrabold">
                JOIN THE ARCHIVE.
              </h1>
              <p className="text-[11px] text-neutral-600 font-light truncate">
                Unlock private drops, bespoke sizing recommendations &amp; priority access.
              </p>
            </section>

            {/* Account Classification Pills */}
            <div className="mb-2.5 p-1 bg-neutral-100 border border-neutral-200 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-1 text-[9px] font-headline uppercase tracking-wider font-semibold transition-all ${
                  role === 'user' ? 'bg-black text-white shadow-xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Customer Member
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`py-1 text-[9px] font-headline uppercase tracking-wider font-semibold transition-all ${
                  role === 'seller' ? 'bg-black text-white shadow-xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Seller Merchant
              </button>
            </div>

            {(formError || error) && (
              <div className="mb-2 p-1.5 bg-red-50 border border-red-200 text-red-700 text-[10px] flex items-center gap-1.5 animate-fade-in">
                <span className="material-symbols-outlined text-[13px] text-red-600">error</span>
                <span className="truncate">{formError || error}</span>
              </div>
            )}

            {/* Streamlined Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Full Name */}
              <div className="space-y-0.5">
                <label
                  htmlFor="fullname"
                  className="block text-[8.5px] uppercase tracking-[0.2em] text-neutral-600 font-semibold"
                >
                  {role === 'seller' ? 'Brand / Designer Name' : 'Full Name'}
                </label>
                <div className="border border-black/[0.08] bg-white rounded-none transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder={role === 'seller' ? 'Atelier Studio Co.' : 'Julian Vance'}
                    className="w-full h-9 px-3 bg-transparent text-xs text-black placeholder:text-neutral-300 focus:outline-none border-0"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className="block text-[8.5px] uppercase tracking-[0.2em] text-neutral-600 font-semibold"
                  >
                    Email Address
                  </label>
                  <span className="text-[8px] uppercase tracking-wider text-neutral-400">
                    Archival Dispatch
                  </span>
                </div>
                <div className="border border-black/[0.08] bg-white rounded-none transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@atelier.com"
                    className="w-full h-9 px-3 bg-transparent text-xs text-black placeholder:text-neutral-300 focus:outline-none border-0"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[8.5px] uppercase tracking-[0.2em] text-neutral-600 font-semibold"
                  >
                    Password
                  </label>
                  <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono">
                    {strength.text}
                  </span>
                </div>
                <div className="border border-black/[0.08] bg-white rounded-none relative flex items-center transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-9 px-3 pr-9 bg-transparent text-xs text-black placeholder:text-neutral-300 focus:outline-none border-0 tracking-wider"
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

                {/* Password strength micro-pills */}
                <div aria-hidden="true" className="flex gap-1 pt-1">
                  <div
                    className={`h-[2px] flex-1 transition-colors duration-300 ${
                      strength.level >= 1 ? 'bg-black' : 'bg-black/[0.08]'
                    }`}
                  />
                  <div
                    className={`h-[2px] flex-1 transition-colors duration-300 ${
                      strength.level >= 2 ? 'bg-black' : 'bg-black/[0.08]'
                    }`}
                  />
                  <div
                    className={`h-[2px] flex-1 transition-colors duration-300 ${
                      strength.level >= 3 ? 'bg-black' : 'bg-black/[0.08]'
                    }`}
                  />
                </div>
              </div>

              {/* Preferred Curation Tags */}
              <div className="pt-0.5 space-y-1">
                <label className="block text-[8.5px] uppercase tracking-[0.2em] text-neutral-600 font-semibold">
                  Preferred Curation
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Menswear', 'Womenswear', 'Archive'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`h-7 text-[8.5px] font-headline font-semibold tracking-wider uppercase transition-all border ${
                        selectedTag === tag
                          ? 'border-black bg-black text-white'
                          : 'border-black/[0.12] bg-white text-neutral-700 hover:border-black'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Disclaimer */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[9.5px] text-neutral-500 font-light select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    required
                    className="rounded-none border-black/30 text-black focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer accent-black"
                  />
                  <span>Accept encrypted communications &amp; priority drop access</span>
                </label>
              </div>

              {/* Primary Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10.5 bg-black text-white text-[10px] font-headline uppercase tracking-[0.2em] font-semibold flex items-center justify-between px-5 hover:bg-neutral-900 active:scale-[0.99] transition-all group disabled:opacity-50"
                >
                  <span>{isLoading ? 'Authorizing Member...' : 'Create Account & Access Drops'}</span>
                  <span className="text-sm font-light transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </form>

            {/* Fast Sign-Up Divider */}
            <div className="relative my-2.5 flex items-center justify-center">
              <div className="w-full border-t border-black/[0.08]"></div>
              <span className="absolute bg-[#fbfbfb] px-2 text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                Fast Sign Up
              </span>
            </div>

            {/* Social Sign-Up Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => addToast({ message: 'Fast Apple ID authorization verified', type: 'info' })}
                className="h-8.5 border border-black/[0.1] bg-white hover:border-black transition-all flex items-center justify-center gap-1.5 px-2 text-black"
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
                onClick={() => addToast({ message: 'Fast Google Account authorization verified', type: 'info' })}
                className="h-8.5 border border-black/[0.1] bg-white hover:border-black transition-all flex items-center justify-center gap-1.5 px-2 text-black"
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
          <footer className="pt-1.5 border-t border-black/[0.05] flex items-center justify-between text-neutral-500 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-black">
                lock_open_right
              </span>
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
