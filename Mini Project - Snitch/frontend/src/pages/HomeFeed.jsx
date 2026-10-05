import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { ProductCard } from '../components/ProductCard';
import { useUIStore } from '../store/useUIStore';
import { PRODUCT_CATEGORIES } from '../constants/categories';

export const HomeFeed = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedCategory, setSelectedCategory } = useUIStore();

  const categories = ['All', ...PRODUCT_CATEGORIES.map((c) => c.shortName || c.name)];

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const res = await productApi.getAll();
        setProducts(res.products || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load products:', err);
        if (err.response?.status === 401) {
          setError('AUTH_REQUIRED');
        } else {
          setError('Unable to load current collection. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    const cat = selectedCategory.toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    return pCat.includes(cat) || cat.includes(pCat);
  });

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Quick Category Filter Bar */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full font-hanken text-xs uppercase tracking-widest shrink-0 transition-all active:scale-95 ${selectedCategory === cat
                ? 'bg-black text-white font-bold'
                : 'bg-neutral-200/70 text-neutral-700 hover:text-black hover:bg-neutral-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Editorial Hero Banner Card */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3">
        <div className="relative w-full h-[480px] sm:h-[560px] overflow-hidden bg-neutral-900 flex flex-col justify-between p-6 sm:p-12 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('/images/home_hero_banner.jpg')`,
            }}
          />
          {/* Subtle directional gradient so the colorful models & warm Mediterranean villa shine through */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/30 sm:to-transparent" />

          {/* Top Row: Badge & Status */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center px-3.5 py-1 bg-white/95 backdrop-blur-md text-black font-hanken text-[10px] tracking-widest uppercase font-bold shadow-xs">
              RIVIERA CAPSULE COLLECTION
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md text-white font-hanken text-[10px] tracking-widest uppercase border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>SUMMER 2026</span>
            </div>
          </div>

          {/* Bottom Content Area */}
          <div className="relative z-10 flex flex-col gap-2 sm:gap-3 mt-auto max-w-xl">
            <span className="font-hanken text-xs tracking-widest uppercase text-amber-200/90 font-semibold drop-shadow-xs">
              Capsule Edition 09 · Riviera Horizon
            </span>
            <h1 className="font-syne text-3xl sm:text-5xl uppercase tracking-tight leading-none font-extrabold text-white drop-shadow-md">
              RIVIERA RESORT / 24
            </h1>
            <p className="font-hanken text-xs sm:text-sm text-neutral-100 line-clamp-2 max-w-md drop-shadow-xs leading-relaxed">
              Fluid oversized Cuban shirts and tailored linen trousers crafted in sun-washed Italian flax and vibrant Mediterranean earth tones.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-100 transition-all active:scale-95 shadow-md"
              >
                <span>EXPLORE COLLECTION</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <Link
                to="/wishlist"
                className="w-11 h-11 flex items-center justify-center bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors border border-white/30"
                aria-label="View saved lookbook"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Snap Carousel */}
      {products.length > 0 && (
        <section className="w-full max-w-7xl mx-auto pt-6 pb-2">
          <div className="px-4 sm:px-8 pb-3 flex items-end justify-between">
            <div>
              <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 block font-semibold">
                Curated Highlights
              </span>
              <h2 className="font-syne text-xl sm:text-2xl font-bold text-black uppercase tracking-tight">
                Trending Right Now
              </h2>
            </div>
            <Link
              to="/shop"
              className="font-hanken text-xs uppercase tracking-wider text-black flex items-center gap-1 hover:underline font-bold"
            >
              <span>View All ({products.length})</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 sm:px-8 scrollbar-none pb-4">
            {products.slice(0, 4).map((product) => (
              <div key={product._id || product.id} className="snap-start shrink-0 w-[240px] sm:w-[280px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Signature 9 Departments Exploration Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="pb-4 flex items-end justify-between border-b border-neutral-200">
          <div>
            <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 block font-semibold">
              Browse By Silhouette
            </span>
            <h2 className="font-syne text-xl sm:text-2xl font-bold text-black uppercase tracking-tight">
              Signature Departments
            </h2>
          </div>
          <Link
            to="/shop"
            className="font-hanken text-xs uppercase tracking-wider text-black flex items-center gap-1 hover:underline font-bold"
          >
            <span>All Departments ({PRODUCT_CATEGORIES.length})</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 pt-4">
          {PRODUCT_CATEGORIES.map((dept, idx) => (
            <Link
              key={dept.id}
              to={`/shop?category=${encodeURIComponent(dept.name)}`}
              className="group p-4 bg-neutral-100/70 border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all flex flex-col justify-between min-h-[120px]"
            >
              <div>
                <div className="flex items-center justify-between text-neutral-400 group-hover:text-black mb-1">
                  <span className="font-syne text-[11px] font-extrabold tracking-wider">
                    0{idx + 1}
                  </span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_outward
                  </span>
                </div>
                <h3 className="font-syne text-xs sm:text-sm font-bold uppercase text-black group-hover:underline">
                  {dept.name}
                </h3>
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-200/60">
                <span className="font-hanken text-[10px] text-neutral-500 uppercase tracking-wider block">
                  {dept.subCategories.length} Styles • {dept.subCategories[0]?.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Catalog Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 block font-semibold">
              Full Collection
            </span>
            <h2 className="font-syne text-xl sm:text-2xl font-bold text-black uppercase tracking-tight">
              {selectedCategory === 'All' ? 'Complete Lookbook' : selectedCategory}
            </h2>
          </div>
          <span className="font-hanken text-xs uppercase tracking-widest text-neutral-400">
            {filteredProducts.length} Silhouettes
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col gap-2 animate-pulse">
                <div className="w-full aspect-[3/4] bg-neutral-200" />
                <div className="h-4 bg-neutral-200 w-3/4" />
                <div className="h-3 bg-neutral-200 w-1/2" />
              </div>
            ))}
          </div>
        ) : error === 'AUTH_REQUIRED' ? (
          <div className="my-8 p-8 sm:p-12 bg-neutral-100 border border-neutral-300 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-black">lock</span>
            <span className="font-hanken text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
              Protected Collection · Requirement 11
            </span>
            <h3 className="font-syne text-xl sm:text-2xl font-bold uppercase text-black">
              Member Authorization Required
            </h3>
            <p className="font-hanken text-xs text-neutral-600 max-w-md leading-relaxed">
              Atelier Carbon capsules are secured under client authentication. Sign in to view live stock, reserve silhouettes, and access limited batch drops.
            </p>
            <div className="pt-3 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-3 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
              >
                Sign In to View
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 border border-black bg-white text-black font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-50 transition-colors"
              >
                Register Account
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-neutral-400">cloud_off</span>
            <p className="font-hanken text-sm text-neutral-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white text-xs uppercase tracking-widest font-bold"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-hanken text-sm text-neutral-500 uppercase tracking-wider">
              No garments found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 pt-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Atelier Philosophy & Perks */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-4 p-5 bg-neutral-100 border border-neutral-200/60">
            <div className="w-10 h-10 flex items-center justify-center bg-white text-black shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">flight_takeoff</span>
            </div>
            <div className="flex flex-col">
              <h4 className="font-hanken text-xs font-bold uppercase text-black tracking-wider">
                Complimentary Global Express
              </h4>
              <p className="font-hanken text-xs text-neutral-500 pt-1 leading-relaxed">
                Doorstep delivery via insured carbon-neutral couriers on orders exceeding $150.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-neutral-100 border border-neutral-200/60">
            <div className="w-10 h-10 flex items-center justify-center bg-white text-black shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">architecture</span>
            </div>
            <div className="flex flex-col">
              <h4 className="font-hanken text-xs font-bold uppercase text-black tracking-wider">
                Crafted In Limited Batches
              </h4>
              <p className="font-hanken text-xs text-neutral-500 pt-1 leading-relaxed">
                Never mass-produced. Each garment is serialized and produced in runs strictly under 300 units.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-neutral-100 border border-neutral-200/60">
            <div className="w-10 h-10 flex items-center justify-center bg-white text-black shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">eco</span>
            </div>
            <div className="flex flex-col">
              <h4 className="font-hanken text-xs font-bold uppercase text-black tracking-wider">
                100% Plastic-Free Packaging
              </h4>
              <p className="font-hanken text-xs text-neutral-500 pt-1 leading-relaxed">
                Shipped in unbleached FSC-certified kraft boxes with soluble bio-corn garment shields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer Signature */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-6 text-center flex flex-col items-center gap-2 border-t border-neutral-200/60 mt-12">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          <span className="font-syne text-sm uppercase font-extrabold tracking-widest text-black">
            ATELIER CARBON .
          </span>
        </div>
        <span className="font-hanken text-[10px] tracking-widest text-neutral-400 uppercase">
          ARCHITECTURAL APPAREL · EDITION 2026 · ALL RIGHTS RESERVED
        </span>
      </footer>
    </div>
  );
};
