import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(0); // 0 = Composition, 1 = Fit, 2 = Shipping

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await productApi.getById(id);
        const prod = res.product;
        setProduct(prod);

        // Preselect the first available size
        const firstAvailable = prod.sizesWithStatus?.find((s) => s.isAvailable);
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
        } else if (prod.sizes?.length > 0) {
          setSelectedSize(prod.sizes[0]);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        addToast({
          message: 'Product could not be found or has been unlisted',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          <div className="aspect-[3/4] bg-neutral-200" />
          <div className="flex flex-col gap-4">
            <div className="h-4 bg-neutral-200 w-1/4" />
            <div className="h-8 bg-neutral-200 w-3/4" />
            <div className="h-6 bg-neutral-200 w-1/3" />
            <div className="h-24 bg-neutral-200 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-neutral-400 mb-2">
          inventory_2
        </span>
        <h2 className="font-syne text-2xl font-bold uppercase text-black">Silhouette Unavailable</h2>
        <p className="font-hanken text-xs text-neutral-500 mt-1 mb-6">
          This piece may have been unlisted or removed from the current catalog.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id || product.id);

  const fallbackImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB3FhcSEePKskIhSw1bsxuOCC0Gm_iUIPXRKDxd4ZPAwzSMSnJ6yflIblVstjTvLwpg5rPR9cu2naKUMKJIpfKDF4e3rAafiBub4BqW25qnZcnMYCsZC7hiKy21InXH5qGVo95vkqQd-rSvTTuE7UauoHZn_ewLE4PUX8oXWCuIF8GSAbkuRrmaWd54Xh_pjzUxsbqQnwioObUfRBI9p35mL2ktjox_5X_YstHaqDUb9nYpzw435xAn',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBIZQyXIeSXL5YVZtOsaLRTr609SFoz6sKSaiMI6hzkL7-Eg2tLBO_8-jHKFW5S8GYRZq4VjMeYu1iKI8n2Ys0YMzvsBvqryYDtdPpBPBqREg9eOyA-UIyfPUD1xWSXb-MZzA32k3l5k7PkzuKdX43pf96u1lTtXJ5-CNPiJOVE07-o08Ga2nO3HEuhyFekwukiY5XfiZOBHQVZtoX-gpB87KmhWPw9QvS0s4FxC2yX_JnAjOCnUWnd',
  ];

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images.filter((img) => typeof img === 'string' && img.length > 0)
      : fallbackImages;

  const currentImageUrl = galleryImages[selectedImage] || galleryImages[0] || fallbackImages[0];

  const priceAmount = product.price?.amount || product.price || 0;
  const priceDisplay = `$${priceAmount}`;

  // Sizing list with statuses (Requirement 6)
  const sizesList =
    product.sizesWithStatus ||
    (product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((s) => ({
      size: s,
      status: product.stock > 0 ? 'Available' : 'Unavailable',
      isAvailable: product.stock > 0,
      stock: product.stock,
    }));

  const selectedSizeInfo = sizesList.find((s) => s.size === selectedSize);
  const isSelectedSizeAvailable = selectedSizeInfo ? selectedSizeInfo.isAvailable : true;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      addToast({ message: 'Please select a size first', type: 'error' });
      return;
    }

    if (!isSelectedSizeAvailable) {
      addToast({
        message: `Size ${selectedSize} is currently Unavailable (out of stock)`,
        type: 'error',
      });
      return;
    }

    if (!isAuthenticated) {
      addToast({
        message: 'Please sign in to add garments to your bag',
        type: 'info',
      });
      navigate('/login');
      return;
    }

    setIsAdding(true);
    const res = await addItem({
      productId: product._id || product.id,
      size: selectedSize,
      quantity,
      price: priceAmount,
    });
    setIsAdding(false);

    if (res.success) {
      addToast({
        message: `Added ${product.title} (${selectedSize}) x ${quantity} to Bag`,
        type: 'success',
      });
    } else {
      addToast({
        message: res.error || 'Failed to add item to bag',
        type: 'error',
      });
    }
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(product);
    addToast({
      message: added ? 'Saved to Lookbook Wishlist' : 'Removed from Wishlist',
      type: 'info',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-28">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-hanken text-xs uppercase tracking-wider text-neutral-400 mb-6 flex-wrap">
        <Link to="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-black">Catalog</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-black"
            >
              {product.category}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-black font-semibold truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Media Gallery (7 columns) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-visible scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 bg-neutral-100 overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image Viewport */}
          <div className="relative flex-1 aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200">
            <img
              src={currentImageUrl}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute top-3 left-3 bg-[#ba1a1a] text-white px-2.5 py-0.5 font-hanken text-[10px] uppercase tracking-widest font-bold">
                FEW REMAINING ({product.stock} IN STOCK)
              </span>
            )}
            {product.stock === 0 && (
              <span className="absolute top-3 left-3 bg-black text-white px-2.5 py-0.5 font-hanken text-[10px] uppercase tracking-widest font-bold">
                ARCHIVED / SOLD OUT
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Info & Actions (5 columns) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Edition / Meta */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.category && (
                <Link
                  to={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="font-hanken text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-200 hover:bg-black hover:text-white transition-colors"
                >
                  {product.category}
                </Link>
              )}
              {product.subCategory && (
                <span className="font-hanken text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                  • {product.subCategory}
                </span>
              )}
            </div>
            <button
              onClick={handleWishlistToggle}
              className="flex items-center gap-1 font-hanken text-xs uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${isWishlisted ? 'text-[#ba1a1a] material-symbols-filled' : 'text-black'
                  }`}
              >
                {isWishlisted ? 'favorite' : 'favorite_border'}
              </span>
              <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>

          {/* Title & Price */}
          <h1 className="font-syne text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
            {product.title}
          </h1>

          <div className="flex items-baseline gap-3 mt-2">
            <span className="font-syne text-2xl font-bold text-black">{priceDisplay}</span>
            <span className="font-hanken text-xs text-neutral-400">VAT &amp; Duties Included</span>
          </div>

          <p className="font-hanken text-xs sm:text-sm text-neutral-600 mt-4 leading-relaxed">
            {product.description}
          </p>

          <hr className="my-6 border-neutral-200" />

          {/* Sizing Matrix (Requirement 5 & 6) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-hanken text-xs uppercase tracking-wider font-bold text-black">
                Select Size: <span className="font-normal text-neutral-500">{selectedSize || 'Choose Size'}</span>
              </span>
              <span className="font-hanken text-[11px] uppercase tracking-wider text-neutral-400">
                US / EU Standard
              </span>
            </div>

            {/* Size Options Grid */}
            <div className="grid grid-cols-6 gap-2">
              {sizesList.map((item) => {
                const sizeName = typeof item === 'string' ? item : item.size;
                const isAvail = typeof item === 'string' ? true : item.isAvailable !== false;
                const isSelected = selectedSize === sizeName;

                return (
                  <button
                    key={sizeName}
                    onClick={() => {
                      if (isAvail) setSelectedSize(sizeName);
                    }}
                    disabled={!isAvail}
                    className={`py-3 flex flex-col items-center justify-center transition-all relative ${isSelected && isAvail
                        ? 'bg-black text-white font-bold'
                        : isAvail
                          ? 'bg-neutral-100 text-black hover:bg-neutral-200 font-semibold'
                          : 'bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200'
                      }`}
                  >
                    <span className={`font-hanken text-xs ${!isAvail ? 'line-through' : ''}`}>
                      {sizeName}
                    </span>
                    {!isAvail && (
                      <span className="text-[8px] font-hanken tracking-tighter uppercase text-[#ba1a1a] font-bold">
                        Unavailable
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Requirement 6 Notice: Label unavailable */}
            {!isSelectedSizeAvailable && selectedSize && (
              <p className="font-hanken text-xs text-[#ba1a1a] font-semibold mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                Size {selectedSize} is currently Unavailable (out of stock).
              </p>
            )}
          </div>

          {/* Quantity Stepper & Add to Bag */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-3">
            {/* Quantity */}
            <div className="flex items-center justify-between border border-neutral-300 bg-neutral-100 px-3 py-2 w-full sm:w-32 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center text-black hover:opacity-70 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="font-syne text-sm font-bold text-black">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-black hover:opacity-70"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !isSelectedSizeAvailable || product.stock === 0}
              className={`flex-1 py-3.5 px-6 font-hanken text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all ${!isSelectedSizeAvailable || product.stock === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-neutral-800 active:scale-[0.99]'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>
                {isAdding
                  ? 'Adding to Bag...'
                  : !isSelectedSizeAvailable || product.stock === 0
                    ? 'Currently Unavailable'
                    : `Add to Bag — $${priceAmount * quantity}`}
              </span>
            </button>
          </div>

          {/* Spec Accordions */}
          <div className="mt-8 flex flex-col border-t border-neutral-200">
            {/* Accordion 1: Composition */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => setOpenAccordion(openAccordion === 0 ? -1 : 0)}
                className="w-full py-3.5 flex items-center justify-between font-hanken text-xs uppercase tracking-wider font-bold text-black"
              >
                <span>Garment Composition &amp; Care</span>
                <span className="material-symbols-outlined text-[18px] text-neutral-500">
                  {openAccordion === 0 ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openAccordion === 0 && (
                <div className="pb-4 font-hanken text-xs text-neutral-600 leading-relaxed animate-fade-in">
                  Cut from 100% GOTS-certified organic long-staple cotton (280 GSM). Preshrunk through cold enzyme immersion. Hand wash cold or gentle machine cycle. Air dry flat away from direct sunlight.
                </div>
              )}
            </div>

            {/* Accordion 2: Sizing & Fit */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => setOpenAccordion(openAccordion === 1 ? -1 : 1)}
                className="w-full py-3.5 flex items-center justify-between font-hanken text-xs uppercase tracking-wider font-bold text-black"
              >
                <span>Architectural Silhouette &amp; Fit</span>
                <span className="material-symbols-outlined text-[18px] text-neutral-500">
                  {openAccordion === 1 ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openAccordion === 1 && (
                <div className="pb-4 font-hanken text-xs text-neutral-600 leading-relaxed animate-fade-in">
                  Intended relaxed drop-shoulder drape with a wide, boxy torso and structured collar. We suggest taking your standard size for the intended silhouette, or sizing down for a closer classic fit.
                </div>
              )}
            </div>

            {/* Accordion 3: Delivery */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => setOpenAccordion(openAccordion === 2 ? -1 : 2)}
                className="w-full py-3.5 flex items-center justify-between font-hanken text-xs uppercase tracking-wider font-bold text-black"
              >
                <span>Complimentary Delivery &amp; Returns</span>
                <span className="material-symbols-outlined text-[18px] text-neutral-500">
                  {openAccordion === 2 ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openAccordion === 2 && (
                <div className="pb-4 font-hanken text-xs text-neutral-600 leading-relaxed animate-fade-in">
                  Complimentary express carbon-neutral courier delivery on orders exceeding $150. We provide 30-day touchless returns and size exchanges with prepaid digital labels included.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
