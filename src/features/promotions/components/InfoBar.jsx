'use client'

import {
  FaShippingFast,
  FaThumbsUp,
  FaPhoneAlt,
  FaHeart,
  FaShieldAlt,
  FaGift,
} from "react-icons/fa"
import { motion } from "framer-motion"

const infoBarItems = [
  {
    icon: FaShippingFast,
    title: "Fast, Free Shipping",
    subtitle: "On orders over $50",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    icon: FaThumbsUp,
    title: "60-Day Free Returns",
    subtitle: "All shipping methods",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    icon: FaPhoneAlt,
    title: "Expert Customer Service",
    subtitle: "Choose chat or call us",
    color: "text-lime-500",
    bgColor: "bg-lime-50",
    borderColor: "border-lime-200"
  },
  {
    icon: FaHeart,
    title: "Exclusive Brands",
    subtitle: "More exclusive products",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    icon: FaShieldAlt,
    title: "Secure Payments",
    subtitle: "SSL encryption guaranteed",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    icon: FaGift,
    title: "Special Offers",
    subtitle: "Daily deals and bundles",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
}

export default function InfoBar() {
  return (
    <div className="bg-gradient-to-r from-green-700 to-emerald-800 border-t border-b border-green-600 py-8 shadow-sm overflow-x-auto">
      <motion.div 
        className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 whitespace-nowrap sm:whitespace-normal"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 xs:gap-4 sm:gap-6 inline-grid sm:grid">
          {infoBarItems.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={idx}
                className={`flex flex-col items-center p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 min-w-[120px] sm:min-w-0 group cursor-pointer`}
                variants={itemVariants}
                whileHover="hover"
              >
                <div className="relative mb-2 xs:mb-3">
                  <IconComponent 
                    className={`text-white text-2xl xs:text-3xl z-10 relative transition-colors duration-300 group-hover:scale-110 group-hover:text-yellow-300`} 
                  />
                  <div className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-yellow-400/30"></div>
                </div>
                <h3 className="font-bold text-white text-xs xs:text-sm mb-0.5 xs:mb-1 text-center leading-tight group-hover:text-yellow-300 transition-colors">{item.title}</h3>
                <p className="text-green-100 text-[10px] xs:text-xs leading-tight text-center group-hover:text-white transition-colors">{item.subtitle}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}