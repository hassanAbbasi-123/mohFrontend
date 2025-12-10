"use client";
import { useState, useEffect } from "react";
const ProductForm = ({ product, categories, onSubmit, onCancel }) => {
  const isEditing = !!product;
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    features: "",
    attributes: "",
    weight: "",
    dimensions: "",
    unit: "",
    category: "",
    variety: "",
    isOrganic: false,
    harvestDate: "",
    bestBefore: "",
    storageInstructions: "",
    price: "",
    originalPrice: "",
    discount: "",
    quantity: "",
    minOrderQuantity: "",
    inStock: true,
    isOnSale: false,
    isSeasonal: false,
    lowStockThreshold: "",
    lastStockUpdate: "",
  });
  const [image, setImage] = useState(null);
  const [newGallery, setNewGallery] = useState([]);
  const [keptGallery, setKeptGallery] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [allPreviews, setAllPreviews] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  useEffect(() => {
    if (product) {
      // Convert JSON features/attributes to comma-separated strings for display
      const featuresValue = product.features
        ? (Array.isArray(product.features) ? product.features.join(", ") : JSON.stringify(product.features))
        : "";
      
      const attributesValue = product.attributes
        ? (typeof product.attributes === "object" ? Object.entries(product.attributes)
            .map(([key, value]) => `${key}:${value}`).join(", ") : product.attributes)
        : "";
      const dimensionsValue = product.dimensions
        ? JSON.stringify(product.dimensions)
        : "";
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        features: featuresValue,
        attributes: attributesValue,
        weight: product.weight || "",
        dimensions: dimensionsValue,
        unit: product.unit || "",
        category: product.category || "",
        variety: product.variety || "",
        isOrganic: product.isOrganic || false,
        harvestDate: product.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : "",
        bestBefore: product.bestBefore ? new Date(product.bestBefore).toISOString().split('T')[0] : "",
        storageInstructions: product.storageInstructions || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        discount: product.discount || "",
        quantity: product.quantity || "",
        minOrderQuantity: product.minOrderQuantity || "",
        inStock: product.inStock || true,
        isOnSale: product.isOnSale || false,
        isSeasonal: product.isSeasonal || false,
        lowStockThreshold: product.lowStockThreshold || "",
        lastStockUpdate: product.lastStockUpdate ? new Date(product.lastStockUpdate).toISOString().split('T')[0] : "",
      });
     
      if (product.image) {
        setImagePreview(product.image);
      }
      setKeptGallery(product.gallery || []);
      setAllPreviews(product.gallery || []);
      setNewPreviews([]);
      setNewGallery([]);
      setRemoveImage(false);
    }
  }, [product]);
  // Convert comma-separated values to JSON format
  const convertToJson = (value, type) => {
    if (!value.trim()) return "";
   
    if (type === "features") {
      // Split by commas and trim each value
      const featuresArray = value.split(',')
        .map(item => item.trim())
        .filter(item => item !== "");
     
      return JSON.stringify(featuresArray);
    } else if (type === "attributes") {
      const attributesObj = {};
     
      // Split by commas and process each key:value pair
      value.split(',')
        .map(item => item.trim())
        .filter(item => item !== "")
        .forEach(item => {
          const colonIndex = item.indexOf(':');
          if (colonIndex !== -1) {
            const key = item.substring(0, colonIndex).trim();
            const val = item.substring(colonIndex + 1).trim();
            if (key) {
              attributesObj[key] = val;
            }
          }
        });
     
      return Object.keys(attributesObj).length > 0 ? JSON.stringify(attributesObj) : "";
    }
   
    return "";
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setNewGallery(files);
    if (files.length > 0) {
      const previewsPromises = files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }));
      Promise.all(previewsPromises).then(newP => {
        setNewPreviews(newP);
        setAllPreviews([...keptGallery, ...newP]);
      });
    } else {
      setNewPreviews([]);
      setAllPreviews(keptGallery);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
   
    // Process all form data, converting features and attributes to JSON
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== "" && formData[key] !== null) {
        if (key === "features" || key === "attributes") {
          const jsonValue = convertToJson(formData[key], key);
          if (jsonValue) {
            submitData.append(key, jsonValue);
          }
        } else if (key === "dimensions") {
          try {
            const parsedDimensions = JSON.parse(formData[key]);
            submitData.append(key, JSON.stringify(parsedDimensions));
          } catch (e) {
            submitData.append(key, formData[key]);
          }
        } else {
          submitData.append(key, formData[key]);
        }
      }
    });
    if (isEditing) {
      if (removeImage) {
        submitData.append('removeImage', 'true');
      }
      submitData.append('keptGallery', JSON.stringify(keptGallery));
    }
    if (image) submitData.append("image", image);
    newGallery.forEach((file) => submitData.append("gallery", file));
    onSubmit(submitData);
  };
  const removeGalleryImage = (index) => {
    const wasExisting = index < keptGallery.length;
    let newKept = [...keptGallery];
    let newGalleryFiles = [...newGallery];
    let newNewPreviews = [...newPreviews];
    if (wasExisting) {
      newKept.splice(index, 1);
      setKeptGallery(newKept);
    } else {
      const newIdx = index - keptGallery.length;
      newGalleryFiles.splice(newIdx, 1);
      setNewGallery(newGalleryFiles);
      newNewPreviews.splice(newIdx, 1);
      setNewPreviews(newNewPreviews);
    }
    const newAllPreviews = [...allPreviews];
    newAllPreviews.splice(index, 1);
    setAllPreviews(newAllPreviews);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800">
              {product ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="SEO-friendly slug (auto-generated if empty)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    placeholder="Provide a detailed product description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Variety</label>
                    <input
                      type="text"
                      name="variety"
                      value={formData.variety}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Alphonso for mangoes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:16px]"
                      required
                    >
                      <option value="">Select Unit</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="piece">piece</option>
                      <option value="bunch">bunch</option>
                      <option value="dozen">dozen</option>
                      <option value="liter">liter</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (g/kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem] bg-[length:16px]"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories?.map((cat) => (
                        <optgroup key={cat._id} label={cat.name}>
                          {cat.subcategories?.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensions (JSON)</label>
                  <textarea
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder='{"length": 10, "width": 5, "height": 3}'
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter as JSON object (optional)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isOrganic"
                        checked={formData.isOrganic}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm font-semibold text-gray-700">Organic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isSeasonal"
                        checked={formData.isSeasonal}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm font-semibold text-gray-700">Seasonal</span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Harvest Date</label>
                      <input
                        type="date"
                        name="harvestDate"
                        value={formData.harvestDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Best Before *</label>
                      <input
                        type="date"
                        name="bestBefore"
                        value={formData.bestBefore}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Instructions</label>
                  <textarea
                    name="storageInstructions"
                    value={formData.storageInstructions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Refrigerate at 4°C"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">RS</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">RS</span>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Available quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order Quantity</label>
                    <input
                      type="number"
                      name="minOrderQuantity"
                      value={formData.minOrderQuantity}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0.25"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Low Stock Threshold</label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm font-semibold text-gray-700">In Stock</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-semibold text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Main Image</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 transition-all duration-200 bg-gray-50 hover:bg-gray-100">
                      {imagePreview ? (
                        <div className="relative w-full h-full p-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                              setRemoveImage(true);
                            }}
                            className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 font-medium"><span className="text-blue-500">Upload image</span> or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 transition-all duration-200 bg-gray-50 hover:bg-gray-100 p-5">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <p className="mb-1 text-sm text-gray-500 font-medium"><span className="text-blue-500">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400">Multiple images supported</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                 
                  {allPreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {allPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Gallery preview ${index}`}
                            className="h-20 w-full object-cover rounded-xl border shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
                <div className="relative">
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                  <div className="absolute bottom-3 right-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-lg">
                    Comma Separated
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter features separated by commas</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Attributes</label>
                <div className="relative">
                  <textarea
                    name="attributes"
                    value={formData.attributes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="color:red, size:large, weight:2kg"
                  />
                  <div className="absolute bottom-3 right-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-lg">
                    Key:Value Pairs
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter attributes as key:value pairs separated by commas</p>
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
              >
                {product ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProductForm;