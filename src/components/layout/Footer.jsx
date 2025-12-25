// src/components/Layout/Footer.jsx
'use client'

import { useState } from 'react';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaCcVisa, 
  FaCcMastercard, 
  FaCcAmex, 
  FaCcPaypal, 
  FaCcStripe, 
  FaGooglePay, 
  FaApplePay,
  FaHeart,
  FaRocket,
  FaTiktok
} from "react-icons/fa";
import { 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Crown,
  Globe,
  Smartphone,
  Truck,
  Shield,
  BadgeCheck,
  HeadphonesIcon
} from "lucide-react";
import Link from 'next/link'
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerSections = [
    {
      title: "Discover MOH Capital",
      links: [
        { name: "About Us", href: "/contact-about" },
        { name: "Our Story", href: "/our-partners" },
        { name: "Discover MOH Capital", href: "/faq" },
      ]
    },
    {
      title: "Shop With Confidence",
      links: [
        { name: "Most Loved Products", href: "/MostLikedProducts" },
        { name: "Featured Collections", href: "/Products" },
        { name: "Hot Sales", href: "/hotsales" },
        { name: "New Arrivals", href: "/Products" },
      ]
    },
    {
      title: "Seller Hub",
      links: [
        { name: "Become a Seller", href: "/become-seller" },
        { name: "Partner Program", href: "/our-partners" },
      ]
    },
    {
      title: "Support & Help",
      links: [
        { name: "FAQs", href: "/faq" },
        { name: "Contact Support", href: "/contact-about" },
      ]
    }
  ];

  const trustFeatures = [
    { icon: Shield, text: "100% Secure Payments" },
    { icon: Truck, text: "Free Shipping Over ₨2000" },
    { icon: BadgeCheck, text: "Verified Sellers" },
    { icon: HeadphonesIcon, text: "24/7 Support" },
  ];

  return (
    <footer className="relative bg-gradient-to-r from-green-700 to-emerald-800 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px),
                           linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Trust Banner */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.text}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 text-sm"
                >
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Icon className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-white/80 font-medium">{feature.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="relative w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                <img
                  src="/mohcapitallogo.webp"
                  alt="Bustard Logo"
                  className="w-10 h-10 rounded-xl object-cover"
                  loading="lazy"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-sm opacity-50 -z-10"></div>
              </div>
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                  MOHCapital
                </h2>
                <p className="text-sm text-green-200 font-medium">Next-Gen E-Commerce</p>
              </div>
            </div>

            <p className="text-white/70 mb-6 leading-relaxed text-sm text-center sm:text-left">
              Pakistan's premier multi-vendor marketplace connecting buyers with trusted sellers. 
              Experience seamless shopping with premium products and exceptional service.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-6">
              {[
                { icon: FaFacebookF, href: "https://www.facebook.com/", color: "hover:text-blue-400" },
                { icon: FaTwitter, href: "https://twitter.com/yourprofile", color: "hover:text-cyan-400" },
                { icon: FaInstagram, href: "https://www.instagram.com/", color: "hover:text-pink-400" },
                { icon: FaYoutube, href: "https://www.youtube.com/", color: "hover:text-red-400" },
                { icon: FaTiktok, href: "https://www.tiktok.com/", color: "hover:text-purple-400" },
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-300 text-white/70 ${social.color} hover:bg-white/20 hover:shadow-lg`}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>

            {/* App Coming Soon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 px-4 py-2 rounded-2xl backdrop-blur-sm mx-auto sm:mx-0"
            >
              <FaRocket className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-bold">App Coming Soon</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>
          </motion.div>

          {/* Navigation Links */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: sectionIndex * 0.1 + 0.2 }}
              className="text-center sm:text-left"
            >
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05) + 0.3 }}
                  >
                    <Link 
                      href={link.href}
                      className="text-white/60 hover:text-amber-300 transition-all duration-300 hover:translate-x-1 flex items-center justify-center sm:justify-start gap-1 group text-sm"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 text-amber-300" />
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter Section */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 md:col-span-2"
          >
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <Mail className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-white text-lg">Stay in the Loop</h3>
              </div>
              
              <p className="text-white/70 mb-4 text-sm leading-relaxed">
                Get exclusive deals, product launches, and insider updates delivered straight to your inbox.
              </p>

              {isSubscribed ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-amber-300">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="font-bold">Welcome to the MOH Capital Family!</span>
                  </div>
                  <p className="text-amber-200 text-sm mt-1">
                    You'll receive your first update shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Subscribe Now
                  </motion.button>
                </form>
              )}

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-white/80 font-bold text-sm">Secure Payments Coming soon</span>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  {[
                    { icon: FaCcVisa, name: "Visa" },
                    { icon: FaCcMastercard, name: "Mastercard" },
                    { icon: FaCcAmex, name: "Amex" },
                    { icon: FaCcPaypal, name: "PayPal" },
                    { icon: FaCcStripe, name: "Stripe" },
                    { icon: FaGooglePay, name: "Google Pay" },
                    { icon: FaApplePay, name: "Apple Pay" },
                  ].map((payment, index) => {
                    const Icon = payment.icon;
                    return (
                      <motion.div
                        key={payment.name}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="p-2 bg-white/5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                      >
                        <Icon className="w-6 h-6 text-white/70 hover:text-amber-300" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-white/10 mt-12 pt-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center">
            {/* Copyright */}
            <div className="text-white/50 text-sm">
              <p>© {new Date().getFullYear()} MOH Capital. All rights reserved.</p>
            </div>

            {/* Development Credit */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl hover:border-amber-500/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <Globe className="w-3 h-3 text-amber-300" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}