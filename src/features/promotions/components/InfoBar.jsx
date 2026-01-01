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
    title: "Global Export",
    subtitle: "Bulk & Retail",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    icon: FaThumbsUp,
    title: "Quality Assured",
    subtitle: "Farm Verified",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    icon: FaPhoneAlt,
    title: "Buyer Support",
    subtitle: "B2B & B2C",
    color: "text-lime-500",
    bgColor: "bg-lime-50",
    borderColor: "border-lime-200"
  },
  {
    icon: FaHeart,
    title: "Trusted Farms",
    subtitle: "Direct Sourcing",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    icon: FaShieldAlt,
    title: "Secure Trade",
    subtitle: "Safe Payments",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    icon: FaGift,
    title: "Seasonal Supply",
    subtitle: "Fresh Harvest",
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
    <div className="bg-gradient-to-r from-green-700 to-emerald-800 border-t border-b border-green-600 py-3 sm:py-4 md:py-6 shadow-sm">
      <motion.div 
        className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        {/* Mobile: All 6 in one fixed row */}
        <div className="flex md:hidden justify-between items-center gap-1.5">
          {infoBarItems.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={idx}
                className="flex-1 min-w-0 flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                variants={itemVariants}
                whileHover="hover"
              >
                <div className="relative mb-1 sm:mb-1.5">
                  <IconComponent 
                    className="text-white text-sm sm:text-base md:text-lg z-10 relative transition-colors duration-300 group-hover:scale-110 group-hover:text-yellow-300" 
                  />
                  <div className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-yellow-400/30"></div>
                </div>
                <h3 className="font-bold text-white text-[10px] sm:text-xs leading-tight text-center group-hover:text-yellow-300 transition-colors truncate w-full px-0.5">
                  {item.title}
                </h3>
                <p className="text-green-100 text-[9px] sm:text-[10px] leading-tight text-center group-hover:text-white transition-colors truncate w-full px-0.5">
                  {item.subtitle}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 lg:gap-6">
          {infoBarItems.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={idx}
                className="flex flex-col items-center p-3 lg:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                variants={itemVariants}
                whileHover="hover"
              >
                <div className="relative mb-2 lg:mb-3">
                  <IconComponent 
                    className="text-white text-2xl lg:text-3xl z-10 relative transition-colors duration-300 group-hover:scale-110 group-hover:text-yellow-300" 
                  />
                  <div className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-yellow-400/30"></div>
                </div>
                <h3 className="font-bold text-white text-sm lg:text-base mb-1 text-center leading-tight group-hover:text-yellow-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-green-100 text-xs lg:text-sm leading-tight text-center group-hover:text-white transition-colors">
                  {item.subtitle}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
