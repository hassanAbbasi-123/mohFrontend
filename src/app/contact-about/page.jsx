"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Users, Target, Rocket, Heart, Shield, Zap, Globe, Award } from "lucide-react";
import Link from "next/link";
import { useCreateContactMutation } from '@/store/features/contactApi'; 
export default function ContactAboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createContact] = useCreateContactMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('All fields are required');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const response = await createContact(formData).unwrap();
      if (response.success) {
        alert("Thank you for your message! We'll get back to you within 24 hours.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      alert("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  const values = [
    {
      icon: <Users className="w-6 sm:w-8 h-6 sm:h-8" />,
      title: "Community First",
      description: "Building a platform that serves and empowers local farmers, suppliers, and international buyers alike."
    },
    {
      icon: <Target className="w-6 sm:w-8 h-6 sm:h-8" />,
      title: "Excellence",
      description: "Striving for the highest standards in agricultural export quality, service, and user experience."
    },
    {
      icon: <Shield className="w-6 sm:w-8 h-6 sm:h-8" />,
      title: "Trust & Security",
      description: "Creating a safe and reliable environment for all export transactions and interactions."
    },
    {
      icon: <Zap className="w-6 sm:w-8 h-6 sm:h-8" />,
      title: "Innovation",
      description: "Continuously evolving with cutting-edge technology for efficient global agricultural trade."
    }
  ];

  const stats = [
    { number: "100+", label: "Active Exporters" },
    { number: "5K+", label: "Satisfied Buyers" },
    { number: "10K+", label: "Products Exported" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20 sm:py-28 px-4 sm:px-6 text-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl hidden sm:block"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl hidden sm:block"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl hidden sm:block"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-white/20">
            <Rocket className="w-4 h-4" />
            <span>Building India's Premier Agricultural Export Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">MOH Capital Overseas</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-6 sm:mb-8">
            Empowering Indian agriculture, transforming global trade, and building the future of premium produce exports
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          
            <Link href="/register" >
            <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm">
              Join Our Journey
            </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="text-xl sm:text-2xl font-bold">{stat.number}</span>
                </div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            {/* Content */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  The MOH Capital <span className="text-blue-600">Vision</span>
                </h2>
                
                <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
                  <p className="bg-blue-50 rounded-2xl p-4 sm:p-6 border-l-4 border-blue-500">
                    <strong className="text-blue-600">MOH Capital Overseas</strong> is an ambitious initiative launched by visionary entrepreneur{" "}
                    <span className="font-bold text-gray-900">Md. Tajim Shaikh</span>, who envisions building a specialized B2B export marketplace that stands as India's premier platform for premium agricultural products like fresh garlic and onions.
                  </p>
                  
                  <p>
                    We are driven by a simple yet powerful idea: <strong>empower exporters of all sizes</strong> while giving international buyers a seamless trading experience they can trust. MOH Capital Overseas is not just a platform—it's a movement to support Indian agriculture, enhance global exports, and ultimately create an ecosystem where innovation and opportunity thrive together in the international market.
                  </p>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-purple-100">
                    <p className="text-purple-700 font-semibold text-sm sm:text-base">
                      Our team is passionate about building technology that serves the agricultural sector. Though young, with vision, dedication, and community support, we aim to become a global name in Indian agricultural exports.
                    </p>
                  </div>
                </div>
              </div>

              {/* Founder Highlight */}
              <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-4 sm:p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">Md. Tajim Shaikh</h3>
                    <p className="text-blue-200 text-sm sm:text-base">Founder & Visionary</p>
                  </div>
                </div>
                <p className="text-blue-100 text-sm sm:text-base">
                  "We're not just building a platform; we're building dreams and creating opportunities for every Indian agricultural exporter."
                </p>
              </div>
            </div>

            {/* Visual Section */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="text-center mb-6">
                  <Globe className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Our Mission</h3>
                  <p className="text-blue-100 text-sm sm:text-base">
                    To democratize agricultural exports and make global trading accessible to every Indian farmer and supplier
                  </p>
                </div>
                
                <img
                  src="mohcapitallogo.webp"
                  alt="MOH Capital Team"
                  className="rounded-2xl shadow-lg w-full h-48 sm:h-64 object-cover"
                />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse hidden sm:block"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse hidden sm:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Core <span className="text-blue-600">Values</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make and every feature we build
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <div key={index} className="group text-center">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-blue-300 transition-all duration-500 h-full transform hover:-translate-y-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Get in <span className="text-blue-600">Touch</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Have questions, suggestions, or want to collaborate? We're here to help you succeed and grow with MOH Capital Overseas.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Email Us</h3>
                    <a href="mailto:mohcapitaloverseas@gmail.com" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
                      mohcapitaloverseas@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Call Us</h3>
                    <p className="text-gray-600 text-sm sm:text-base">+91 96476 24282</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Visit Us</h3>
                    <p className="text-gray-600 text-sm sm:text-base">India</p>
                  </div>
                </div>
              </div>

              {/* Support Note */}
              <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 text-base sm:text-lg">Dedicated Support</h4>
                </div>
                <p className="text-blue-700 text-xs sm:text-sm">
                  Our team typically responds within 2-4 hours during business days. We're committed to providing you with the best possible support.
                </p>
              </div>
            </div>

            {/* Enhanced Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Send us a Message
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows="4 sm:rows-5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-8 sm:py-12">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
  <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
    <div className="relative">
      {/* Subtle glowing background circle to blend with blue footer */}
      <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl scale-150"></div>
      {/* Main logo container */}
      <div className="relative bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-full border border-white/20 shadow-2xl">
        <img 
          src="/mohcapitallogo.webp" 
          alt="MOH Capital Logo" 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain rounded-full"
        />
      </div>
    </div>
    <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">MOH Capital Overseas</span>
  </div>
  
  <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
    India's Premier B2B Export Platform — Connecting Premium Fresh Garlic & Onions to the World
  </p>
  
  <p className="text-gray-400 text-xs sm:text-sm">
    © {new Date().getFullYear()} MOH Capital Overseas. Proudly Built in India with Passion & Purpose.
  </p>
</div>
</footer>
    </div>
  );
}