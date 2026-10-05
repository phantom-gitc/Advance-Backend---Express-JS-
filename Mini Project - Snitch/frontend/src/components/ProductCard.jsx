import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [addingSize, setAddingSize] = useState(null);

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);

  const fallbackImage =
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const displayImage =
    product.images && product.images.length > 0 && typeof product.images[0] === 'string'
      ? product.images[0]
      : fallbackImage;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    addToast({
      message: added ? 'Saved to Lookbook Wishlist' : 'Removed from Wishlist',
      type: 'info',
    });
  };

  const handleQuickAdd = async (e, sizeObj) => {
    e.preventDefault();
    e.stopPropagation();

    const size = typeof sizeObj === 'string' ? sizeObj : sizeObj.size;
    const isAvailable = typeof sizeObj === 'string' ? true : sizeObj.isAvailable !== false;

    if (!isAvailable) {
      addToast({
        message: `Size ${size} is currently Unavailable (out of stock)`,
        type: 'error',
      });
      return;
    }

    if (!isAuthenticated) {
      addToast({
        message: 'Please sign in to add items to your shopping bag',
        type: 'info',
      });
      navigate('/login');
      return;
    }

    setAddingSize(size);
    const priceAmount = product.price?.amount || product.price || 0;
    const res = await addItem({
      productId,
      size,
      quantity: 1,
      price: priceAmount,
    });

    setAddingSize(null);
    if (res.success) {
      addToast({
        message: `Added ${product.title} (${size}) to Bag`,
        type: 'success',
      });
    } else {
      addToast({
        message: res.error || 'Failed to add item to bag',
        type: 'error',
      });
    }
  };

  // Determine sizes with stock availability (Req 6)
  const sizesList = product.sizesWithStatus || (product.sizes || ['S', 'M', 'L']).map(s => ({
    size: s,
    isAvailable: true,
    status: 'Available',
  }));

  const priceFormatted = product.price?.amount
    ? `$${product.price.amount}`
    : typeof product.price === 'number'
      ? `$${product.price}`
      : '$0';

  return (
    <article className="group flex flex-col relative product-card">
      <Link to={`/product/${productId}`} className="block">
        {/* Media Container: 3:4 Aspect Ratio */}
        <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
          <img
            src={displayImage}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {product.isUnlisted ? (
              <span className="px-2 py-0.5 bg-neutral-900 text-white font-hanken text-[9px] uppercase tracking-widest font-bold">
                UNLISTED
              </span>
            ) : product.stock <= 5 && product.stock > 0 ? (
              <span className="px-2 py-0.5 bg-[#ba1a1a] text-white font-hanken text-[9px] uppercase tracking-widest font-bold">
                FEW LEFT
              </span>
            ) : product.stock === 0 ? (
              <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 font-hanken text-[9px] uppercase tracking-widest font-bold">
                SOLD OUT
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-black font-hanken text-[9px] uppercase tracking-widest font-bold shadow-xs">
                EDITION
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            aria-label="Save to wishlist"
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md text-black flex items-center justify-center hover:bg-white active:scale-90 transition-all shadow-xs"
          >
            <span
              className={`material-symbols-outlined text-[17px] transition-colors ${isWishlisted ? 'text-[#ba1a1a] material-symbols-filled' : 'text-black'
                }`}
            >
              {isWishlisted ? 'favorite' : 'favorite_border'}
            </span>
          </button>

          {/* Quick Size Bar: slides up on hover */}
          <div className="absolute inset-x-2 bottom-2 z-10 translate-y-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-200">
            <div className="bg-white/95 backdrop-blur-md p-1 flex items-center justify-around shadow-sm border border-neutral-200/50">
              <span className="font-hanken text-[9px] tracking-widest text-neutral-400 uppercase font-semibold hidden xs:inline-block px-1">
                SIZE
              </span>
              <div className="flex items-center gap-1">
                {sizesList.map((item) => {
                  const sizeName = typeof item === 'string' ? item : item.size;
                  const isAvailable = typeof item === 'string' ? true : item.isAvailable !== false;

                  return (
                    <button
                      key={sizeName}
                      disabled={!isAvailable || isCartLoading}
                      onClick={(e) => handleQuickAdd(e, item)}
                      title={!isAvailable ? `${sizeName} is Unavailable` : `Quick add size ${sizeName}`}
                      className={`font-hanken text-[10px] uppercase font-semibold py-1 px-1.5 transition-colors ${!isAvailable
                          ? 'text-neutral-300 line-through cursor-not-allowed hover:bg-transparent'
                          : addingSize === sizeName
                            ? 'bg-black text-white'
                            : 'hover:bg-black hover:text-white text-black'
                        }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Meta */}
        <div className="pt-2 flex flex-col gap-0.5">
          {product.category && (
            <span className="font-hanken text-[9px] uppercase tracking-wider text-neutral-400 font-semibold truncate">
              {product.category}
              {product.subCategory ? ` • ${product.subCategory}` : ''}
            </span>
          )}
          <div className="flex items-baseline justify-between">
            <h3 className="font-hanken text-xs sm:text-sm text-black font-semibold tracking-normal truncate pr-2">
              {product.title}
            </h3>
            <span className="font-syne text-xs sm:text-sm font-bold text-black shrink-0">
              {priceFormatted}
            </span>
          </div>
          <p className="font-hanken text-[11px] text-neutral-500 truncate">
            {product.description || 'Architectural Cut · Limited Batch'}
          </p>
        </div>
      </Link>
    </article>
  );
};
