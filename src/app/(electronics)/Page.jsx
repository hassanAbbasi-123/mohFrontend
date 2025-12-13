
'use client'

import { useState } from 'react'
import CartDrawer from '@/features/cart/components/CartDrawer'
import LeftSidebar from './components/LeftSidebar'
import FeaturedProductsWithSidebar from './components/FeaturedProducts';
// import PS5DiscountSection from './components/PS5DiscountSection'

import QuickViewModal from './components/QuickViewModal'

export default function Page() {
  // State management
  const [cart, setCart] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Shared function
  const addToCart = (product) => {
    setCart((prevCart) => {
      const productId = product.id || product.name
      const existingItemIndex = prevCart.findIndex(
        (item) => (item.product.id || item.product.name) === productId
      )

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        }
        return updatedCart
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
    setIsCartOpen(true)
  }

  return (
    <div className=" bg-gray-50 ">

      
      {/* Main Content */}
      <FeaturedProductsWithSidebar 
          addToCart={addToCart} 
          setQuickViewProduct={setQuickViewProduct}
        />
        
      

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        addToCart={addToCart}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  )
}