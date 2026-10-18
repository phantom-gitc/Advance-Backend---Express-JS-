import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { ProductCard } from "./components/ProductCard";
import { PaymentSuccessModal } from "./components/PaymentSuccessModal";
import { Toast } from "./components/Toast";
import {
  fetchProducts,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "./services/api";
import { loadRazorpayScript } from "./utils/razorpay";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [activePaymentProductId, setActivePaymentProductId] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast && toast.type !== "loading") {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load products from backend
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      setError(
        "Could not load products. Please ensure the backend is running on port 3000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const data = await fetchProducts();
        if (!ignore) {
          setProducts(data);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError(
            "Could not load products. Please ensure the backend is running on port 3000."
          );
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by category & search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.title && product.title.toLowerCase().includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Razorpay Checkout
  const handleBuyProduct = async (product) => {
    try {
      setActivePaymentProductId(product._id);
      setToast({ message: "Preparing checkout...", type: "loading" });

      // 1. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK could not be loaded.");
      }

      // 2. Create order on backend
      const orderData = await createRazorpayOrder(product._id);

      // 3. Configure Razorpay Standard Checkout
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "Store",
        description: product.name,
        order_id: orderData.order.id,
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response) {
          try {
            setToast({
              message: "Verifying payment...",
              type: "loading",
            });

            // 4. Verify signature on backend
            await verifyRazorpayPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            // 5. Open success receipt modal
            setPaymentSuccessData({
              productName: product.name,
              amount: product.price,
              currency: product.currency || "INR",
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
            });

            setToast({
              message: "Payment verified successfully!",
              type: "success",
            });
          } catch (err) {
            setToast({
              message: err.message || "Payment verification failed",
              type: "error",
            });
          } finally {
            setActivePaymentProductId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setActivePaymentProductId(null);
            setToast({ message: "Checkout closed", type: "info" });
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setActivePaymentProductId(null);
        setToast({
          message: response.error?.description || "Payment failed",
          type: "error",
        });
      });

      rzp.open();
    } catch (err) {
      setActivePaymentProductId(null);
      setToast({
        message: err.message || "Could not start payment",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        productCount={products.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Simple Page Header & Category Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Products
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Click any item to test Razorpay payment and signature verification.
              </p>
            </div>
            
            <span className="text-xs font-medium text-gray-400">
              {filteredProducts.length} items found
            </span>
          </div>

          {/* Clean Minimal Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap mb-2 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 h-48 animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-100 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">No products found</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-3 text-xs text-gray-600 underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onBuy={handleBuyProduct}
                isProcessing={activePaymentProductId === product._id}
                disabled={activePaymentProductId !== null}
              />
            ))}
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-600">
        Razorpay Payment Gateway Demo • Test Mode
      </footer>

      {/* Success Modal */}
      <PaymentSuccessModal
        data={paymentSuccessData}
        onClose={() => setPaymentSuccessData(null)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}