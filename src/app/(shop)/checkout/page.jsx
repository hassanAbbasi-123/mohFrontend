'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetCartQuery, useClearCartMutation } from '@/store/features/cartApi';
import { useCreateOrderMutation } from '@/store/features/orderApi';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData, isLoading: cartLoading, error: cartError } = useGetCartQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [clearCart] = useClearCartMutation();

  const [user, setUser] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newAddress, setNewAddress] = useState({
    street: '',
    area: '',
    city: 'Karachi',
    province: 'Sindh',
    postalCode: '',
    country: 'Pakistan'
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [error, setError] = useState('');

  // Load user data from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setPhoneNumber(parsedUser.phone || '');
        
        // Set default address
        if (parsedUser.addresses && parsedUser.addresses.length > 0) {
          const defaultAddress = parsedUser.addresses.find(addr => addr.isDefault) || parsedUser.addresses[0];
          setSelectedAddress(defaultAddress);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setError('Failed to load user data');
      }
    } else {
      setError('Please login to proceed with checkout');
      router.push('/auth/login');
    }
  }, [router]);

  const pakistaniCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 
    'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sukkur'
  ];

  const pakistaniProvinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan'];

  // Calculate order totals
  const subtotal = cartData?.cartTotal || 0;
  const discount = cartData?.discount || 0;
  const deliveryFee = subtotal > 2000 ? 0 : 150;
  const total = subtotal - discount + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate cart
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Validate phone number
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    // Validate address
    let shippingAddress;
    if (selectedAddress) {
      shippingAddress = {
        street: selectedAddress.street || '',
        area: selectedAddress.area || '',
        city: selectedAddress.city || '',
        province: selectedAddress.province || '',
        postalCode: selectedAddress.postalCode || '',
        country: selectedAddress.country || 'Pakistan',
        phone: phoneNumber
      };
    } else if (showNewAddressForm) {
      if (!newAddress.street.trim() || !newAddress.area.trim() || !newAddress.city.trim() || !newAddress.province.trim()) {
        setError('Please fill all required address fields');
        return;
      }
      shippingAddress = {
        street: newAddress.street,
        area: newAddress.area,
        city: newAddress.city,
        province: newAddress.province,
        postalCode: newAddress.postalCode || '',
        country: newAddress.country || 'Pakistan',
        phone: phoneNumber
      };
    } else {
      setError('Please select or add a shipping address');
      return;
    }

    // Validate complete address
    if (!shippingAddress.street || !shippingAddress.area || !shippingAddress.city || !shippingAddress.province) {
      setError('Complete shipping address is required');
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        items: cartData.items.map(item => ({
          product: item.product._id,
          seller: item.Seller._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        subtotal: subtotal,
        discount: discount,
        deliveryFee: deliveryFee,
        total: total,
        coupon: cartData.coupon?._id || null
      };

      console.log('Order data being sent:', orderData);

      // Create order
      const result = await createOrder(orderData).unwrap();
      
      if (result.success) {
        // Clear cart after successful order
        try {
          await clearCart().unwrap();
        } catch (clearError) {
          console.error('Error clearing cart:', clearError);
          // Continue even if cart clearing fails
        }

        // Redirect to order confirmation page
        router.push(`/order/confirmation/${result.order._id}`);
      } else {
        setError(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      // More detailed error handling
      if (error.data) {
        if (error.data.message) {
          setError(error.data.message);
        } else if (error.data.errors) {
          // Handle validation errors from backend
          const validationErrors = Object.values(error.data.errors).join(', ');
          setError(validationErrors);
        } else {
          setError('Failed to create order. Please try again.');
        }
      } else {
        setError('Failed to create order. Please try again.');
      }
    }
  };

  // Show loading state
  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/shop/cart"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading your cart...</span>
        </div>
      </div>
    );
  }

  // Show error if cart is empty
  if (cartError || !cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/shop/cart"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">
            {cartError ? 'Failed to load cart' : 'Your cart is empty'}
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/shop/cart"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm font-medium">{error}</div>
          <div className="text-red-600 text-xs mt-1">
            Please check your shipping address and try again.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Shipping & Payment Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll contact you for delivery confirmation
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h2>

            {/* Existing Addresses */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Saved Addresses</h3>
                <div className="space-y-3">
                  {user.addresses.map((address) => (
                    <label
                      key={address._id || address.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?._id === address._id || selectedAddress?.id === address.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?._id === address._id || selectedAddress?.id === address.id}
                        onChange={() => {
                          setSelectedAddress(address);
                          setShowNewAddressForm(false);
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{address.type || 'home'}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.street}, {address.area}<br />
                            {address.city}, {address.province} {address.postalCode}<br />
                            {address.country || 'Pakistan'}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAddressForm(true);
                    setSelectedAddress(null);
                  }}
                  className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  + Add new address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">
                  {user?.addresses?.length ? 'New Address' : 'Delivery Address'}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    placeholder="House/Flat No, Street Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area/Locality *
                  </label>
                  <input
                    type="text"
                    value={newAddress.area}
                    onChange={(e) => setNewAddress({...newAddress, area: e.target.value})}
                    placeholder="Area, Locality"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      {pakistaniCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      value={newAddress.province}
                      onChange={(e) => setNewAddress({...newAddress, province: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      {pakistaniProvinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Currently we only deliver within Pakistan
                  </p>
                </div>
              </div>
            )}

            {/* Show message if no addresses and not showing form */}
            {(!user?.addresses || user.addresses.length === 0) && !showNewAddressForm && (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">No saved addresses found</p>
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Add your delivery address
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>

            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <div className="ml-4">
                  <div className="font-medium text-gray-900">Cash on Delivery</div>
                  <div className="text-sm text-gray-600">Pay when your order arrives</div>
                  <div className="text-xs text-green-600 mt-1">✓ Most Popular</div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  disabled
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <div className="ml-4">
                  <div className="font-medium text-gray-900">Card Payment</div>
                  <div className="text-sm text-gray-600">Coming soon</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cartData.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="hidden items-center justify-center text-gray-400">
                      <Truck className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name || 'Product'}
                    </p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-xs text-gray-500">
                      Seller: {item.Seller?.storeName || 'Unknown'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Rs.{((item.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>Rs.{subtotal.toLocaleString()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>- Rs.{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    `Rs.${deliveryFee}`
                  )}
                </span>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>Rs.{total.toLocaleString()}</span>
              </div>

              {cartData.coupon && (
                <div className="text-xs text-green-600 text-center mt-2">
                  Coupon applied: {cartData.coupon.code}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreatingOrder || !user || (!selectedAddress && !showNewAddressForm)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isCreatingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>2-5 days delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-600">✓</span>
                <span>Secure checkout</span>
              </div>
            </div>

            {/* Validation message */}
            {(!selectedAddress && !showNewAddressForm) && (
              <div className="mt-3 text-xs text-red-600 text-center">
                Please add a shipping address to continue
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}