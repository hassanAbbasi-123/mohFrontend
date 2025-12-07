'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Grid3X3, List, Search, X, ChevronLeft, ChevronRight, Sparkles, Monitor, Smartphone, Headphones, Gamepad2, Laptop, Tv, Watch, Camera, Printer, Star, Heart, ShoppingCart, Eye, Zap, Flame } from 'lucide-react';
import { useGetApprovedProductsQuery, useGetSearchSuggestionsQuery } from '@/store/features/productApi';
import { useGetAllCategoriesQuery } from '@/store/features/categoryApi';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

function ProductCard({ product, view, onView }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `${API_BASE}/${imagePath.replace(/\\/g, '/')}`;
  };

  const imageUrl = buildImageUrl(product.image);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="relative group"
    >
      <div 
        onClick={onView} 
        className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative cursor-pointer"
      >
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {product.coupons?.length > 0 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg">
              <Zap className="w-3 h-3" />
              {product.coupons[0]?.discount || '10%'} OFF
            </div>
          )}
          {product.isOnSale && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg">
              <Flame className="w-3 h-3" />
              HOT DEAL
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <Heart className="w-4 h-4 text-gray-700 hover:text-red-500 transition-colors" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <Eye className="w-4 h-4 text-gray-700 hover:text-blue-500 transition-colors" />
          </button>
        </div>
        <div className="relative h-60 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/80">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 mb-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-1">
              by {product.seller?.user?.name || 'Premium Seller'}
            </p>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-3 h-3 ${
                        i < (product.rating || 4) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-gray-300 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviewCount || 24})</span>
              </div>
              {product.inStock && (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  In Stock
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {product.price} PKR
                </p>
                {product.originalPrice && (
                  <p className="text-sm line-through text-gray-400">
                    {product.originalPrice} PKR
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{product.likes?.length || 0} likes</p>
                <p className="text-xs text-gray-500">{product.reviewCount || 0} reviews</p>
              </div>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 group/btn relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </span>
            </button>
          </motion.div>
        </div>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
      </div>
    </motion.div>
  );
}

const FloatingParticles = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-emerald-200/10 to-cyan-200/10 rounded-full blur-3xl"
      />
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-300/30 rounded-full"
          initial={{
            x: Math.random() * 400 + 100,
            y: Math.random() * 400 + 100,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default function ProductsPageClient({ searchParams = {} }) {
  const router = useRouter();
  const searchInputRef = useRef(null);
  
  // Ensure searchParams is an object with default values
  const safeSearchParams = {
    query: searchParams.query || '',
    category: searchParams.category || null,
    sort: searchParams.sort || 'name',
    minPrice: parseInt(searchParams.minPrice) || 0,
    maxPrice: parseInt(searchParams.maxPrice) || 500000,
    view: searchParams.view || 'grid',
    page: parseInt(searchParams.page) || 1,
  };

  const [searchQuery, setSearchQuery] = useState(safeSearchParams.query);
  const [category, setCategory] = useState(safeSearchParams.category);
  const [sort, setSort] = useState(safeSearchParams.sort);
  const [priceRange, setPriceRange] = useState([
    safeSearchParams.minPrice,
    safeSearchParams.maxPrice,
  ]);
  const [view, setView] = useState(safeSearchParams.view);
  const [page, setPage] = useState(safeSearchParams.page);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery();

  const categoryIcons = {
    Smartphones: <Smartphone className="w-5 h-5" />,
    Laptops: <Laptop className="w-5 h-5" />,
    Headphones: <Headphones className="w-5 h-5" />,
    'Gaming Consoles': <Gamepad2 className="w-5 h-5" />,
    Monitors: <Monitor className="w-5 h-5" />,
    Televisions: <Tv className="w-5 h-5" />,
    'Smart Watches': <Watch className="w-5 h-5" />,
    Cameras: <Camera className="w-5 h-5" />,
    Printers: <Printer className="w-5 h-5" />,
  };

  const categories = [
    { _id: null, name: 'All Categories', icon: <Sparkles className="w-5 h-5" />, count: '∞' },
    ...categoriesData.map(cat => ({
      ...cat,
      icon: categoryIcons[cat.name] || <Monitor className="w-5 h-5" />,
      count: Math.floor(Math.random() * 50) + 10
    })),
  ];

  const { data, isLoading, error, refetch } = useGetApprovedProductsQuery({
    category: category ? category : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    search: searchQuery,
    page,
    limit: 12,
  });

  // Debugging: Log API response and error
  useEffect(() => {
    console.log('API Response:', data);
    if (error) {
      console.error('API Error:', error);
    }
  }, [data, error]);

  const { data: suggestions } = useGetSearchSuggestionsQuery(searchQuery, {
    skip: !searchQuery,
  });

  useEffect(() => {
    if (isClient) {
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, [isClient]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (category) params.set('category', category);
    params.set('sort', sort);
    params.set('minPrice', priceRange[0].toString());
    params.set('maxPrice', priceRange[1].toString());
    params.set('view', view);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchQuery, category, sort, priceRange, view, page, router]);

  useEffect(() => {
    if (data?.totalPages && page > data.totalPages) {
      setPage(1);
    }
  }, [data, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory(null);
    setPriceRange([0, 500000]);
    setSort('name');
    setPage(1);
    refetch();
  };

  const buildUrl = (path) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (!path) return '/placeholder-product.png';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path;
    return `${API_BASE}/${path.replace(/\\/g, '/')}`;
  };

  const Input = ({ className = '', placeholder, value, onChange, ...props }) => (
    <input
      className={`
        w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl
        focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300
        placeholder-gray-400 text-gray-900 shadow-sm hover:shadow-md
        ${className}
      `}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );

  const Button = ({ 
    children, 
    variant = 'default', 
    className = '', 
    onClick, 
    disabled = false,
    ...props 
  }) => {
    const baseStyles = `
      inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold
      transition-all duration-300 transform hover:scale-105 active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      ${className}
    `;
    
    const variants = {
      default: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl',
      outline: 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 shadow-md hover:shadow-lg',
      ghost: 'bg-transparent text-gray-600 hover:bg-white/50 hover:shadow-md',
      secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-xl'
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]}`}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  };

  const Select = ({ value, onValueChange, children, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={selectRef}>
        <div
          className="
            w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl
            cursor-pointer shadow-md hover:shadow-lg transition-all duration-300
            flex items-center justify-between
          "
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-700">{value || 'Sort by...'}</span>
          <ChevronLeft className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? '-rotate-90' : 'rotate-0'}`} />
        </div>
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-lg border border-gray-200/60 shadow-2xl overflow-hidden">
            {children}
          </div>
        )}
      </div>
    );
  };

  const SelectTrigger = ({ children, ...props }) => <div {...props}>{children}</div>;
  const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
  const SelectContent = ({ children }) => <div>{children}</div>;
  const SelectItem = ({ value, children, onClick }) => (
    <div
      className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer transition-colors duration-200 border-b border-gray-100/60 last:border-b-0"
      onClick={() => {
        onClick?.();
        setTimeout(() => document.dispatchEvent(new MouseEvent('mousedown')), 100);
      }}
    >
      {children}
    </div>
  );

  const Slider = ({ value, onValueChange, min, max, step, className }) => {
    const handleChange = (e, index) => {
      const newValue = [...value];
      newValue[index] = parseInt(e.target.value);
      onValueChange(newValue);
    };

    return (
      <div className={`space-y-6 ${className}`}>
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={(e) => handleChange(e, 0)}
            className="
              absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-600 [&::-webkit-slider-thumb]:to-purple-600
              [&::-webkit-slider-thumb]:shadow-lg
            "
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[1]}
            onChange={(e) => handleChange(e, 1)}
            className="
              absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-600 [&::-webkit-slider-thumb]:to-purple-600
              [&::-webkit-slider-thumb]:shadow-lg
            "
          />
        </div>
      </div>
    );
  };

  const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
      default: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border border-blue-200/50',
      secondary: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 border border-gray-200/50',
      destructive: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 border border-red-200/50'
    };

    return (
      <span className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm
        ${variants[variant]} ${className}
      `}>
        {children}
      </span>
    );
  };

  const Skeleton = ({ className = '' }) => (
    <div className={`
      bg-gradient-to-r from-gray-200/50 to-gray-300/50 animate-pulse rounded-2xl
      ${className}
    `} />
  );

  const showToast = (title, description, variant = 'default') => {
    console.log(`Toast: ${title} - ${description}`);
  };

  // Handle API response structure
  const products = Array.isArray(data) ? data : data?.products || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10">
      <FloatingParticles />
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2%, transparent 2.5%),
                            radial-gradient(circle at 75% 75%, white 1%, transparent 1.5%)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl mb-6 border border-white/30"
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Premium Collection</span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
          >
            Discover
            <span className="block bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Amazing Products
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Explore our carefully curated collection of premium products designed to elevate your lifestyle
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6"
        >
          <div className="relative w-full md:w-96 flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                ref={searchInputRef}
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 text-lg py-4 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <AnimatePresence>
              {suggestions?.length > 0 && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-2xl rounded-2xl overflow-hidden"
                >
                  {suggestions.slice(0, 5).map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-6 py-4 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100/60 last:border-b-0 transition-all duration-300 group"
                      onClick={() => setSearchQuery(product.name)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Search className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">in {product.category?.name || 'Products'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden shadow-lg"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              <Badge variant="secondary" className="ml-2">
                {category && '1'}
                {priceRange[0] > 0 || priceRange[1] < 500000 ? '+1' : ''}
              </Badge>
            </Button>
            <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/60">
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                onClick={() => setView('grid')}
                className="p-3 rounded-xl"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                onClick={() => setView('list')}
                className="p-3 rounded-xl"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AnimatePresence>
            {(isFilterOpen || !isMobile) && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="lg:w-72"
              >
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-2xl sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-900">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Filters
                      </span>
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-sm"
                      >
                        Clear All
                      </Button>
                      {isMobile && (
                        <Button
                          variant="ghost"
                          onClick={() => setIsFilterOpen(false)}
                          className="p-2"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Categories</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {categoriesLoading ? (
                        <div className="space-y-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center p-3 rounded-xl bg-gray-100/50 animate-pulse">
                              <div className="w-8 h-8 bg-gray-300 rounded-lg mr-3"></div>
                              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        categories.map((cat, i) => (
                          <motion.div
                            key={cat._id || 'all'}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              onClick={() => {
                                setCategory(cat._id);
                                setPage(1);
                              }}
                              className={`group flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer
                                ${category === cat._id 
                                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 shadow-lg'
                                  : 'bg-gray-50/80 hover:bg-white border-l-4 border-transparent hover:border-gray-300 hover:shadow-md'}`}
                            >
                              <div className={`p-2 rounded-lg mr-3 transition-all duration-300
                                ${category === cat._id 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                {cat.icon}
                              </div>
                              <span className={`font-medium transition-colors duration-300 flex-1
                                ${category === cat._id 
                                  ? 'text-blue-700 font-semibold'
                                  : 'text-gray-700 hover:text-blue-600'}`}>
                                {cat.name}
                              </span>
                              {category === cat._id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="ml-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                />
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                  <motion.div 
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-white/50 shadow-xl mb-6"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm font-semibold text-gray-700">
                        <span>₨{priceRange[0].toLocaleString()}</span>
                        <span>₨{priceRange[1].toLocaleString()}</span>
                      </div>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={500000}
                        step={1000}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min: ₨0</span>
                        <span>Max: ₨500,000</span>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-white/50 shadow-xl"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-3">Sort By</h3>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name" onClick={() => setSort('name')}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">A</span>
                            </div>
                            <span className="text-sm">Name A-Z</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="price-low" onClick={() => setSort('price-low')}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-sm">₨</span>
                            </div>
                            <span className="text-sm">Price: Low to High</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="price-high" onClick={() => setSort('price-high')}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-semibold text-sm">₨</span>
                            </div>
                            <span className="text-sm">Price: High to Low</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <motion.div 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-2">
                  {isLoading || categoriesLoading ? 'Discovering Products...' : `${products.length} Amazing Products${searchQuery ? ` for "${searchQuery}"` : ''}`}
                </h2>
                {!isLoading && products.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    Carefully curated selection of premium products
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={refetch}
                className="shadow-lg hover:shadow-xl text-sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh Results
              </Button>
            </motion.div>

            {isLoading || categoriesLoading ? (
              <div className={view === 'list' 
                ? 'grid grid-cols-1 gap-6' 
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}
              >
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={view === 'list' 
                ? 'grid grid-cols-1 gap-6' 
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}
              >
                <AnimatePresence>
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ y: 30, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                    >
                      <ProductCard product={product} view={view} onView={() => setViewProduct(product)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">No Products Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm">
                  We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button onClick={clearFilters} className="shadow-lg text-sm">
                  Clear All Filters
                </Button>
              </motion.div>
            )}

            {totalPages > 1 && (
              <motion.div 
                className="flex justify-center items-center gap-3 mt-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-xl shadow-lg text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10 rounded-xl shadow-lg text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="flex items-center px-1 text-gray-500 text-sm">...</span>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 rounded-xl shadow-lg text-sm"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-xl shadow-lg text-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{viewProduct.name}</h2>
              <button
                onClick={() => setViewProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                <div>
                  <div className="rounded-xl overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={buildUrl(viewProduct.image)}
                      alt={viewProduct.name}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{viewProduct.description || 'No description available.'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm text-gray-500">Price</span>
                        <p className="text-xl font-bold text-blue-600">{viewProduct.price} PKR</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status</span>
                        <p className={`font-medium ${viewProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {viewProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Category</span>
                        <p className="font-medium">{viewProduct.category?.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Seller</span>
                        <p className="font-medium">{viewProduct.seller?.user?.name || viewProduct.seller?.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                        Add to Cart
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}