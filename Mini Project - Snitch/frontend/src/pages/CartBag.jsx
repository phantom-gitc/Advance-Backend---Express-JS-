import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const CartBag = () => {
  const navigate = useNavigate();
  const { cart, isLoading, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-neutral-400 mb-3">
          shopping_bag
        </span>
        <h2 className="font-syne text-2xl font-bold uppercase text-black">Your Bag Is Protected</h2>
        <p className="font-hanken text-xs text-neutral-500 mt-2 mb-6">
          Please sign in to view your bag, reserve limited inventory, and proceed to checkout.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-3 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 border border-black text-black font-hanken text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.products || [];
  const rawSubtotal = items.reduce((acc, item) => {
    const itemPrice = item.price || item.product?.price?.amount || 0;
    return acc + itemPrice * item.quantity;
  }, 0);

  const freeDeliveryThreshold = 150;
  const deliveryRemaining = Math.max(0, freeDeliveryThreshold - rawSubtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((rawSubtotal / freeDeliveryThreshold) * 100));

  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const estimatedTax = rawSubtotal > 0 ? Math.round(rawSubtotal * 0.08) : 0;
  const shippingFee = rawSubtotal >= freeDeliveryThreshold || rawSubtotal === 0 ? 0 : 15;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + estimatedTax + shippingFee);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setDiscountPercent(10);
      setAppliedPromo('WELCOME10 (10% OFF)');
      addToast({ message: 'Promo WELCOME10 applied! 10% discount', type: 'success' });
      setPromoCode('');
    } else if (code === 'ATELIER20') {
      setDiscountPercent(20);
      setAppliedPromo('ATELIER20 (20% OFF)');
      addToast({ message: 'VIP Promo ATELIER20 applied! 20% discount', type: 'success' });
      setPromoCode('');
    } else {
      addToast({ message: 'Invalid or expired promotional code', type: 'error' });
    }
  };

  const handleRemovePromo = () => {
    setDiscountPercent(0);
    setAppliedPromo(null);
    addToast({ message: 'Promo code removed', type: 'info' });
  };

  const handleUpdateQty = async (productId, size, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await handleRemoveItem(productId, size);
      return;
    }
    const res = await updateQuantity({ productId, size, quantity: newQty });
    if (!res.success) {
      addToast({ message: res.error, type: 'error' });
    }
  };

  const handleRemoveItem = async (productId, size) => {
    const res = await removeItem({ productId, size });
    if (res.success) {
      addToast({ message: 'Item removed from bag', type: 'info' });
    } else {
      addToast({ message: res.error, type: 'error' });
    }
  };

  const handleProceedCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate order placement
    setTimeout(async () => {
      await clearCart();
      setIsCheckingOut(false);
      setOrderComplete(true);
      addToast({ message: 'Order placed successfully!', type: 'success' });
    }, 1200);
  };

  if (orderComplete) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">check</span>
        </div>
        <span className="font-hanken text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Order #ATC-{(Math.random() * 1000000).toFixed(0)} Confirmed
        </span>
        <h2 className="font-syne text-3xl font-extrabold uppercase text-black mt-2">
          Thank You For Your Order
        </h2>
        <p className="font-hanken text-xs text-neutral-600 mt-2 leading-relaxed">
          Your architectural garments are scheduled for serialized inspection and carbon-neutral express dispatch.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => {
              setOrderComplete(false);
              navigate('/shop');
            }}
            className="px-6 py-3 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-neutral-400 mb-3">
          remove_shopping_cart
        </span>
        <h2 className="font-syne text-2xl font-bold uppercase text-black">Your Shopping Bag Is Empty</h2>
        <p className="font-hanken text-xs text-neutral-500 mt-2 mb-6">
          Discover our latest architectural silhouettes and curate your personal lookbook wardrobe.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors inline-block"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 pb-28">
      {/* Header & Item Counter */}
      <div className="flex items-baseline justify-between pb-4 border-b border-neutral-200">
        <h1 className="font-syne text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
          Shopping Bag
        </h1>
        <span className="font-hanken text-xs uppercase tracking-widest text-neutral-400 font-bold">
          ({items.reduce((s, i) => s + i.quantity, 0)} ITEMS)
        </span>
      </div>

      {/* Free Delivery Meter */}
      <div className="my-5 p-4 bg-neutral-100 border border-neutral-200/70 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-hanken font-semibold text-black uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            {deliveryRemaining === 0 ? 'Complimentary Global Express Unlocked' : 'Free Express Delivery'}
          </span>
          <span className="text-neutral-500">
            {deliveryRemaining === 0 ? 'Qualified' : `Add $${deliveryRemaining} more`}
          </span>
        </div>
        <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-500 ease-out"
            style={{ width: `${freeDeliveryPercent}%` }}
          />
        </div>
        <p className="font-hanken text-[11px] text-neutral-500">
          {deliveryRemaining === 0
            ? 'Your order qualifies for complimentary carbon-neutral global express courier delivery.'
            : `You are ${freeDeliveryPercent}% towards complimentary worldwide express shipping.`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Cart Items List (7 columns) */}
        <div className="lg:col-span-7 flex flex-col divide-y divide-neutral-200">
          {items.map((item) => {
            const product = item.product || {};
            const productId = product._id || product.id || item.product;
            const itemPrice = item.price || product.price?.amount || 0;
            const displayImg =
              product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';

            return (
              <div key={`${productId}-${item.size}`} className="py-4 flex gap-4">
                {/* Thumbnail */}
                <Link
                  to={`/product/${productId}`}
                  className="relative w-24 h-32 shrink-0 bg-neutral-100 overflow-hidden border border-neutral-200"
                >
                  <img src={displayImg} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-md px-1.5 py-0.5 font-hanken text-[9px] font-bold uppercase tracking-wider text-black">
                    {item.size}
                  </span>
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${productId}`}>
                        <h3 className="font-hanken text-sm font-bold text-black uppercase tracking-tight hover:underline">
                          {product.title || 'Architectural Garment'}
                        </h3>
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(productId, item.size)}
                        aria-label="Remove item"
                        className="text-neutral-400 hover:text-[#ba1a1a] transition-colors p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 font-hanken text-xs text-neutral-500">
                      <span>Size: <strong className="text-black">{item.size}</strong></span>
                      <span>•</span>
                      <span>Edition 2026</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-neutral-300 bg-neutral-100 px-2 py-0.5">
                      <button
                        onClick={() => handleUpdateQty(productId, item.size, item.quantity, -1)}
                        className="w-6 h-6 flex items-center justify-center text-black hover:opacity-70"
                        aria-label="Decrease quantity"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="w-6 text-center font-syne text-xs font-bold text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(productId, item.size, item.quantity, 1)}
                        className="w-6 h-6 flex items-center justify-center text-black hover:opacity-70"
                        aria-label="Increase quantity"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="font-syne text-sm font-bold text-black">
                      ${itemPrice * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Summary & Checkout (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Promo code box */}
          <div className="p-4 bg-neutral-100 border border-neutral-200 flex flex-col gap-2">
            <span className="font-hanken text-xs uppercase tracking-wider font-bold text-black flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">sell</span>
              Promotion / Voucher Code
            </span>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="TRY: WELCOME10"
                className="flex-1 bg-white border border-neutral-300 px-3 py-2 font-hanken text-xs uppercase tracking-wider text-black placeholder:normal-case focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
              >
                Apply
              </button>
            </form>

            {appliedPromo && (
              <div className="flex items-center justify-between bg-white border border-neutral-300 px-3 py-1.5 mt-1">
                <span className="font-hanken text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {appliedPromo}
                </span>
                <button onClick={handleRemovePromo} className="text-neutral-400 hover:text-black">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Order Summary breakdown */}
          <div className="p-5 bg-white border border-neutral-200 flex flex-col gap-3 shadow-xs">
            <h3 className="font-hanken text-xs uppercase tracking-widest font-bold text-black border-b border-neutral-200 pb-2">
              Order Breakdown
            </h3>

            <div className="flex justify-between text-xs font-hanken text-neutral-600">
              <span>Subtotal</span>
              <span className="font-semibold text-black">${rawSubtotal}</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-xs font-hanken text-emerald-600 font-semibold">
                <span>Discount ({discountPercent}%)</span>
                <span>-${discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-xs font-hanken text-neutral-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-black">${estimatedTax}</span>
            </div>

            <div className="flex justify-between text-xs font-hanken text-neutral-600">
              <span>Express Delivery</span>
              <span className="font-semibold text-black">
                {shippingFee === 0 ? 'Complimentary' : `$${shippingFee}`}
              </span>
            </div>

            <hr className="border-neutral-200 my-1" />

            <div className="flex justify-between items-baseline">
              <span className="font-hanken text-xs uppercase tracking-widest font-bold text-black">
                Total Amount
              </span>
              <span className="font-syne text-xl font-extrabold text-black">${finalTotal}</span>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleProceedCheckout}
              disabled={isCheckingOut || items.length === 0}
              className="mt-2 w-full py-4 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all"
            >
              <span>{isCheckingOut ? 'Processing Order...' : `Proceed to Checkout — $${finalTotal}`}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-100 border border-neutral-200 text-center">
            <div className="flex flex-col items-center gap-0.5">
              <span className="material-symbols-outlined text-[18px] text-black">replay</span>
              <span className="font-hanken text-[9px] uppercase tracking-wider font-bold text-neutral-600">
                30-Day Returns
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="material-symbols-outlined text-[18px] text-black">lock</span>
              <span className="font-hanken text-[9px] uppercase tracking-wider font-bold text-neutral-600">
                Encrypted
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="material-symbols-outlined text-[18px] text-black">verified</span>
              <span className="font-hanken text-[9px] uppercase tracking-wider font-bold text-neutral-600">
                100% Authentic
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
