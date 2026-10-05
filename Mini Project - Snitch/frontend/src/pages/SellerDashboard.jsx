import React, { useEffect, useRef, useState } from 'react';
import { productApi } from '../api/productApi';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { PRODUCT_CATEGORIES } from '../constants/categories';

export const SellerDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Product Modal / Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0].name);
  const [subCategory, setSubCategory] = useState(PRODUCT_CATEGORIES[0].subCategories[0].name);
  const [priceAmount, setPriceAmount] = useState('');
  const [stock, setStock] = useState('25');
  const [selectedSizes, setSelectedSizes] = useState(['M', 'L']);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fileInputRef = useRef(null);

  const activeCategoryObj = PRODUCT_CATEGORIES.find((c) => c.name === category) || PRODUCT_CATEGORIES[0];

  const availableSizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const fetchSellerCatalog = async () => {
    try {
      setIsLoading(true);
      const res = await productApi.getSellerProducts();
      setProducts(res.products || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch seller products:', err);
      if (err.response?.status === 403) {
        setError('403 Forbidden: You do not have seller authorization to access this dashboard.');
      } else {
        setError(err.response?.data?.message || 'Failed to load seller catalog.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerCatalog();
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Unlist Product (Requirement 7) & Relist
  const handleToggleListing = async (productId, currentIsUnlisted) => {
    setTogglingId(productId);
    try {
      if (currentIsUnlisted) {
        await productApi.listProduct(productId);
        addToast({ message: 'Product listed successfully in public catalog', type: 'success' });
      } else {
        await productApi.unlistProduct(productId);
        addToast({ message: 'Product unlisted from store catalog', type: 'info' });
      }
      await fetchSellerCatalog();
    } catch (err) {
      addToast({
        message: err.response?.data?.message || 'Failed to update listing status',
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleSize = (sz) => {
    if (selectedSizes.includes(sz)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== sz));
      }
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  const processFiles = (newFiles) => {
    const validFiles = [];
    const validPreviews = [];

    const availableSlots = 5 - imageFiles.length;
    if (availableSlots <= 0) {
      addToast({ message: 'A maximum of 5 images can be uploaded per silhouette.', type: 'info' });
      return;
    }

    const filesToProcess = Array.from(newFiles).slice(0, availableSlots);
    if (newFiles.length > availableSlots) {
      addToast({
        message: `Only ${availableSlots} more image(s) could be added (max 5 total).`,
        type: 'info',
      });
    }

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        addToast({ message: `${file.name} is not an image file`, type: 'error' });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast({ message: `${file.name} exceeds the 5MB size limit`, type: 'error' });
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...validPreviews]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllImages = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const catObj = PRODUCT_CATEGORIES.find((c) => c.name === newCat);
    if (catObj && catObj.subCategories.length > 0) {
      setSubCategory(catObj.subCategories[0].name);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(PRODUCT_CATEGORIES[0].name);
    setSubCategory(PRODUCT_CATEGORIES[0].subCategories[0].name);
    setPriceAmount('');
    setStock('25');
    setSelectedSizes(['M', 'L']);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !priceAmount) {
      addToast({ message: 'Please complete all required fields', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append(
        'price',
        JSON.stringify({ amount: Number(priceAmount), currency: 'USD' })
      );
      formData.append('stock', stock);
      formData.append('sizes', JSON.stringify(selectedSizes));

      // Append up to 5 images from local device or URL fallback
      if (uploadMode === 'file' && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      } else if (imageUrl.trim()) {
        formData.append('images', imageUrl.trim());
      } else {
        // High quality default editorial lookbook shot
        formData.append(
          'images',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
        );
      }

      await productApi.createProduct(formData);
      addToast({
        message: `New silhouette listed successfully with ${imageFiles.length > 0 ? imageFiles.length : 1} image(s)!`,
        type: 'success',
      });
      setIsCreateOpen(false);
      resetForm();
      await fetchSellerCatalog();
    } catch (err) {
      addToast({
        message: err.response?.data?.message || err.message || 'Failed to create product',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCatalog = products.length;
  const listedCount = products.filter((p) => !p.isUnlisted).length;
  const unlistedCount = products.filter((p) => p.isUnlisted).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 font-bold block">
            Merchant Atelier Control Panel
          </span>
          <h1 className="font-syne text-2xl sm:text-4xl font-extrabold uppercase text-black tracking-tight">
            Seller Dashboard
          </h1>
          <p className="font-hanken text-xs text-neutral-500 mt-1">
            Manage your store inventory, list new silhouettes, and control catalog visibility.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-4 bg-white border border-neutral-200 shadow-xs flex flex-col">
          <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
            Total Silhouettes
          </span>
          <span className="font-syne text-3xl font-extrabold text-black mt-1">{totalCatalog}</span>
          <span className="font-hanken text-[10px] text-neutral-400 mt-1">In merchant catalogue</span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 shadow-xs flex flex-col">
          <span className="font-hanken text-[11px] uppercase tracking-widest text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Live &amp; Active
          </span>
          <span className="font-syne text-3xl font-extrabold text-black mt-1">{listedCount}</span>
          <span className="font-hanken text-[10px] text-neutral-400 mt-1">Discoverable by shoppers</span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 shadow-xs flex flex-col">
          <span className="font-hanken text-[11px] uppercase tracking-widest text-neutral-500 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block" />
            Unlisted Vault
          </span>
          <span className="font-syne text-3xl font-extrabold text-black mt-1">{unlistedCount}</span>
          <span className="font-hanken text-[10px] text-neutral-400 mt-1">Hidden from public catalog</span>
        </div>
      </div>

      {/* Products Table (Requirement 8) */}
      <div className="bg-white border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-syne text-base font-bold uppercase text-black">
            Catalog Inventory ({products.length})
          </h2>
          <button
            onClick={fetchSellerCatalog}
            className="flex items-center gap-1 font-hanken text-xs uppercase tracking-wider text-neutral-500 hover:text-black"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center font-hanken text-xs text-neutral-400 uppercase tracking-widest">
            Loading Merchant Catalog...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-hanken text-xs flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-3xl">lock</span>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center font-hanken text-xs text-neutral-400 uppercase tracking-widest">
            No products in your catalog yet. Click "Add New Product" to list your first piece.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-hanken text-xs">
              <thead className="bg-neutral-100 uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Sizes Configured</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">Visibility Status</th>
                  <th className="py-3 px-4 text-right">Listing Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products.map((prod) => {
                  const prodId = prod._id || prod.id;
                  const price = prod.price?.amount || prod.price || 0;
                  const isUnlisted = prod.isUnlisted;
                  const isToggling = togglingId === prodId;

                  return (
                    <tr key={prodId} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-12 h-16 bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                          <img
                            src={prod.images?.[0] || 'https://via.placeholder.com/150'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-black uppercase tracking-tight truncate max-w-[220px]">
                            {prod.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 uppercase">
                              {prod.category || 'Topwear'}
                            </span>
                            {prod.subCategory && (
                              <span className="text-[9px] text-neutral-500">
                                • {prod.subCategory}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-syne font-bold text-black">${price}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(prod.sizes || []).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 text-[10px] font-bold"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            prod.stock <= 0
                              ? 'text-[#ba1a1a]'
                              : prod.stock <= 5
                              ? 'text-amber-600'
                              : 'text-black'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isUnlisted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-200 text-neutral-700 font-bold uppercase tracking-wider text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                            Unlisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Active / Listed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleListing(prodId, isUnlisted)}
                          disabled={isToggling}
                          className={`px-3 py-1.5 font-hanken text-[11px] uppercase tracking-wider font-bold transition-all ${
                            isUnlisted
                              ? 'bg-black text-white hover:bg-neutral-800'
                              : 'border border-neutral-300 text-neutral-700 hover:border-black hover:text-black bg-white'
                          }`}
                        >
                          {isToggling
                            ? 'Updating...'
                            : isUnlisted
                            ? 'Re-list Product'
                            : 'Unlist Product'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-neutral-300 max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h2 className="font-syne text-xl font-bold uppercase text-black">
                Create New Silhouette
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-black"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sculptural Distressed Hoodie"
                  required
                  className="p-2.5 bg-neutral-50 border border-neutral-300 font-hanken text-xs text-black focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black">
                  Editorial Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe silhouette, fabric weight (GSM), and fit..."
                  rows={3}
                  required
                  className="p-2.5 bg-neutral-50 border border-neutral-300 font-hanken text-xs text-black focus:outline-none focus:bg-white"
                />
              </div>

              {/* Department Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="p-2.5 bg-neutral-50 border border-neutral-300 font-hanken text-xs text-black focus:outline-none focus:bg-white font-medium"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black">
                    Subcategory / Style *
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="p-2.5 bg-neutral-50 border border-neutral-300 font-hanken text-xs text-black focus:outline-none focus:bg-white font-medium"
                  >
                    {activeCategoryObj?.subCategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Subcategory Description Hint */}
              {activeCategoryObj?.subCategories.find((s) => s.name === subCategory)?.description && (
                <div className="p-2.5 bg-neutral-100 border border-neutral-200 text-[11px] font-hanken text-neutral-600">
                  <span className="font-bold text-black uppercase text-[10px] block mb-0.5">Style Classification:</span>
                  {activeCategoryObj.subCategories.find((s) => s.name === subCategory)?.description}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black">
                    Price (USD $) *
                  </label>
                  <input
                    type="number"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    placeholder="95"
                    min="1"
                    required
                    className="p-2.5 bg-neutral-50 border border-neutral-300 font-hanken text-xs text-black focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black">
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    min="0"
                    required
                    className="p-2.5 bg-neutral-50 border border-neutral-300 font-hanken text-xs text-black focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Sizes Selector */}
              <div className="flex flex-col gap-1">
                <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black">
                  Available Sizes (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableSizeOptions.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-3 py-1.5 font-hanken text-xs uppercase tracking-wider font-bold transition-all ${
                        selectedSizes.includes(sz)
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Image: Upload from Device or URL */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-hanken text-xs uppercase tracking-wider font-semibold text-black flex items-center gap-1.5">
                    Garment Visual Image *
                    <span className="text-[10px] text-neutral-400 font-normal lowercase">(from device or web)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-neutral-100 p-0.5 border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-2.5 py-1 font-hanken text-[10px] uppercase tracking-wider font-bold transition-all ${
                        uploadMode === 'file'
                          ? 'bg-black text-white shadow-xs'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      Local Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2.5 py-1 font-hanken text-[10px] uppercase tracking-wider font-bold transition-all ${
                        uploadMode === 'url'
                          ? 'bg-black text-white shadow-xs'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div className="flex flex-col gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="product-device-file-input"
                    />

                    {/* Previews Grid if any images selected */}
                    {imageFiles.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-hanken">
                          <span className="font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Garment Images ({imageFiles.length} of 5 selected)
                          </span>
                          <button
                            type="button"
                            onClick={handleClearAllImages}
                            className="text-neutral-500 hover:text-red-600 text-[11px] underline uppercase tracking-wider font-semibold"
                          >
                            Remove All
                          </button>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {imagePreviews.map((previewUrl, idx) => (
                            <div
                              key={idx}
                              className="relative group aspect-[3/4] bg-neutral-100 border border-neutral-300 overflow-hidden"
                            >
                              <img
                                src={previewUrl}
                                alt={`Selected ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Badge: Cover for first image, number for others */}
                              <div className="absolute top-1 left-1 bg-black/85 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                                {idx === 0 ? 'Cover' : `0${idx + 1}`}
                              </div>

                              {/* Remove individual image button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                                title="Remove this image"
                              >
                                <span className="material-symbols-outlined text-[13px]">close</span>
                              </button>

                              {/* File name tooltip on hover */}
                              <div className="absolute inset-x-0 bottom-0 bg-black/80 px-1 py-0.5 text-[9px] text-white truncate font-hanken">
                                {imageFiles[idx]?.name}
                              </div>
                            </div>
                          ))}

                          {/* Add More Slot (if fewer than 5) */}
                          {imageFiles.length < 5 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-[3/4] border-2 border-dashed border-neutral-300 hover:border-black bg-neutral-50 hover:bg-neutral-100 transition-all flex flex-col items-center justify-center gap-1 text-neutral-500 hover:text-black p-2 text-center cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                              <span className="font-hanken text-[10px] uppercase font-bold tracking-wider">
                                + Add More
                              </span>
                              <span className="font-hanken text-[9px] text-neutral-400">
                                ({5 - imageFiles.length} left)
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty Dropzone if no images yet */}
                    {imageFiles.length === 0 && (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`group cursor-pointer border-2 border-dashed transition-all p-6 text-center flex flex-col items-center justify-center gap-2 ${
                          isDragging
                            ? 'border-black bg-neutral-100'
                            : 'border-neutral-300 bg-neutral-50 hover:border-black hover:bg-neutral-100/70'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 group-hover:text-black group-hover:scale-105 transition-all shadow-xs">
                          <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        </div>
                        <div>
                          <p className="font-hanken text-xs font-bold uppercase tracking-wider text-black">
                            Drop Up to 5 Images Here or <span className="underline underline-offset-2">Browse Device</span>
                          </p>
                          <p className="font-hanken text-[10px] text-neutral-500 mt-0.5">
                            Select up to 5 images at once (PNG, JPG, WEBP • Max 5MB each)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... (Leave blank for default Atelier shot)"
                      className="p-2.5 bg-neutral-50 border border-neutral-300 font-hanken text-xs text-black focus:outline-none focus:bg-white"
                    />
                    {imageUrl.trim() && (
                      <div className="flex items-center gap-3 p-2 bg-neutral-50 border border-neutral-200">
                        <div className="w-12 h-14 bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300">
                          <img
                            src={imageUrl.trim()}
                            alt="URL preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-hanken text-[10px] uppercase font-bold text-neutral-400 block">
                            URL Preview
                          </span>
                          <p className="font-hanken text-[11px] text-black truncate">{imageUrl}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 border border-neutral-300 font-hanken text-xs uppercase tracking-wider font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-black text-white font-hanken text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
