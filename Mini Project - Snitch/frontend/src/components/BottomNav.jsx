import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export const BottomNav = () => {
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();
  const { user } = useAuthStore();
  const isSeller = user?.role === 'seller';

  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 transition-colors ${
      isActive ? 'text-black font-bold' : 'text-neutral-400 hover:text-black'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#f9f9fa]/90 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-4">
        <NavLink to="/" end className={navItemClass}>
          <span className="material-symbols-outlined text-[22px]">explore</span>
          <span className="font-hanken text-[10px] tracking-widest uppercase">Discover</span>
        </NavLink>

        <NavLink to="/shop" className={navItemClass}>
          <span className="material-symbols-outlined text-[22px]">grid_view</span>
          <span className="font-hanken text-[10px] tracking-widest uppercase">Shop</span>
        </NavLink>

        <NavLink to="/wishlist" className={navItemClass}>
          <span className="material-symbols-outlined text-[22px]">favorite</span>
          <span className="font-hanken text-[10px] tracking-widest uppercase">Wishlist</span>
        </NavLink>

        <NavLink to="/cart" className={navItemClass}>
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-[2px] bg-black text-white font-hanken text-[8px] leading-none rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </div>
          <span className="font-hanken text-[10px] tracking-widest uppercase">Bag</span>
        </NavLink>

        {isSeller && (
          <NavLink to="/seller" className={navItemClass}>
            <span className="material-symbols-outlined text-[22px]">storefront</span>
            <span className="font-hanken text-[10px] tracking-widest uppercase">Seller</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};
