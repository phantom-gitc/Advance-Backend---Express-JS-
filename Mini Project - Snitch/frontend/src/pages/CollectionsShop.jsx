import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { ProductCard } from '../components/ProductCard';
import { useUIStore } from '../store/useUIStore';
import { PRODUCT_CATEGORIES } from '../constants/categories';

export const CollectionsShop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const { searchQuery, setSearchQuery } = useUIStore();

  // Read category & subCategory from URL query params or state
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedSubCategory = searchParams.get('subCategory') || 'All';

  const setSelectedCategory = (catName) => {
    const params = new URLSearchParams(searchParams);
    if (catName === 'All') {
      params.delete('category');
      params.delete('subCategory');
    } else {
      params.set('category', catName);
      params.delete('subCategory'); // reset subcategory on category change
    }
    setSearchParams(params);
  };

  const setSelectedSubCategory = (subCatName) => {
    const params = new URLSearchParams(searchParams);
    if (subCatName === 'All') {
      params.delete('subCategory');
    } else {
      params.set('subCategory', subCatName);
    }
    setSearchParams(params);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await productApi.getAll();
      setProducts(res.products || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
      if (err.response?.status === 401) {
        setError('AUTH_REQUIRED');
      } else {
        setError('Failed to load collections. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Find active category object for subcategory chips
  const activeCategoryObj = PRODUCT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === selectedCategory.toLowerCase() || c.id === selectedCategory
  );

  // Filter & Sort
  const filteredProducts = products.filter((p) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      const matchSub = (p.subCategory || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchSub) return false;
    }

    // Category filter
    if (selectedCategory !== 'All') {
      const targetCat = selectedCategory.toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const matchCategory = pCat.includes(targetCat) || targetCat.includes(pCat);
      if (!matchCategory) return false;
    }

    // Subcategory filter
    if (selectedSubCategory !== 'All') {
      const targetSub = selectedSubCategory.toLowerCase();
      const pSub = (p.subCategory || '').toLowerCase();
      const matchSub = pSub.includes(targetSub) || targetSub.includes(pSub);
      if (!matchSub) return false;
    }

    // In stock filter
    if (inStockOnly && p.stock <= 0) {
      return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.price?.amount || a.price || 0;
    const priceB = b.price?.amount || b.price || 0;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0; // featured default
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSearchParams({});
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'All' || selectedSubCategory !== 'All' || inStockOnly;

  // Counts for each category
  const getCategoryCount = (catName) => {
    if (catName === 'All') return products.length;
    return products.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      const tCat = catName.toLowerCase();
      return pCat.includes(tCat) || tCat.includes(pCat);
    }).length;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-24">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 font-semibold block">
            Atelier Permanent &amp; Capsule Collection
          </span>
          <h1 className="font-syne text-2xl sm:text-4xl font-extrabold text-black uppercase tracking-tight">
            Curated Catalog
          </h1>
          <p className="font-hanken text-xs text-neutral-500 mt-1">
            Explore architectural menswear across {PRODUCT_CATEGORIES.length} signature luxury departments.
          </p>
        </div>

        {/* Controls: Search input & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search silhouettes & fabrics..."
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-100 border border-neutral-300 font-hanken text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 bg-neutral-100 border border-neutral-300 font-hanken text-xs uppercase tracking-wider text-black focus:outline-none cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest Drops</option>
          </select>
        </div>
      </div>

      {/* Primary Category Bar */}
      <div className="py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 font-bold">
            Select Department:
          </span>
          <label className="flex items-center gap-2 font-hanken text-xs uppercase tracking-wider text-neutral-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-black rounded-none"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 pt-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 font-hanken text-xs uppercase tracking-wider transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
              selectedCategory === 'All'
                ? 'bg-black text-white border-black font-bold shadow-xs'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-black hover:text-black'
            }`}
          >
            <span>All Catalog</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'All' ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {products.length}
            </span>
          </button>

          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory === cat.id;
            const count = getCategoryCount(cat.name);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 font-hanken text-xs uppercase tracking-wider transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-white border-black font-bold shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-black hover:text-black'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Pills Row (Appears when a category is selected) */}
      {activeCategoryObj && (
        <div className="py-3 px-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="font-hanken text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
            {activeCategoryObj.shortName || activeCategoryObj.name} Styles:
          </span>

          <button
            onClick={() => setSelectedSubCategory('All')}
            className={`px-2.5 py-1 text-[11px] font-hanken uppercase tracking-wider font-medium transition-all ${
              selectedSubCategory === 'All'
                ? 'bg-black text-white font-bold'
                : 'bg-white border border-neutral-300 text-neutral-600 hover:text-black hover:border-black'
            }`}
          >
            All {activeCategoryObj.shortName || 'Styles'}
          </button>

          {activeCategoryObj.subCategories.map((sub) => {
            const isSubSelected = selectedSubCategory.toLowerCase() === sub.name.toLowerCase();
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCategory(sub.name)}
                className={`px-2.5 py-1 text-[11px] font-hanken uppercase tracking-wider font-medium transition-all flex items-center gap-1 ${
                  isSubSelected
                    ? 'bg-black text-white font-bold'
                    : 'bg-white border border-neutral-300 text-neutral-600 hover:text-black hover:border-black'
                }`}
                title={sub.description}
              >
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Chips Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-neutral-200 animate-fade-in">
          <span className="font-hanken text-[11px] uppercase tracking-wider text-neutral-400">
            Filtering By:
          </span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-200 text-black text-xs font-hanken">
              Query: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:opacity-70">
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black text-white text-xs font-hanken">
              Dept: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} className="hover:opacity-70">
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
          )}
          {selectedSubCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-800 text-white text-xs font-hanken">
              Style: {selectedSubCategory}
              <button onClick={() => setSelectedSubCategory('All')} className="hover:opacity-70">
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-200 text-black text-xs font-hanken">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="hover:opacity-70">
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="font-hanken text-xs uppercase tracking-widest text-neutral-500 hover:text-black underline underline-offset-2 ml-2"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Active Department Details Header Banner */}
      {activeCategoryObj && (
        <div className="my-4 p-4 bg-neutral-100/70 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-hanken text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
              Department Classification
            </span>
            <h2 className="font-syne text-lg font-bold uppercase text-black">
              {activeCategoryObj.name}
            </h2>
          </div>
          <span className="font-hanken text-xs text-neutral-500">
            Showing {sortedProducts.length} silhouette{sortedProducts.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="flex flex-col gap-2 animate-pulse">
              <div className="w-full aspect-[3/4] bg-neutral-200" />
              <div className="h-4 bg-neutral-200 w-3/4" />
              <div className="h-3 bg-neutral-200 w-1/2" />
            </div>
          ))}
        </div>
      ) : error === 'AUTH_REQUIRED' ? (
        <div className="my-12 p-8 sm:p-12 bg-neutral-100 border border-neutral-300 text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-black">lock</span>
          <h2 className="font-syne text-xl font-bold uppercase text-black">
            Sign In to View Atelier Catalog
          </h2>
          <p className="font-hanken text-xs text-neutral-500 max-w-md">
            Please sign in to your Atelier Carbon account to browse complete silhouettes, check real-time stock availability, and place orders.
          </p>
          <a
            href="/login"
            className="mt-2 px-6 py-2.5 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
          >
            Sign In Now
          </a>
        </div>
      ) : error ? (
        <div className="my-12 p-8 bg-neutral-50 border border-neutral-200 text-center flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-neutral-400">error</span>
          <p className="font-hanken text-xs text-neutral-600">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 px-4 py-2 border border-black font-hanken text-xs uppercase tracking-wider font-bold hover:bg-black hover:text-white transition-colors"
          >
            Retry
          </button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="my-16 p-12 bg-neutral-50 border border-dashed border-neutral-300 text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-neutral-300">apparel</span>
          <h3 className="font-syne text-lg font-bold uppercase text-black">
            No Silhouettes Found
          </h3>
          <p className="font-hanken text-xs text-neutral-500 max-w-sm">
            {hasActiveFilters
              ? 'No garments match your active filters. Try adjusting your query or resetting filters.'
              : 'Our catalogue is currently being updated with new season garments.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 px-4 py-2 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
          {sortedProducts.map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
