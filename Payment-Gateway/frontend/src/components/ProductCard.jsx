export const ProductCard = ({ product, onBuy, isProcessing, disabled }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: product.currency || "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Category & Status */}
        <div className="flex items-center justify-between text-[11px] text-gray-600 mb-2 font-medium">
          <span className="uppercase tracking-wider">{product.category || "Item"}</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            In Stock
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight leading-snug line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Bottom: Price and Buy Button */}
      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            {formatPrice(product.price)}
          </span>
        </div>

        <button
          onClick={() => onBuy(product)}
          disabled={disabled || isProcessing}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isProcessing
              ? "bg-blue-800 text-white cursor-wait"
              : disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md active:scale-95"
          }`}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};
