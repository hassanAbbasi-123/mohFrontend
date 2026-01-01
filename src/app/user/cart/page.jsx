// "use client"

// import { useState } from "react"
// import Image from "next/image"
// import { useRouter } from "next/navigation"
// import {
//   Minus,
//   Plus,
//   X,
//   ShoppingBag,
//   Truck,
//   Shield,
//   ArrowRight,
//   CreditCard,
//   Zap,
// } from "lucide-react"
// import {
//   useGetCartQuery,
//   useUpdateCartItemMutation,
//   useRemoveCartItemMutation,
//   useApplyCouponMutation,
//   useRemoveCouponMutation,
// } from "@/store/features/cartApi"
// import { useCreateOrderMutation } from "@/store/features/orderApi"
// import ProtectedRoute from "@/components/auth/ProtectedRoute"

// // ✅ Helper function to safely build image URLs
// const buildUrl = (path) => {
//   if (!path) return "/placeholder.png"
//   if (path.startsWith("http")) return path
//   return `http://localhost:5000/${path.replace(/\\/g, "/")}`
// }

// // Shipping Address Modal Component
// const ShippingAddressModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
//   const [formData, setFormData] = useState({
//     street: "",
//     city: "",
//     zip: "",
//     country: "",
//     phone: ""
//   })

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     onSubmit(formData)
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-md">
//         <h2 className="text-xl font-bold text-blue-900 mb-4">Shipping Address</h2>
//         <p className="text-blue-700 mb-6">Please provide your complete shipping address to continue.</p>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-blue-700 mb-1">Street Address</label>
//             <input
//               type="text"
//               name="street"
//               value={formData.street}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Enter street address"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-blue-700 mb-1">City</label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Enter city"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-blue-700 mb-1">ZIP Code</label>
//             <input
//               type="text"
//               name="zip"
//               value={formData.zip}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Enter ZIP code"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-blue-700 mb-1">Country</label>
//             <input
//               type="text"
//               name="country"
//               value={formData.country}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Enter country"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-blue-700 mb-1">Phone Number</label>
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Enter phone number"
//             />
//           </div>
          
//           <div className="flex gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading || !formData.street || !formData.city || !formData.zip || !formData.country || !formData.phone}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
//             >
//               {isLoading ? "Processing..." : "Continue to Checkout"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default function Cart() {
//   const [promoCode, setPromoCode] = useState("")
//   const [errorMessage, setErrorMessage] = useState("")
//   const [successMessage, setSuccessMessage] = useState("")
//   const [isCreatingOrder, setIsCreatingOrder] = useState(false)
//   const [showAddressModal, setShowAddressModal] = useState(false)
//   const [shippingAddress, setShippingAddress] = useState(null)
//   const router = useRouter()

//   // hooks
//   const { data, isLoading, isError, refetch } = useGetCartQuery()
//   const [updateCartItem] = useUpdateCartItemMutation()
//   const [removeCartItem] = useRemoveCartItemMutation()
//   const [applyCoupon] = useApplyCouponMutation()
//   const [removeCoupon] = useRemoveCouponMutation()
//   const [createOrder] = useCreateOrderMutation()

  
//   const fmt = (n) => {
//     if (isNaN(n)) n = 0;
//     return `INR ${n.toLocaleString('en-INR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
//   }

//   // Update quantity - FIXED: Pass data in request body
//   const updateQuantity = async (cartItemId, newQty) => {
//     if (newQty < 1) return
//     try {
//       setErrorMessage("")
//       await updateCartItem({ cartItemId, quantity: newQty }).unwrap()
//       // Refetch cart data to get the latest state
//       refetch()
//     } catch (err) {
//       const errorMsg = err?.data?.message || "Failed to update quantity"
//       console.error("Update quantity error:", errorMsg)
//       setErrorMessage(errorMsg)
//       setTimeout(() => setErrorMessage(""), 3000)
//     }
//   }

//   // Remove item from cart - FIXED: Pass data in request body
//   const removeItem = async (cartItemId) => {
//     try {
//       setErrorMessage("")
//       await removeCartItem({ cartItemId }).unwrap()
//       // Refetch cart data to get the latest state
//       refetch()
//     } catch (err) {
//       const errorMsg = err?.data?.message || "Failed to remove item"
//       console.error("Remove item error:", errorMsg)
//       setErrorMessage(errorMsg)
//       setTimeout(() => setErrorMessage(""), 3000)
//     }
//   }

//   const handleApplyCoupon = async () => {
//     if (!promoCode.trim()) {
//       setErrorMessage("Please enter a promo code");
//       setTimeout(() => setErrorMessage(""), 3000);
//       return;
//     }
    
//     try {
//       setErrorMessage("");
//       setSuccessMessage("");
//       console.log("🔄 Applying coupon:", promoCode);
      
//       // Log the full request details
//       console.log("Request details:", {
//         url: "/cart/user/apply-coupon",
//         method: "POST",
//         body: { code: promoCode }
//       });
      
//       const result = await applyCoupon({ code: promoCode }).unwrap();
//       console.log("✅ Coupon applied successfully:", result);
      
//       // Check if the response contains the expected data
//       if (result.cart && result.cart.coupon) {
//         console.log("🎯 Coupon found in response:", result.cart.coupon);
//       } else {
//         console.warn("⚠️  No coupon data in response:", result);
//       }
      
//       setPromoCode("");
//       setSuccessMessage(result.message || "Coupon applied successfully!");
//       setTimeout(() => setSuccessMessage(""), 3000);
      
//       // Force a complete refetch of cart data
//       setTimeout(() => {
//         console.log("🔄 Refetching cart data...");
//         refetch();
//       }, 500);
      
//     } catch (err) {
//       console.error("❌ Apply coupon error:", err);
//       console.error("Error status:", err?.status);
//       console.error("Error data:", err?.data);
//       console.error("Full error object:", JSON.stringify(err, null, 2));
      
//       const errorMsg = err?.data?.message || 
//                       err?.data?.error || 
//                       err?.error || 
//                       "Failed to apply coupon. Please check the code and try again.";
      
//       setErrorMessage(errorMsg);
//       setTimeout(() => setErrorMessage(""), 5000);
//     }
//   }

//   const handleRemoveCoupon = async () => {
//     try {
//       setErrorMessage("")
//       setSuccessMessage("")
//       await removeCoupon().unwrap()
//       setSuccessMessage("Coupon removed successfully!")
//       setTimeout(() => setSuccessMessage(""), 3000)
//       // Refetch cart data to get the latest state
//       refetch()
//     } catch (err) {
//       const errorMsg = err?.data?.message || "Failed to remove coupon"
//       console.error("Remove coupon error:", errorMsg)
//       setErrorMessage(errorMsg)
//       setTimeout(() => setErrorMessage(""), 3000)
//     }
//   }

//   // Handle checkout button click - show address modal
//   const handleCheckoutClick = () => {
//     setShowAddressModal(true)
//   }

//   // Handle address submission and create order
//   const handleAddressSubmit = async (addressData) => {
//     try {
//       setIsCreatingOrder(true);
//       setErrorMessage("");
      
//       // Prepare order data
//       const orderData = {
//         shippingAddress: addressData,
//         notes: "",
//         couponCodes: data?.coupon ? [data.coupon.code] : [],
//         itemAddresses: []
//       };
      
//       console.log("🔄 Creating order with data:", orderData);
      
//       // Create the order
//       const result = await createOrder(orderData).unwrap();
//       console.log("✅ Order created successfully:", result);
      
//       // Close modal and navigate to order screen on success
//       setShowAddressModal(false);
//       router.push("/user/user-orders");
      
//     } catch (err) {
//       console.error("❌ Create order error:", err);
//       console.error("Error status:", err?.status);
//       console.error("Error data:", err?.data);
      
//       const errorMsg = err?.data?.message || 
//                       err?.data?.error || 
//                       err?.error || 
//                       "Failed to create order. Please try again.";
      
//       setErrorMessage(errorMsg);
//       setTimeout(() => setErrorMessage(""), 5000);
//     } finally {
//       setIsCreatingOrder(false);
//     }
//   }

//   // loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-blue-700">Loading your cart...</p>
//       </div>
//     )
//   }

//   // error state
//   if (isError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-red-600">Failed to load cart.</p>
//       </div>
//     )
//   }

//   // normalize cart data
//   const cartItems = data?.items || []
//   const subtotal = cartItems.reduce((sum, item) => {
//     const unit = item.price ?? item.product?.price ?? 0
//     const qty = item.quantity ?? 0
//     return sum + unit * qty
//   }, 0)
//   const savings = data?.discount ?? 0
//   const shipping = subtotal > 50 ? 0 : 9.99
//   const tax = subtotal * 0.08
//   const total = subtotal + shipping + tax - savings

//   return (
//     <ProtectedRoute allowedRoles={["user"]}>
//       {errorMessage && (
//         <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
//           {errorMessage}
//         </div>
//       )}
      
//       {successMessage && (
//         <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 max-w-md">
//           {successMessage}
//         </div>
//       )}
      
//       {/* Shipping Address Modal */}
//       <ShippingAddressModal
//         isOpen={showAddressModal}
//         onClose={() => setShowAddressModal(false)}
//         onSubmit={handleAddressSubmit}
//         isLoading={isCreatingOrder}
//       />
      
//       {cartItems.length === 0 ? (
//         <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center px-4">
//           <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl">
//             <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
//               <ShoppingBag className="w-8 h-8 text-blue-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-blue-900 mb-2">Your cart is empty</h2>
//             <p className="text-blue-700 mb-6">
//               Add some products to get started with your shopping
//             </p>
//             <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-6xl mx-auto">
//             <div className="flex items-center justify-between mb-8">
//               <h1 className="text-3xl font-bold text-blue-900">Shopping Cart</h1>
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
//                 {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
//               </span>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               {/* LEFT */}
//               <div className="lg:col-span-2 space-y-6">
//                 {cartItems.map((item) => {
//                   const product = item.product || {}
//                   return (
//                     <div
//                       key={item._id}
//                       className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-all hover:shadow-xl"
//                     >
//                       <div className="flex gap-6">
//                         <div className="relative">
//                           <div className="w-24 h-24 bg-blue-50 rounded-xl overflow-hidden">
//                             <Image
//                               src={buildUrl(product.image)}
//                               alt={product.name || "product"}
//                               width={96}
//                               height={96}
//                               className="object-cover"
//                             />
//                           </div>
//                           {item.isHot && (
//                             <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
//                               <Zap size={10} className="fill-white" /> HOT
//                             </div>
//                           )}
//                         </div>

//                         <div className="flex-1">
//                           <div className="flex justify-between items-start mb-2">
//                             <h3 className="font-semibold text-blue-900 text-lg">
//                               {product.name}
//                             </h3>
//                             <button
//                               onClick={() => removeItem(item._id)}
//                               className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700 transition-colors"
//                             >
//                               <X size={18} />
//                             </button>
//                           </div>

//                           <div className="flex items-center gap-2 mb-3">
//                             {product.inStock ? (
//                               <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-medium">
//                                 In Stock
//                               </span>
//                             ) : (
//                               <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md font-medium">
//                                 Out of Stock
//                               </span>
//                             )}
//                           </div>

//                           <div className="flex items-center gap-3 mb-4">
//                             <span className="font-bold text-blue-900 text-lg">
//                               {fmt(item.price ?? product.price ?? 0)}
//                             </span>
//                           </div>

//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-1">
//                               <button
//                                 onClick={() =>
//                                   updateQuantity(item._id, (item.quantity ?? 1) - 1)
//                                 }
//                                 disabled={(item.quantity ?? 1) <= 1}
//                                 className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
//                               >
//                                 <Minus size={16} />
//                               </button>
//                               <span className="w-8 text-center font-semibold text-blue-900">
//                                 {item.quantity}
//                               </span>
//                               <button
//                                 onClick={() =>
//                                   updateQuantity(item._id, (item.quantity ?? 1) + 1)
//                                 }
//                                 className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-700 shadow-sm"
//                               >
//                                 <Plus size={16} />
//                               </button>
//                             </div>
//                             <div className="font-bold text-blue-900">
//                               {fmt(
//                                 (item.price ?? product.price ?? 0) *
//                                   (item.quantity ?? 0)
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )
//                 })}

//                 {/* Promo Code */}
//                 <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
//                   <h3 className="font-semibold text-blue-900 text-lg mb-4">
//                     Promo Code
//                   </h3>
//                   <div className="flex gap-3">
//                     <input
//                       type="text"
//                       placeholder="Enter promo code"
//                       value={promoCode}
//                       onChange={(e) => setPromoCode(e.target.value)}
//                       className="flex-1 px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                     <button
//                       onClick={handleApplyCoupon}
//                       disabled={!promoCode.trim()}
//                       className="px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
//                     >
//                       Apply
//                     </button>
//                     {data?.coupon && (
//                       <button
//                         onClick={handleRemoveCoupon}
//                         className="px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                   {data?.coupon && (
//                     <p className="text-sm text-green-600 mt-3">
//                       Applied coupon: <span className="font-semibold">{data.coupon.code}</span>
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* RIGHT */}
//               <div className="space-y-6">
//                 <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 sticky top-6">
//                   <h2 className="font-bold text-blue-900 text-xl mb-6 pb-4 border-b border-blue-100">
//                     Order Summary
//                   </h2>

//                   <div className="space-y-4 mb-6">
//                     <div className="flex justify-between">
//                       <span className="text-blue-700">Subtotal</span>
//                       <span className="font-semibold text-blue-900">
//                         {fmt(subtotal)}
//                       </span>
//                     </div>

//                     {savings > 0 && (
//                       <div className="flex justify-between text-green-600">
//                         <span>Savings</span>
//                         <span className="font-semibold">-{fmt(savings)}</span>
//                       </div>
//                     )}

//                     <div className="flex justify-between">
//                       <span className="text-blue-700">Shipping</span>
//                       <span className="font-semibold text-blue-900">
//                         {shipping === 0 ? "Free" : fmt(shipping)}
//                       </span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span className="text-blue-700">Tax</span>
//                       <span className="font-semibold text-blue-900">{fmt(tax)}</span>
//                     </div>
//                   </div>

//                   <div className="flex justify-between items-center mb-6 pt-4 border-t border-blue-100">
//                     <span className="font-bold text-blue-900 text-lg">Total</span>
//                     <span className="font-bold text-blue-900 text-xl">
//                       {fmt(total)}
//                     </span>
//                   </div>

//                   <button 
//                     onClick={handleCheckoutClick}
//                     className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
//                   >
//                     <CreditCard size={20} />
//                     Proceed to Checkout
//                     <ArrowRight size={20} />
//                   </button>
//                 </div>

//                 <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                         <Truck size={20} className="text-blue-600" />
//                       </div>
//                       <span className="text-blue-800">
//                         Free shipping on orders over RS 50
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                         <Shield size={20} className="text-blue-600" />
//                       </div>
//                       <span className="text-blue-800">100% secure checkout</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* END RIGHT */}
//             </div>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   )
// }