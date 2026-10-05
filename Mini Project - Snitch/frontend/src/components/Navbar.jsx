import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';

import { PRODUCT_CATEGORIES } from '../constants/categories';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();
  const { searchQuery, setSearchQuery, addToast } = useUIStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast({ message: 'Signed out successfully', type: 'info' });
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const isSeller = user?.role === 'seller';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f9f9fa]/90 backdrop-blur-xl border-b border-neutral-200/60 pt-safe transition-all">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-2 h-2 rounded-full bg-black group-hover:scale-125 transition-transform" />
            <span className="font-syne text-xl font-extrabold tracking-tight text-black uppercase">
              ATELIER
            </span>
            <span className="text-[10px] tracking-widest text-neutral-400 font-hanken uppercase hidden sm:inline-block">
              CARBON
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 pl-4 border-l border-neutral-200">
            <Link
              to="/"
              className={`font-hanken text-xs uppercase tracking-widest font-semibold transition-colors ${
                location.pathname === '/' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/shop"
              className={`font-hanken text-xs uppercase tracking-widest font-semibold transition-colors ${
                location.pathname === '/shop' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              Catalog
            </Link>

            {/* Departments Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
                className={`flex items-center gap-0.5 font-hanken text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer ${
                  isDeptMenuOpen ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <span>Departments</span>
                <span className={`material-symbols-outlined text-[16px] transition-transform ${isDeptMenuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isDeptMenuOpen && (
                <div
                  onMouseLeave={() => setIsDeptMenuOpen(false)}
                  className="absolute left-0 top-full mt-3 w-80 bg-white border border-neutral-300 shadow-xl p-3 z-50 animate-fade-in grid grid-cols-1 gap-1"
                >
                  <div className="pb-2 mb-1 border-b border-neutral-100 flex items-center justify-between">
                    <span className="font-hanken text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      Explore 9 Departments
                    </span>
                    <Link
                      to="/shop"
                      onClick={() => setIsDeptMenuOpen(false)}
                      className="text-[10px] font-bold text-black uppercase hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  {PRODUCT_CATEGORIES.map((dept) => (
                    <Link
                      key={dept.id}
                      to={`/shop?category=${encodeURIComponent(dept.name)}`}
                      onClick={() => setIsDeptMenuOpen(false)}
                      className="px-2.5 py-1.5 hover:bg-neutral-100 text-left font-hanken text-xs text-neutral-800 hover:text-black transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium group-hover:font-bold">{dept.name}</span>
                      <span className="text-[10px] text-neutral-400 group-hover:text-black">
                        {dept.subCategories.length} styles
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/wishlist"
              className={`font-hanken text-xs uppercase tracking-widest font-semibold transition-colors ${
                location.pathname === '/wishlist' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              Wishlist
            </Link>
            {isSeller && (
              <Link
                to="/seller"
                className={`font-hanken text-xs uppercase tracking-widest font-bold px-2 py-0.5 border border-black transition-colors ${
                  location.pathname === '/seller'
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-black hover:text-white'
                }`}
              >
                Seller Hub
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Search, Cart & User Menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Toggle */}
          <button
            aria-label="Search Catalog"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="w-10 h-10 flex items-center justify-center text-black hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSearchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Cart / Bag Button */}
          <Link
            to="/cart"
            aria-label={`Cart with ${itemCount} items`}
            className="w-10 h-10 relative flex items-center justify-center text-black hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-[21px]">shopping_bag</span>
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-black text-white font-hanken text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account / Profile */}
          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 pl-2 py-1 text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-syne font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="material-symbols-outlined text-[16px] text-neutral-600 hidden sm:inline-block">
                  expand_more
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link
                  to="/login"
                  className="font-hanken text-xs uppercase tracking-widest font-semibold text-black hover:opacity-70 px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="font-hanken text-xs uppercase tracking-widest font-bold bg-black text-white px-3 py-1.5 hover:bg-neutral-800 transition-colors"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Dropdown Menu */}
            {isUserMenuOpen && isAuthenticated && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 shadow-2xl py-2 z-50 animate-fade-in"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="font-hanken text-xs uppercase tracking-wider text-neutral-400">Signed In As</p>
                  <p className="font-hanken text-sm font-bold text-black truncate">{user?.name}</p>
                  <span className="inline-block mt-1 font-hanken text-[9px] uppercase tracking-widest px-2 py-0.5 bg-neutral-100 font-semibold text-black rounded-full">
                    {user?.role === 'seller' ? '★ Verified Seller' : 'Client Member'}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/shop"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-hanken uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">grid_view</span>
                    Browse Catalog
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-hanken uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                    My Wishlist
                  </Link>
                  {isSeller && (
                    <Link
                      to="/seller"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-hanken uppercase tracking-wider text-black font-bold bg-neutral-100 hover:bg-neutral-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">storefront</span>
                      Seller Dashboard
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-neutral-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-hanken uppercase tracking-wider text-error hover:bg-neutral-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-neutral-200 bg-[#f9f9fa] px-4 py-3 animate-fade-in">
          <div className="max-w-3xl mx-auto flex items-center gap-2 bg-white border border-neutral-300 px-3 py-2">
            <span className="material-symbols-outlined text-neutral-400 text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/shop');
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search garments, blazers, trousers, silhouettes..."
              className="w-full bg-transparent font-hanken text-sm text-black placeholder:text-neutral-400 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-black"
              >
                <span className="material-symbols-outlined text-[16px]">clear</span>
              </button>
            )}
            <button
              onClick={() => {
                navigate('/shop');
                setIsSearchOpen(false);
              }}
              className="bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold px-3 py-1 hover:bg-neutral-800 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
