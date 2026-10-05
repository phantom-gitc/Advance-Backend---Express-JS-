import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage = () => {
  const { items } = useWishlistStore();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-28">
      {/* Header */}
      <div className="flex items-baseline justify-between pb-4 border-b border-neutral-200">
        <div>
          <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 font-semibold block">
            Personal Curation
          </span>
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
            Saved Lookbook Wishlist
          </h1>
        </div>
        <span className="font-hanken text-xs uppercase tracking-widest text-neutral-400 font-bold">
          ({items.length} SAVED)
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-neutral-300">
            favorite_border
          </span>
          <h2 className="font-syne text-xl font-bold uppercase text-black">
            Your Wishlist Is Empty
          </h2>
          <p className="font-hanken text-xs text-neutral-500 max-w-sm">
            Tap the heart icon on any silhouette in our catalog to save it to your personal lookbook.
          </p>
          <Link
            to="/shop"
            className="mt-2 px-6 py-3 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 pt-6">
          {items.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
