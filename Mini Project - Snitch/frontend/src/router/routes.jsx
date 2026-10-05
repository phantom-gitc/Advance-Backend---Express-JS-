import React, { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Outlet,
  Navigate,
  useLocation,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from 'react-router-dom';

import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { ToastContainer } from '../components/ToastContainer';

// Route-level Code Splitting for ultra-fast browser initial load
const HomeFeed = lazy(() => import('../pages/HomeFeed').then((m) => ({ default: m.HomeFeed })));
const CollectionsShop = lazy(() => import('../pages/CollectionsShop').then((m) => ({ default: m.CollectionsShop })));
const ProductDetail = lazy(() => import('../pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const CartBag = lazy(() => import('../pages/CartBag').then((m) => ({ default: m.CartBag })));
const Login = lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then((m) => ({ default: m.Register })));
const SellerDashboard = lazy(() => import('../pages/SellerDashboard').then((m) => ({ default: m.SellerDashboard })));
const WishlistPage = lazy(() => import('../pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const NotFound = lazy(() => import('../pages/NotFound').then((m) => ({ default: m.NotFound })));

import { useAuthStore } from '../store/useAuthStore';
import { productApi } from '../api/productApi';

const PageFallbackLoader = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 animate-fade-in">
    <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
    <span className="font-hanken text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
      Loading Silhouette...
    </span>
  </div>
);

// Root Layout Component
export const RootLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col bg-[#f9f9fa] text-[#1a1c1d] ${isAuthPage ? 'h-[100dvh] overflow-hidden' : ''}`}>
      {!isAuthPage && <Navbar />}
      <ToastContainer />
      <main className={`flex-1 ${isAuthPage ? 'h-full overflow-hidden flex flex-col' : 'pt-16'}`}>
        <Suspense fallback={<PageFallbackLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
};

// Route Error Boundary
export const RouteErrorBoundary = () => {
  const error = useRouteError();
  console.error('Route error caught:', error);

  let title = 'Unexpected Error';
  let message = 'An unexpected error occurred while rendering this page.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center gap-3">
      <span className="material-symbols-outlined text-5xl text-neutral-400">warning</span>
      <h1 className="font-syne text-2xl font-bold uppercase text-black">{title}</h1>
      <p className="font-hanken text-xs text-neutral-500 max-w-sm">{message}</p>
      <Link
        to="/"
        className="mt-4 px-6 py-2.5 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold"
      >
        Return Home
      </Link>
    </div>
  );
};

// Protected Route Guard for authenticated users
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center font-hanken text-xs uppercase tracking-widest text-neutral-400">
        Verifying Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Seller Guard (Requirements 10 & 11)
export const SellerRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center font-hanken text-xs uppercase tracking-widest text-neutral-400">
        Verifying Credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not seller, block with 403 screen (Requirement 10)
  if (user?.role !== 'seller') {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center gap-3 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-[#ba1a1a]">gpp_bad</span>
        <h1 className="font-syne text-2xl font-bold uppercase text-black">403 Forbidden</h1>
        <p className="font-hanken text-xs text-neutral-500 max-w-sm">
          Access Denied. You are signed in as a Client Member (<strong>{user?.email}</strong>), but this section requires a verified Seller / Merchant profile.
        </p>
        <Link
          to="/"
          className="mt-4 px-6 py-2.5 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold"
        >
          Return to Atelier Storefront
        </Link>
      </div>
    );
  }

  return children;
};

// React Router Data Model router definition
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomeFeed />,
      },
      {
        path: 'shop',
        element: <CollectionsShop />,
      },
      {
        path: 'product/:id',
        element: <ProductDetail />,
        loader: async ({ params }) => {
          // Preload product details if needed or let page hook handle it
          try {
            return await productApi.getById(params.id);
          } catch {
            return null;
          }
        },
      },
      {
        path: 'cart',
        element: <CartBag />,
      },
      {
        path: 'wishlist',
        element: <WishlistPage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'seller',
        element: (
          <SellerRoute>
            <SellerDashboard />
          </SellerRoute>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
