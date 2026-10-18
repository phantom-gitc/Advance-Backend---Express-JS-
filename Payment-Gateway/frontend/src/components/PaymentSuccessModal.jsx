import { useState } from "react";

export const PaymentSuccessModal = ({ data, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!data) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 rounded-full mb-2">
            Payment Verified
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Transaction Successful!
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            HMAC signature was validated and payment status updated to completed in MongoDB.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 space-y-3.5 text-xs">
          
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Product</span>
            <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
              {data.productName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Amount Paid</span>
            <span className="font-bold text-base text-slate-900">
              {formatPrice(data.amount, data.currency)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Razorpay Payment ID</span>
            <button
              onClick={() => handleCopy(data.paymentId, "paymentId")}
              className="font-mono text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              title="Click to copy"
            >
              <span>{data.paymentId}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              {copiedKey === "paymentId" && <span className="text-[10px] text-emerald-600">Copied!</span>}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Razorpay Order ID</span>
            <button
              onClick={() => handleCopy(data.orderId, "orderId")}
              className="font-mono text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              title="Click to copy"
            >
              <span>{data.orderId}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              {copiedKey === "orderId" && <span className="text-[10px] text-emerald-600">Copied!</span>}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Signature Status</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Verified (HMAC-SHA256)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Date & Time</span>
            <span className="text-slate-600 font-mono text-[11px]">
              {new Date().toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>

        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Done & Close Receipt
        </button>

      </div>
    </div>
  );
};
