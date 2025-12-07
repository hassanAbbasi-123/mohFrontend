// components/layout/CartSidebar.jsx
'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from '@/store/features/cartApi'

const CartSidebar = ({ isOpen, onClose }) => {
  const { data: cart, isLoading, error, refetch } = useGetCartQuery(undefined, {
    skip: !isOpen
  })
  const [updateCartItem] = useUpdateCartItemMutation()
  const [removeCartItem] = useRemoveCartItemMutation()
  const [clearCart] = useClearCartMutation()

  // Refetch cart when sidebar opens
  useEffect(() => {
    if (isOpen) {
      refetch()
    }
  }, [isOpen, refetch])

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await updateCartItem({ cartItemId, quantity: newQuantity }).unwrap()
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Failed to update quantity. Please try again.')
    }
  }

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItem({ cartItemId }).unwrap()
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Failed to remove item. Please try again.')
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return
    }
    
    try {
      await clearCart().unwrap()
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Failed to clear cart. Please try again.')
    }
  }

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[70] transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="text-purple-600" size={24} />
            <h2 className="text-lg font-semibold text-gray-800">Your Cart</h2>
            {cart?.items?.length > 0 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {cart.items.reduce((total, item) => total + item.quantity, 0)} items
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full bg-white">
          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">
                Error loading cart. Please try again.
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some products to get started</p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex space-x-3 p-3 border border-gray-200 rounded-lg bg-white">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <ShoppingBag size={24} className="text-gray-400 hidden" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Rs. {item.price?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Seller: {item.Seller?.storeName || 'Unknown Seller'}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-purple-600">
                            Rs. {((item.price || 0) * item.quantity).toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Only show if cart has items */}
          {(cart?.items?.length > 0) && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-white">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs. {(cart.cartTotal || 0).toLocaleString()}</span>
                </div>
                {(cart.discount > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600 font-medium">- Rs. {(cart.discount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-purple-600">Rs. {(cart.finalTotal || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    window.location.href = '/user/user-orders'
                  }}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={handleClearCart}
                  className="w-full border border-red-500 text-red-500 py-2 px-4 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartSidebar