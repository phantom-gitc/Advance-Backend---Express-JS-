import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-32 text-center flex flex-col items-center gap-3">
      <span className="font-syne text-6xl sm:text-8xl font-black text-black">404</span>
      <h1 className="font-syne text-xl sm:text-2xl font-bold uppercase text-black">
        Silhouette Not Found
      </h1>
      <p className="font-hanken text-xs text-neutral-500 max-w-sm mb-4">
        The architectural page or garment reference you requested does not exist or has been shifted.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
      >
        Return to Atelier Home
      </Link>
    </div>
  );
};
