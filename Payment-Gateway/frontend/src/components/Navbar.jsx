export const Navbar = ({ searchQuery, setSearchQuery, productCount }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            R
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-base">
            Store
          </span>
          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 ml-1">
            Test Mode
          </span>
        </div>

        {/* Minimal Search */}
        <div className="flex-1 max-w-xs sm:max-w-sm">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all text-gray-800 placeholder-gray-500"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.3-4.3" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Count */}
        <div className="text-xs text-gray-600 font-medium hidden sm:block">
          {productCount} items
        </div>
      </div>
    </header>
  );
};
